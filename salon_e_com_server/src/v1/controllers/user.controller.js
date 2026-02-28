import * as userService from '../services/user.service.js';
import User from '../models/User.js';

export const getProfile = async (req, res) => {
    try {
        if (req.user.role === 'SALON_OWNER') {
            const walletService = await import('../services/wallet.service.js');
            await walletService.reconcileMaturedPoints(req.user.id);
        }
        const user = await userService.getUserProfile(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        let updateData = { ...req.body };

        // Handle JSON data parsing if sent as 'data' field (common for FormData with complex objects)
        if (req.body.data) {
            try {
                const parsedData = JSON.parse(req.body.data);
                updateData = { ...updateData, ...parsedData };
            } catch (e) {
                console.warn('Failed to parse req.body.data JSON:', e);
            }
        }

        if (req.file) {
            let fileUrl = '';
            // Check if using Cloudinary (path is URL) or local storage
            if (req.file.path && req.file.path.startsWith('http')) {
                fileUrl = req.file.path;
            } else {
                // Construct local URL
                const protocol = req.protocol;
                const host = req.get('host');
                // Ensure filename is available
                if (req.file.filename) {
                    fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
                }
            }

            if (fileUrl) {
                updateData.avatarUrl = fileUrl;
                // If adminProfile exists, update logoUrl too
                if (updateData.adminProfile) {
                    updateData.adminProfile = {
                        ...updateData.adminProfile,
                        logoUrl: fileUrl
                    };
                } else {
                    // Initialize if not present but we want to set it?
                    // Or maybe just let service handle it if structure exists
                    // Let's safe set if it's an admin
                    if (req.user.role === 'ADMIN') {
                        updateData.adminProfile = { logoUrl: fileUrl };
                    }
                }
            }
        }

        const user = await userService.updateUserProfile(req.user.id, updateData);
        res.json(user);
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(400).json({ message: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const { role, isActive, status } = req.query;
        let query = {};
        if (role) query.role = role.toUpperCase();
        if (typeof isActive !== 'undefined') query.isActive = (isActive === 'true' || isActive === true);
        if (status) query.status = status.toUpperCase();

        if (req.user.role === 'AGENT') {
            const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
            const assignedSalons = await SalonOwnerProfile.find({ agentId: req.user._id }).select('userId').lean();
            const salonUserIds = assignedSalons.map(s => s.userId);
            query._id = { $in: salonUserIds };
            query.role = 'SALON_OWNER';
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('firstName lastName email role isActive status createdAt avatarUrl')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Fetch profiles separately
        const AgentProfile = (await import('../models/AgentProfile.js')).default;
        const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;

        const agentIds = users.filter(u => u.role === 'AGENT').map(u => u._id);
        const salonOwnerIds = users.filter(u => u.role === 'SALON_OWNER').map(u => u._id);

        const agentProfiles = await AgentProfile.find({ userId: { $in: agentIds } }).lean();
        const salonOwnerProfiles = await SalonOwnerProfile.find({ userId: { $in: salonOwnerIds } })
            .populate('agentId', 'firstName lastName email role avatarUrl')
            .lean();

        const usersWithProfiles = users.map(user => {
            const userObj = { ...user };
            if (user.role === 'AGENT') {
                userObj.agentProfile = agentProfiles.find(p => p.userId.toString() === user._id.toString());
            } else if (user.role === 'SALON_OWNER') {
                userObj.salonOwnerProfile = salonOwnerProfiles.find(p => p.userId.toString() === user._id.toString());
            }
            return userObj;
        });

        res.json({ users: usersWithProfiles, count: total, page, limit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createInternal = async (req, res) => {
    try {
        const user = await userService.createInternalUser(req.user.role, req.user._id, req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateSalonStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const salon = await userService.updateSalonStatus(id, status);
        res.json(salon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const assignAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { agentId } = req.body;
        const salon = await userService.assignAgent(id, agentId);
        res.json(salon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getPublicAgents = async (req, res) => {
    try {
        const users = await User.find({ role: 'AGENT', isActive: true })
            .select('firstName lastName email')
            .lean();

        const agentIds = users.map(u => u._id);
        const AgentProfile = (await import('../models/AgentProfile.js')).default;
        const agentProfiles = await AgentProfile.find({ userId: { $in: agentIds } }).lean();

        const agents = users.map(user => {
            return {
                ...user,
                agentProfile: agentProfiles.find(p => p.userId.toString() === user._id.toString())
            };
        });

        res.json({ users: agents });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
