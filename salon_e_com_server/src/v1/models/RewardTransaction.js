import mongoose from 'mongoose';

const rewardTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    type: {
        type: String,
        enum: ['REWARD_EARNED', 'REWARD_REDEEMED', 'REWARD_EXPIRED', 'REWARD_LOCKED', 'REWARD_UNLOCKED'],
        required: true
    },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    timeline: [{
        status: { type: String, enum: ['PENDING', 'COMPLETED', 'CANCELLED'], required: true },
        date: { type: Date, default: Date.now },
        note: String
    }],
    description: String,
    expiresAt: Date
}, { timestamps: true });

export default mongoose.models.RewardTransaction || mongoose.model('RewardTransaction', rewardTransactionSchema);
