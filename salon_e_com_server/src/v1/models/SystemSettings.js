import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
    appName: { type: String, default: 'Salon E-Comm' },
    logoUrl: { type: String },
    supportEmail: { type: String },
    supportPhone: { type: String },
    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zip: { type: String },
        country: { type: String }
    },
    socialLinks: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        linkedin: { type: String }
    },
    rewardConfig: {
        maxRedemptionPercentage: { type: Number, default: 50 },
        minOrderAmountForRewards: { type: Number, default: 1000 }
    }
}, {
    timestamps: true
});

export default mongoose.models.SystemSettings || mongoose.model('SystemSettings', systemSettingsSchema);
