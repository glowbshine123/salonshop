import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'AGENT', 'SALON_OWNER'],
        default: 'SALON_OWNER'
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'REJECTED', 'DEACTIVE'],
        default: 'PENDING'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String },
    avatarUrl: { type: String },

    agentProfile: {
        commissionRate: { type: Number, default: 0.10 },
        referralCode: { type: String, unique: true, sparse: true },
        totalEarnings: { type: Number, default: 0 },
        currentMonthEarnings: { type: Number, default: 0 },
        lastSettlementDate: { type: Date },
        panCard: { type: String },
        aadharCard: { type: String },
        wallet: {
            pending: { type: Number, default: 0 },
            available: { type: Number, default: 0 }
        },
        points: { type: Number, default: 0 },
        bankDetails: {
            bankName: String,
            accountNumber: String,
            ifscCode: String,
            accountHolderName: String
        },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zip: { type: String },
            country: { type: String }
        }
    },

    salonOwnerProfile: {
        agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rewardPoints: {
            locked: { type: Number, default: 0 },
            available: { type: Number, default: 0 },
            totalLifetimeEarned: { type: Number, default: 0 },
            ordersCountAtLastRedemption: { type: Number, default: 0 }
        },
        salonName: { type: String },
        categories: [String],
        sellingCategories: [String],
        // rewardHistory moved to RewardLedger model for scalability
        shippingAddresses: [{
            street: String,
            city: String,
            state: String,
            zip: String,
            phone: String,
            isDefault: { type: Boolean, default: false }
        }]
    },

    adminProfile: {
        logoUrl: { type: String },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            zip: { type: String },
            country: { type: String }
        }
    }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            if (ret.role !== 'AGENT') delete ret.agentProfile;
            if (ret.role !== 'SALON_OWNER') delete ret.salonOwnerProfile;
            if (ret.role !== 'ADMIN') delete ret.adminProfile;
            delete ret.passwordHash;
            delete ret.__v;
            delete ret.id;
            return ret;
        }
    }
});

export default mongoose.model('User', userSchema);
