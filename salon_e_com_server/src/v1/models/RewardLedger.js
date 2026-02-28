import mongoose from 'mongoose';

const rewardLedgerSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true }, // The order where points were earned

    pointsEarned: { type: Number, required: true },
    pointsRemaining: { type: Number, required: true }, // Decreases as points are redeemed or expired

    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'FULLY_REDEEMED', 'EXPIRED', 'CANCELLED'],
        default: 'PENDING'
    },

    expiresAt: { type: Date, required: true },
    activatedAt: { type: Date }, // Date when status became ACTIVE (usually delivery date)

}, { timestamps: true });

// Index for efficient expiry checking and user balance lookups
rewardLedgerSchema.index({ userId: 1, status: 1, expiresAt: 1 });

export default mongoose.models.RewardLedger || mongoose.model('RewardLedger', rewardLedgerSchema);
