import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import express from 'express';
import Order from '../src/v1/models/Order.js';
import RazorpayWebhookEvent from '../src/v1/models/RazorpayWebhookEvent.js';
import { handleRazorpayWebhook } from '../src/v1/controllers/webhook.controller.js';
import razorpayWebhookRawBody from '../src/v1/middleware/razorpayWebhookRawBody.middleware.js';

const webhookSecret = 'controller-test-secret';
const events = new Map();
let activeOrder;
let failEventWrites = false;
let orderSaveCount = 0;

const originalEventCreate = RazorpayWebhookEvent.create;
const originalEventFindOne = RazorpayWebhookEvent.findOne;
const originalEventFindOneAndUpdate = RazorpayWebhookEvent.findOneAndUpdate;
const originalOrderFindOne = Order.findOne;
const originalOrderFindOneAndUpdate = Order.findOneAndUpdate;
const originalOrderUpdateOne = Order.updateOne;

RazorpayWebhookEvent.create = async (data) => {
    if (failEventWrites) throw new Error('test database unavailable');
    if (events.has(data.eventId)) {
        const error = new Error('duplicate key');
        error.code = 11000;
        throw error;
    }

    const record = {
        ...data,
        save: async function () {
            events.set(this.eventId, this);
            return this;
        }
    };
    events.set(record.eventId, record);
    return record;
};

RazorpayWebhookEvent.findOne = async ({ eventId }) => events.get(eventId) || null;
RazorpayWebhookEvent.findOneAndUpdate = async ({ eventId }) => {
    const record = events.get(eventId);
    if (!record || record.status === 'PROCESSED' || record.status === 'PROCESSING') return null;
    record.status = 'PROCESSING';
    record.attempts += 1;
    return record;
};

Order.findOne = async () => activeOrder;
const queryAllowsPaymentUpdate = (query) => {
    const condition = query?.paymentStatus;
    if (condition?.$nin?.includes(activeOrder.paymentStatus)) return false;
    if (typeof condition === 'string' && condition !== activeOrder.paymentStatus) return false;
    return true;
};
const applyUpdate = (update) => {
    if (update.$inc) {
        activeOrder.paymentDetails.refundedAmount += update.$inc['paymentDetails.refundedAmount'];
    }
    if (update.$set) {
        for (const [path, value] of Object.entries(update.$set)) {
            const parts = path.split('.');
            const field = parts.pop();
            const target = parts.reduce((result, part) => result[part], activeOrder);
            target[field] = value;
        }
    }
};
Order.findOneAndUpdate = async (query, update) => {
    if (!queryAllowsPaymentUpdate(query)) return null;
    applyUpdate(update);
    return activeOrder;
};
Order.updateOne = async (query, update) => {
    if (!queryAllowsPaymentUpdate(query)) return { modifiedCount: 0 };
    applyUpdate(update);
    return { modifiedCount: 1 };
};

after(() => {
    RazorpayWebhookEvent.create = originalEventCreate;
    RazorpayWebhookEvent.findOne = originalEventFindOne;
    RazorpayWebhookEvent.findOneAndUpdate = originalEventFindOneAndUpdate;
    Order.findOne = originalOrderFindOne;
    Order.findOneAndUpdate = originalOrderFindOneAndUpdate;
    Order.updateOne = originalOrderUpdateOne;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
});

const makeOrder = (overrides = {}) => ({
    _id: 'internal-order-1',
    orderNumber: 'ORD-test',
    total: 10,
    currency: 'INR',
    status: 'PROCESSING',
    paymentStatus: 'UNPAID',
    paymentDetails: {
        paymentGatewayOrderId: 'order_test_1',
        razorpay_payment_id: 'pay_test_1',
        refundedAmount: 0
    },
    save: async () => {
        orderSaveCount += 1;
    },
    ...overrides
});

const invokeWebhook = async (event, { signatureBody, rawBody } = {}) => {
    const body = rawBody || Buffer.from(JSON.stringify(event));
    const signature = signatureBody
        ? crypto.createHmac('sha256', webhookSecret).update(signatureBody).digest('hex')
        : crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
    const response = {
        statusCode: 0,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(value) {
            this.body = value;
            return this;
        }
    };

    process.env.RAZORPAY_WEBHOOK_SECRET = webhookSecret;
    await handleRazorpayWebhook({
        body,
        headers: { 'x-razorpay-signature': signature }
    }, response);
    return response;
};

test('rejects invalid and altered signatures before recording events', async () => {
    events.clear();
    const event = {
        id: 'evt_invalid',
        event: 'payment.captured',
        payload: { payment: { entity: { id: 'pay_test_1', order_id: 'order_test_1', amount: 1000, currency: 'INR' } } }
    };
    const alteredPayload = await invokeWebhook(event, { signatureBody: Buffer.from('different body') });

    assert.equal(alteredPayload.statusCode, 400);
    assert.equal(events.size, 0);
});

