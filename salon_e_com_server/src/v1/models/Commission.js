import mongoose from 'mongoose';

const commissionSchema = new mongoose.Schema({
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },

    orderAmount: { type: Number, required: true },
    commissionRate: { type: Number, required: true },
    amountEarned: { type: Number, required: true },

    status: {
        type: String,
        enum: ['PENDING', 'PAID'],
        default: 'PENDING'
    },
    paidAt: { type: Date }

}, { timestamps: true });

export default mongoose.models.Commission || mongoose.model('Commission', commissionSchema);
