import mongoose from 'mongoose';

const adminProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String
    },
    logoUrl: String,
}, { timestamps: true });

// Prevent OverwriteModelError
export default mongoose.models.AdminProfile || mongoose.model('AdminProfile', adminProfileSchema);