test('updates payment status for a captured event and ignores duplicate delivery', async () => {
    events.clear();
    activeOrder = makeOrder();
    orderSaveCount = 0;
    const event = {
        id: 'evt_captured',
        event: 'payment.captured',
        payload: {
            payment: {
                entity: {
                    id: 'pay_test_1',
                    order_id: 'order_test_1',
                    amount: 1000,
                    currency: 'INR'
                }
            }
        }
    };

    const first = await invokeWebhook(event);
    const savesAfterFirst = orderSaveCount;
    const duplicate = await invokeWebhook(event);

    assert.equal(first.statusCode, 200);
    assert.equal(activeOrder.paymentStatus, 'PAID');
    assert.equal(duplicate.statusCode, 200);
    assert.equal(duplicate.body.duplicate, true);
    assert.equal(orderSaveCount, savesAfterFirst);
});

test('does not acknowledge an event that another worker is still processing', async () => {
    events.clear();
    events.set('evt_in_progress', {
        eventId: 'evt_in_progress',
        status: 'PROCESSING',
        processingUntil: new Date(Date.now() + 60_000)
    });
    activeOrder = makeOrder();
    const response = await invokeWebhook({
        id: 'evt_in_progress',
        event: 'payment.failed',
        payload: {
            payment: {
                entity: {
                    id: 'pay_test_1',
                    order_id: 'order_test_1'
                }
            }
        }
    });

    assert.equal(response.statusCode, 500);
    assert.equal(activeOrder.paymentStatus, 'UNPAID');
});

test('records failed payment status without confirming the order', async () => {
    events.clear();
    activeOrder = makeOrder({ status: 'PAYMENT_PENDING' });
    const response = await invokeWebhook({
        id: 'evt_failed',
        event: 'payment.failed',
        payload: {
            payment: {
                entity: {
                    id: 'pay_test_1',
                    order_id: 'order_test_1',
                    error_description: 'Payment declined'
                }
            }
        }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(activeOrder.paymentStatus, 'FAILED');
    assert.equal(activeOrder.status, 'PAYMENT_PENDING');
});

test('does not let a delayed failure event downgrade a captured payment', async () => {
    events.clear();
    activeOrder = makeOrder({ paymentStatus: 'PAID' });
    const response = await invokeWebhook({
        id: 'evt_delayed_failure',
        event: 'payment.failed',
        payload: {
            payment: {
                entity: {
                    id: 'pay_test_1',
                    order_id: 'order_test_1',
                    error_description: 'Delayed failure'
                }
            }
        }
    });

    assert.equal(response.statusCode, 200);
    assert.equal(activeOrder.paymentStatus, 'PAID');
});

test('updates partial and full refund payment status', async () => {
    events.clear();
    activeOrder = makeOrder({ paymentStatus: 'PAID' });

    const refundEvent = (id, amount) => ({
        id,
        event: 'refund.processed',
        payload: { refund: { entity: { id: `rfnd_${id}`, payment_id: 'pay_test_1', amount } } }
    });

    const partial = await invokeWebhook(refundEvent('evt_refund_1', 400));
    assert.equal(partial.statusCode, 200);
    assert.equal(activeOrder.paymentStatus, 'PARTIALLY_REFUNDED');

    const full = await invokeWebhook(refundEvent('evt_refund_2', 600));
    assert.equal(full.statusCode, 200);
    assert.equal(activeOrder.paymentStatus, 'REFUNDED');
    assert.equal(activeOrder.paymentDetails.refundedAmount, 1000);
});

test('returns an error when persistence fails instead of acknowledging success', async () => {
    events.clear();
    failEventWrites = true;
    const response = await invokeWebhook({
        id: 'evt_db_failure',
        event: 'unknown.event',
        payload: {}
    });
    failEventWrites = false;

    assert.equal(response.statusCode, 500);
    assert.equal(response.body.status, undefined);
});

test('preserves the original HTTP body bytes through the webhook route middleware', async () => {
    events.clear();
    const app = express();
    app.use('/api/v1/payments/webhook', razorpayWebhookRawBody);
    app.use(express.json());
    app.post('/api/v1/payments/webhook', handleRazorpayWebhook);
    const server = await new Promise((resolve) => {
        const listeningServer = app.listen(0, '127.0.0.1', () => resolve(listeningServer));
    });

    try {
        const rawBody = Buffer.from('{ "id": "evt_raw_http", "event": "unknown.event", "payload": {} }');
        const signature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
        const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1/payments/webhook`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-razorpay-signature': signature
            },
            body: rawBody
        });

        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { status: 'ok' });
        assert.equal(events.get('evt_raw_http').status, 'PROCESSED');
    } finally {
        await new Promise((resolve, reject) => {
            server.close((error) => error ? reject(error) : resolve());
        });
    }
});
