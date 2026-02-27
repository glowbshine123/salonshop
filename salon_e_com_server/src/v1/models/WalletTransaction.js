import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    type: {
        type: String,
        enum: ['COMMISSION_PENDING', 'COMMISSION_AVAILABLE', 'REWARD_LOCKED', 'REWARD_UNLOCKED', 'REWARD_REDEEMED', 'REWARD_EARNED', 'REWARD_EXPIRED', 'PAYOUT_REQUEST', 'PAYOUT_APPROVED', 'PAYOUT_REJECTED', 'MONTHLY_DISBURSEMENT'],
        required: true
    },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    expiresAt: { type: Date },
    description: String
}, { timestamps: true });

export default mongoose.model('WalletTransaction', walletTransactionSchema);
