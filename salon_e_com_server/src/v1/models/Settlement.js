import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema({
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, // YYYY-MM
    amount: { type: Number, required: true },
    totalOrders: { type: Number, default: 0 },
    totalCommissions: { type: Number, default: 0 },
    razorpayPayoutId: { type: String },
    status: {
        type: String,
        enum: ['PROCESSING', 'SUCCESS', 'FAILED'],
        default: 'PROCESSING'
    }
}, { timestamps: true });

// Ensure idempotency: one agent per month
settlementSchema.index({ agentId: 1, month: 1 }, { unique: true });

export default mongoose.models.Settlement || mongoose.model('Settlement', settlementSchema);
