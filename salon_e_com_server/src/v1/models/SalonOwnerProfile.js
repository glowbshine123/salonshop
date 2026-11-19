import mongoose from 'mongoose';

const salonOwnerProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    salonName: String,

    categories: [String],
    sellingCategories: [String],

    rewardPoints: {
        locked: { type: Number, default: 0 },
        available: { type: Number, default: 0 },
        totalLifetimeEarned: { type: Number, default: 0 },
        ordersCountAtLastRedemption: { type: Number, default: 0 }
    },

    shippingAddresses: [{
        street: String,
        city: String,
        state: String,
        zip: String,
        phone: String,
        isDefault: { type: Boolean, default: false }
    }]

}, { timestamps: true });

// Add index for fast lookup
salonOwnerProfileSchema.index({ userId: 1 });

export default mongoose.models.SalonOwnerProfile || mongoose.model('SalonOwnerProfile', salonOwnerProfileSchema);
