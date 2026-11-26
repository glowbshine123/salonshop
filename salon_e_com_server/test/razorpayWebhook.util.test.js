import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
    getRefundedPaymentStatus,
    getRazorpayWebhookEventId,
    matchesRazorpayPaymentAmount,
    SUPPORTED_RAZORPAY_WEBHOOK_EVENTS,
    verifyRazorpayWebhookSignature
} from '../src/v1/utils/razorpayWebhook.util.js';

const secret = 'local-test-webhook-secret';
const rawBody = Buffer.from('{"event":"payment.captured","id":"evt_test_1"}');
const signature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

test('accepts a valid signature for the exact raw payload', () => {
    assert.equal(verifyRazorpayWebhookSignature(rawBody, signature, secret), true);
});

test('rejects altered payloads, malformed signatures, and missing secrets', () => {
    assert.equal(verifyRazorpayWebhookSignature(Buffer.from(`${rawBody.toString()} `), signature, secret), false);
    assert.equal(verifyRazorpayWebhookSignature(rawBody, 'invalid', secret), false);
    assert.equal(verifyRazorpayWebhookSignature(rawBody, signature, ''), false);
});

test('uses Razorpay event ID and hashes raw payload when the ID is absent', () => {
    assert.equal(getRazorpayWebhookEventId({ id: 'evt_test_1' }, rawBody), 'evt_test_1');
    assert.match(getRazorpayWebhookEventId({}, rawBody), /^sha256:[a-f0-9]{64}$/);
});

test('matches server-side order amount/currency and detects partial/full refunds', () => {
    const order = { total: 25.5, currency: 'INR' };
    assert.equal(matchesRazorpayPaymentAmount(order, 2550, 'INR'), true);
    assert.equal(matchesRazorpayPaymentAmount(order, 2500, 'INR'), false);
    assert.equal(matchesRazorpayPaymentAmount(order, 2550, 'USD'), false);
    assert.equal(getRefundedPaymentStatus(1000, order.total), 'PARTIALLY_REFUNDED');
    assert.equal(getRefundedPaymentStatus(2550, order.total), 'REFUNDED');
});

test('lists only webhook events this application processes or intentionally acknowledges', () => {
    assert.deepEqual(SUPPORTED_RAZORPAY_WEBHOOK_EVENTS, [
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
});
