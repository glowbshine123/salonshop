import mongoose from 'mongoose';

const commissionSlabSchema = new mongoose.Schema({
    minAmount: { type: Number, required: false },
    maxAmount: { type: Number, required: false },
    commissionPercentage: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.CommissionSlab || mongoose.model('CommissionSlab', commissionSlabSchema);
