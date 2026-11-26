import Settlement from '../models/Settlement.js';
import CommissionTransaction from '../models/CommissionTransaction.js';
import AgentProfile from '../models/AgentProfile.js';
import Order from '../models/Order.js';
import RazorpayWebhookEvent from '../models/RazorpayWebhookEvent.js';
import * as notificationService from '../services/notification.service.js';
import { finalizeOrder } from '../services/order.service.js';
import {
    getRefundedPaymentStatus,
    getRazorpayWebhookEventId,
    matchesRazorpayPaymentAmount,
    SUPPORTED_RAZORPAY_WEBHOOK_EVENTS,
    verifyRazorpayWebhookSignature
} from '../utils/razorpayWebhook.util.js';

const claimWebhookEvent = async (eventId, event) => {
    const now = new Date();
    const processingUntil = new Date(now.getTime() + 5 * 60 * 1000);

    try {
        return await RazorpayWebhookEvent.create({
            eventId,
            event,
            status: 'PROCESSING',
            attempts: 1,
            processingUntil
        });
    } catch (error) {
        if (error?.code !== 11000) throw error;

        const existingEvent = await RazorpayWebhookEvent.findOne({ eventId });
        if (existingEvent?.status === 'PROCESSED') return null;

        const claimedEvent = await RazorpayWebhookEvent.findOneAndUpdate(
            {
                eventId,
                status: { $ne: 'PROCESSED' },
                $or: [
                    { status: 'FAILED' },
                    { processingUntil: null },
                    { processingUntil: { $lte: now } }
                ]
            },
            {
                $set: { event, status: 'PROCESSING', processingUntil },
                $inc: { attempts: 1 }
            },
            { new: true }
        );
        if (claimedEvent) return claimedEvent;
        if (existingEvent?.status === 'PROCESSING') {
            throw new Error('Duplicate webhook is still being processed');
        }
        return null;
    }
};

const findOrderForRazorpayOrder = (razorpayOrderId) => Order.findOne({
    $or: [
        { 'paymentDetails.paymentGatewayOrderId': razorpayOrderId },
        { 'paymentDetails.razorpay_order_id': razorpayOrderId }
    ]
});

const handlePaymentEvent = async (event, payment) => {
    if (!payment?.order_id || !payment.id) {
        throw new Error('Payment entity is missing required identifiers');
    }

    const order = await findOrderForRazorpayOrder(payment.order_id);
    if (!order) {
        console.warn(`[RAZORPAY] Order not found for Razorpay order ${payment.order_id}`);
        return;
    }

    if (event === 'payment.captured'
        && !matchesRazorpayPaymentAmount(order, payment.amount, payment.currency)) {
        console.error(`[RAZORPAY] Captured payment amount/currency mismatch for order ${order.orderNumber}`);
        return;
    }

    const paymentDetails = {
        'paymentDetails.razorpay_order_id': payment.order_id,
        'paymentDetails.razorpay_payment_id': payment.id
    };

    if (event === 'payment.captured') {
        const updatedOrder = await Order.findOneAndUpdate(
            { _id: order._id, paymentStatus: { $nin: ['REFUNDED', 'CANCELLED'] } },
            {
                $set: {
                    ...paymentDetails,
                    paymentStatus: 'PAID',
                    'paymentDetails.capturedAt': new Date()
                }
            },
            { new: true }
        );
        if (!updatedOrder) {
            console.error(`[RAZORPAY] Captured payment received for closed order ${order.orderNumber}`);
            return;
        }
        if (updatedOrder.status === 'PAYMENT_PENDING') {
            await finalizeOrder(updatedOrder._id);
        }
        console.log(`[RAZORPAY] Payment captured for order ${updatedOrder.orderNumber}`);
        return;
    }

    if (event === 'payment.authorized') {
        await Order.updateOne(
            { _id: order._id, paymentStatus: { $nin: ['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELLED'] } },
            { $set: { ...paymentDetails, paymentStatus: 'AUTHORIZED' } }
        );
        console.log(`[RAZORPAY] Payment authorized for order ${order.orderNumber}`);
        return;
    }

    if (event === 'payment.failed') {
        await Order.updateOne(
            { _id: order._id, paymentStatus: { $nin: ['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELLED'] } },
            {
                $set: {
                    ...paymentDetails,
                    paymentStatus: 'FAILED',
                    'paymentDetails.failedAt': new Date(),
                    'paymentDetails.failureReason': payment.error_description || 'Payment failed'
                }
            }
        );
    }
};

