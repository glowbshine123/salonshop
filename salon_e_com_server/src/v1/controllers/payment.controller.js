import razorpay from '../../config/razorpay.js';
import crypto from 'crypto';
import Order from '../models/Order.js';
import { finalizeOrder } from '../services/order.service.js';

export const createRazorpayOrder = async (req, res) => {
    try {
        const { currency = 'INR', receipt, orderId } = req.body;

        if (!razorpay || razorpay.isEnabled === false) {
            console.warn('[payment] Razorpay is not configured.');
            return res.status(503).json({ message: 'Payment gateway not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' });
        }

        if (!orderId) {
            return res.status(400).json({ message: 'orderId is required' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.customerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to pay for this order' });
        }
        if (order.status !== 'PAYMENT_PENDING' || order.paymentStatus === 'PAID') {
            return res.status(409).json({ message: 'This order is not awaiting payment' });
        }

        const trustedAmount = Math.round(Number(order.total) * 100);
        if (!Number.isInteger(trustedAmount) || trustedAmount <= 0) {
            return res.status(400).json({ message: 'Invalid order amount' });
        }

        const options = {
            amount: trustedAmount,
            currency: order.currency || currency,
            receipt: receipt || order.orderNumber,
        };

        const response = await razorpay.orders.create(options);
        order.paymentDetails = order.paymentDetails || {};
        order.paymentDetails.paymentGatewayOrderId = response.id;
        await order.save();

        res.status(200).json({
            id: response.id,
            currency: response.currency,
            amount: response.amount,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('[payment] Razorpay SDK Error:', error);
        if (error.error) console.error('[payment] Error Detail:', error.error);

        res.status(500).json({
            message: 'Razorpay order creation failed',
            error: error.message,
            detail: error.error ? error.error.description : null
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
            return res.status(400).json({ message: 'Payment verification fields are required', status: 'failure' });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.warn('[payment] Razorpay secret missing; cannot verify signature.');
            return res.status(503).json({ message: 'Payment verification not configured (missing RAZORPAY_KEY_SECRET).' });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found', status: 'failure' });
        }
        if (order.customerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to verify this payment', status: 'failure' });
        }
        if (order.paymentDetails?.paymentGatewayOrderId !== razorpay_order_id) {
            return res.status(400).json({ message: 'Payment order does not match this order', status: 'failure' });
        }

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        const supplied = Buffer.from(String(razorpay_signature));
        const expected = Buffer.from(expectedSign);
        const signatureValid = supplied.length === expected.length
            && crypto.timingSafeEqual(supplied, expected);

        if (!signatureValid) {
            console.warn('[payment] Invalid signature');
            order.paymentStatus = 'FAILED';
            order.paymentDetails = order.paymentDetails || {};
            order.paymentDetails.failureReason = 'Invalid payment signature';
            await order.save();
            return res.status(400).json({ message: 'Invalid signature', status: 'failure' });
        }

        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        if (payment.order_id !== razorpay_order_id) {
            return res.status(400).json({ message: 'Payment is not linked to the Razorpay order', status: 'failure' });
        }
        if (payment.status !== 'captured' && payment.status !== 'authorized') {
            order.paymentStatus = 'FAILED';
            order.paymentDetails = order.paymentDetails || {};
            order.paymentDetails.failureReason = `Razorpay payment status: ${payment.status}`;
            await order.save();
            return res.status(400).json({ message: 'Payment has not been captured', status: 'failure' });
        }
        if (Number(payment.amount) !== Math.round(Number(order.total) * 100)) {
            return res.status(400).json({ message: 'Payment amount mismatch', status: 'failure' });
        }

        if (payment.status === 'authorized') {
            order.paymentStatus = 'AUTHORIZED';
            order.paymentDetails = order.paymentDetails || {};
            order.paymentDetails.razorpay_order_id = razorpay_order_id;
            order.paymentDetails.razorpay_payment_id = razorpay_payment_id;
            order.paymentDetails.signatureVerified = true;
            await order.save();
            return res.status(202).json({
                message: 'Payment signature verified; capture is pending',
                status: 'authorized'
            });
        }

        order.paymentStatus = 'PAID';
        order.paymentDetails = order.paymentDetails || {};
        order.paymentDetails.razorpay_order_id = razorpay_order_id;
        order.paymentDetails.razorpay_payment_id = razorpay_payment_id;
        order.paymentDetails.razorpay_signature = razorpay_signature;
        order.paymentDetails.signatureVerified = true;
        order.paymentDetails.capturedAt = payment.status === 'captured' ? new Date() : undefined;
        await order.save();

        await finalizeOrder(orderId);
        console.log(`[RAZORPAY] Payment verified for order ${order.orderNumber}`);
        return res.status(200).json({ message: 'Payment verified successfully', status: 'success' });
    } catch (error) {
        console.error('Verification Error:', error);
        res.status(500).json({ message: error.message });
    }
};


