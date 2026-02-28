import mongoose from 'mongoose';

const commissionTransactionSchema = new mongoose.Schema({
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true }, // YYYY-MM
    status: {
        type: String,
        enum: ['PENDING', 'SETTLED'],
        default: 'PENDING'
    }
}, { timestamps: true });

export default mongoose.models.CommissionTransaction || mongoose.model('CommissionTransaction', commissionTransactionSchema);
