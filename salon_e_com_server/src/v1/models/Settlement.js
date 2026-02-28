import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema({
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true }, // YYYY-MM
    amount: { type: Number, required: true },
    totalOrders: { type: Number, default: 0 },
    totalCommissions: { type: Number, default: 0 },
    razorpayPayoutId: { type: String },
    setid: { type: String },
    settledAt: { type: Date },
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REJECTED'],
        default: 'PENDING'
    }
}, { timestamps: true });

// Pre-save hook to generate setid if not present
settlementSchema.pre('save', function (next) {
    if (!this.setid && this._id) {
        this.setid = `SET-${this._id.toString().slice(-8).toUpperCase()}`;
    }
    next();
});

// Ensure idempotency: one agent per month
settlementSchema.index({ agentId: 1, month: 1 }, { unique: true });

export default mongoose.models.Settlement || mongoose.model('Settlement', settlementSchema);