const handleOrderPaidEvent = async (paidOrder) => {
    if (!paidOrder?.id) {
        throw new Error('Paid order entity is missing its identifier');
    }

    const order = await findOrderForRazorpayOrder(paidOrder.id);
    if (!order) {
        console.warn(`[RAZORPAY] Internal order not found for Razorpay order ${paidOrder.id}`);
        return;
    }
    if (!matchesRazorpayPaymentAmount(order, paidOrder.amount_paid, paidOrder.currency)) {
        console.error(`[RAZORPAY] Paid order amount/currency mismatch for order ${order.orderNumber}`);
        return;
    }
    const updatedOrder = await Order.findOneAndUpdate(
        { _id: order._id, paymentStatus: { $nin: ['REFUNDED', 'CANCELLED'] } },
        { $set: { paymentStatus: 'PAID', 'paymentDetails.razorpay_order_id': paidOrder.id } },
        { new: true }
    );
    if (updatedOrder?.status === 'PAYMENT_PENDING') {
        await finalizeOrder(updatedOrder._id);
    }
};

const handleRefundEvent = async (event, refund) => {
    if (!refund?.payment_id) {
        throw new Error('Refund entity is missing its payment identifier');
    }

    const order = await Order.findOne({
        'paymentDetails.razorpay_payment_id': refund.payment_id
    });
    if (!order) {
        console.warn(`[RAZORPAY] Order not found for refund payment ${refund.payment_id}`);
        return;
    }

    if (event === 'refund.failed') {
        order.paymentDetails = order.paymentDetails || {};
        order.paymentDetails.refundFailureReason = refund.error_description || 'Refund failed';
        await order.save();
        return;
    }

    if (!Number.isSafeInteger(refund.amount) || refund.amount <= 0) {
        throw new Error('Refund entity has an invalid amount');
    }
    if (!['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(order.paymentStatus)) {
        console.warn(`[RAZORPAY] Refund ignored for unpaid order ${order.orderNumber}`);
        return;
    }

    const updatedOrder = await Order.findOneAndUpdate(
        { _id: order._id },
        { $inc: { 'paymentDetails.refundedAmount': refund.amount } },
        { new: true }
    );
    if (!updatedOrder) {
        throw new Error(`Order disappeared while applying refund ${refund.id || ''}`);
    }

    const nextStatus = getRefundedPaymentStatus(
        updatedOrder.paymentDetails.refundedAmount,
        updatedOrder.total
    );
    if (nextStatus === 'REFUNDED') {
        await Order.updateOne(
            { _id: updatedOrder._id, paymentStatus: { $ne: 'REFUNDED' } },
            { $set: { paymentStatus: 'REFUNDED' } }
        );
    } else {
        await Order.updateOne(
            { _id: updatedOrder._id, paymentStatus: 'PAID' },
            { $set: { paymentStatus: 'PARTIALLY_REFUNDED' } }
        );
    }
};

const handlePayoutEvent = async (event, payload) => {
    const payout = payload?.payout?.entity;
    if (!payout?.id) {
        throw new Error('Payout entity is missing its identifier');
    }

    const settlement = await Settlement.findOne({ razorpayPayoutId: payout.id });
    if (!settlement) {
        console.warn(`[RAZORPAY] Settlement not found for payout ${payout.id}`);
        return;
    }

    if (event === 'payout.processed') {
        if (settlement.status === 'SUCCESS') return;

        settlement.status = 'SUCCESS';
        settlement.settledAt = new Date();
        await settlement.save();
        await CommissionTransaction.updateMany(
            { agentId: settlement.agentId, status: 'PENDING' },
            { status: 'SETTLED' }
        );
        const agentProfile = await AgentProfile.findOne({ userId: settlement.agentId });
        if (agentProfile) {
            agentProfile.currentMonthEarnings = 0;
            agentProfile.lastSettlementDate = new Date();
            await agentProfile.save();
        }
        await notificationService.createNotification({
            userId: settlement.agentId,
            title: 'Payout Successful',
            description: `Your payout of ₹${settlement.amount} has been processed successfully.`,
            type: 'PAYMENT',
            priority: 'HIGH',
            metadata: { settlementId: settlement._id }
        });
    } else if (['payout.failed', 'payout.rejected', 'payout.reversed'].includes(event)) {
        if (settlement.status === 'FAILED') return;

        settlement.status = 'FAILED';
        await settlement.save();
        await notificationService.createNotification({
            userId: settlement.agentId,
            title: 'Payout Failed',
            description: `Your payout of ₹${settlement.amount} failed. Please check your bank details.`,
            type: 'PAYMENT',
            priority: 'HIGH',
            metadata: { settlementId: settlement._id }
        });
    }
};

export const handleRazorpayWebhook = async (req, res) => {
    let webhookEvent;
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.body;

        if (!Buffer.isBuffer(rawBody)) {
            return res.status(400).json({ message: 'Raw webhook body is required' });
        }
        if (!secret) {
            console.error('[RAZORPAY] Webhook secret missing');
            return res.status(503).json({ message: 'Webhook secret not configured' });
        }
        if (!signature) {
            console.warn('[RAZORPAY] Webhook signature missing');
            return res.status(400).json({ message: 'Missing webhook signature' });
        }
        if (!verifyRazorpayWebhookSignature(rawBody, signature, secret)) {
            console.warn('[RAZORPAY] Invalid webhook signature');
            return res.status(400).json({ message: 'Invalid signature' });
        }

        let body;
        try {
            body = JSON.parse(rawBody.toString('utf8'));
        } catch {
            return res.status(400).json({ message: 'Invalid webhook JSON' });
        }

        const { event, payload } = body;
        if (!event || typeof event !== 'string') {
            return res.status(400).json({ message: 'Missing webhook event' });
        }

        const eventId = getRazorpayWebhookEventId(body, rawBody);
        webhookEvent = await claimWebhookEvent(eventId, event);
        if (!webhookEvent) {
            console.log(`[RAZORPAY] Duplicate or in-progress webhook ignored: ${eventId}`);
            return res.status(200).json({ status: 'ok', duplicate: true });
        }

        if (['payment.authorized', 'payment.captured', 'payment.failed'].includes(event)) {
            await handlePaymentEvent(event, payload?.payment?.entity);
        } else if (event === 'order.paid') {
            await handleOrderPaidEvent(payload?.order?.entity);
        } else if (['refund.processed', 'refund.failed'].includes(event)) {
            await handleRefundEvent(event, payload?.refund?.entity);
        } else if (event.startsWith('payout.')) {
            await handlePayoutEvent(event, payload);
        } else if (SUPPORTED_RAZORPAY_WEBHOOK_EVENTS.includes(event)) {
            console.log(`[RAZORPAY] No state change required for event: ${event}`);
        } else {
            console.log(`[RAZORPAY] Unsupported webhook event safely ignored: ${event}`);
        }

        webhookEvent.status = 'PROCESSED';
        webhookEvent.processingUntil = null;
        webhookEvent.processedAt = new Date();
        await webhookEvent.save();
        return res.status(200).json({ status: 'ok' });
    } catch (error) {
        if (webhookEvent) {
            webhookEvent.status = 'FAILED';
            webhookEvent.processingUntil = null;
            try {
                await webhookEvent.save();
            } catch (recordError) {
                console.error('[RAZORPAY] Failed to persist webhook failure state:', recordError.message);
            }
        }
        console.error('[RAZORPAY] Webhook processing error:', error.message);
        return res.status(500).json({ message: 'Webhook processing failed' });
    }
};
