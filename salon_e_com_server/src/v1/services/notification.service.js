import Notification from '../models/Notification.js';
import User from '../models/User.js';
import socketService from './socket.service.js';

export const notifyAdmins = async (data) => {
    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    const promises = admins.map(admin =>
        createNotification({
            ...data,
            userId: admin._id
        })
    );
    return Promise.all(promises);
};

export const createNotification = async (data) => {
    const notification = await Notification.create(data);

    // Emit real-time update
    socketService.emitToUser(data.userId, 'new-notification', notification);

    return notification;
};

export const getUserNotifications = async (userId, filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    const total = await Notification.countDocuments({ userId });
    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { notifications, count: total, page, limit };
};

export const getUnreadCount = async (userId) => {
    return await Notification.countDocuments({ userId, isRead: false });
};

export const markAsRead = async (notificationId) => {
    const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true }
    );
    if (!notification) {
        throw new Error('Notification not found');
    }
    return notification;
};

export const markAllRead = async (userId) => {
    return await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
    );
};
