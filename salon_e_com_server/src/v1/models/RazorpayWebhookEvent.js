import mongoose from 'mongoose';

const webhookEventSchema = new mongoose.Schema({
    eventId: { type: String, required: true, unique: true },
    event: { type: String, required: true },
    status: { type: String, enum: ['PROCESSING', 'PROCESSED', 'FAILED'], default: 'PROCESSING' },
    attempts: { type: Number, default: 0 },
    processingUntil: { type: Date },
    processedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.RazorpayWebhookEvent
    || mongoose.model('RazorpayWebhookEvent', webhookEventSchema);
