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
    avatarUrl: { type: String }
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.passwordHash;
            delete ret.__v;
            delete ret.id;
            return ret;
        }
    }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
