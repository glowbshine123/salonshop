import mongoose from 'mongoose';

const agentProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    commissionRate: { type: Number, default: 0.10 },
    wallet: {
        available: { type: Number, default: 0 }
    },
    totalEarnings: { type: Number, default: 0 },
    currentMonthEarnings: { type: Number, default: 0 },
    lastSettlementDate: { type: Date },
    razorpayContactId: { type: String },
    fundAccountId: { type: String },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        ifscCode: String,
        accountHolderName: String
    },
    upiId: { type: String },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    }
}, { timestamps: true });

// Add index for fast lookup
agentProfileSchema.index({ userId: 1 });

export default mongoose.models.AgentProfile || mongoose.model('AgentProfile', agentProfileSchema);
