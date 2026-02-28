import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['PAYMENT', 'ORDER', 'REWARD', 'COMMISSION', 'REGISTRATION', 'SYSTEM', 'SECURITY'],
        default: 'SYSTEM'
    },
    actionText: String,
    actionLink: String,
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
});

notificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
