import crypto from 'node:crypto';

export const SUPPORTED_RAZORPAY_WEBHOOK_EVENTS = Object.freeze([
    'payment.authorized',
    'payment.captured',
    'payment.failed',
    'order.paid',
    'refund.processed',
    'refund.failed',
    'payout.processed',
    'payout.failed',
    'payout.rejected',
    'payout.reversed'
]);

export const verifyRazorpayWebhookSignature = (rawBody, signature, secret) => {
    if (!Buffer.isBuffer(rawBody) || !signature || !secret || !/^[a-f0-9]{64}$/i.test(signature)) {
        return false;
    }

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest();
    const supplied = Buffer.from(signature, 'hex');
    return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
};

export const getRazorpayWebhookEventId = (body, rawBody) => {
    if (body.id && typeof body.id === 'string') {
        return body.id;
    }
    return `sha256:${crypto.createHash('sha256').update(rawBody).digest('hex')}`;
};

export const matchesRazorpayPaymentAmount = (order, amount, currency) => (
    Number.isSafeInteger(amount)
    && amount === Math.round(Number(order.total) * 100)
    && (!currency || currency === (order.currency || 'INR'))
);

export const getRefundedPaymentStatus = (refundedAmount, orderTotal) => (
    refundedAmount >= Math.round(Number(orderTotal) * 100)
        ? 'REFUNDED'
        : 'PARTIALLY_REFUNDED'
);
