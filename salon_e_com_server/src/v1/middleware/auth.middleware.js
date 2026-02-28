// src/v1/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const userDoc = await User.findById(decoded.id).select('-passwordHash').lean();

            if (!userDoc) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            userDoc.id = userDoc._id.toString();
            req.user = userDoc;

            if (req.user.role === 'SALON_OWNER') {
                const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
                req.user.salonOwnerProfile = await SalonOwnerProfile.findOne({ userId: req.user._id })
                    .populate('agentId', 'firstName lastName email')
                    .lean();
            } else if (req.user.role === 'AGENT') {
                const AgentProfile = (await import('../models/AgentProfile.js')).default;
                req.user.agentProfile = await AgentProfile.findOne({ userId: req.user._id }).lean();
            } else if (req.user.role === 'ADMIN') {
                const AdminProfile = (await import('../models/AdminProfile.js')).default;
                req.user.adminProfile = await AdminProfile.findOne({ userId: req.user._id }).lean();
            }

            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                console.warn(`[AuthMiddleware] Invalid token received: ${error.message}`);
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }
            if (error.name === 'TokenExpiredError') {
                console.warn('[AuthMiddleware] Token expired');
                return res.status(401).json({ message: 'Not authorized, token expired' });
            }
            console.error('[AuthMiddleware] Unexpected auth error:', error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
