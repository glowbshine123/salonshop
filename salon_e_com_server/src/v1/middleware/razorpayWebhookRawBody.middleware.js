import express from 'express';

const razorpayWebhookRawBody = express.raw({
    type: 'application/json',
    limit: '1mb'
});

export default razorpayWebhookRawBody;
