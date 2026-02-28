import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    type: {
        type: String,
        enum: ['COMMISSION_EARNED', 'MONTHLY_DISBURSEMENT', 'COMMISSION_PENDING', 'COMMISSION_AVAILABLE'],
        required: true
    },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
        default: 'PENDING'
    },
    description: String
}, { timestamps: true });

export default mongoose.models.WalletTransaction || mongoose.model('WalletTransaction', walletTransactionSchema);
