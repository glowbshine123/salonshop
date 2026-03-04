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
        const { role, isActive, status, search } = req.query;
        let query = {};
        if (role) query.role = role.toUpperCase();
        if (typeof isActive !== 'undefined') query.isActive = (isActive === 'true' || isActive === true);
        if (status) query.status = status.toUpperCase();

        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            query.$or = [
                { firstName: searchRegex },
                { lastName: searchRegex },
                { email: searchRegex },
                { phone: searchRegex }
            ];

            // If searching for agents, also search in their profile address
            if (role === 'AGENT' || !role) {
                const AgentProfile = (await import('../models/AgentProfile.js')).default;
                const matchingProfiles = await AgentProfile.find({
                    $or: [
                        { 'address.street': searchRegex },
                        { 'address.city': searchRegex },
                        { 'address.state': searchRegex },
                        { 'address.zip': searchRegex }
                    ]
                }).select('userId').lean();

                if (matchingProfiles.length > 0) {
                    const userIdsFromProfiles = matchingProfiles.map(p => p.userId);
                    query.$or.push({ _id: { $in: userIdsFromProfiles } });
                }
            }

            // If searching for salons, also search in their shipping addresses
            if (role === 'SALON_OWNER' || !role) {
                const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
                const matchingSalonProfiles = await SalonOwnerProfile.find({
                    shippingAddresses: {
                        $elemMatch: {
                            $or: [
                                { street: searchRegex },
                                { city: searchRegex },
                                { state: searchRegex },
                                { zip: searchRegex },
                                { phone: searchRegex }
                            ]
                        }
                    }
                }).select('userId').lean();

                if (matchingSalonProfiles.length > 0) {
                    const userIdsFromSalonProfiles = matchingSalonProfiles.map(p => p.userId);
                    query.$or.push({ _id: { $in: userIdsFromSalonProfiles } });
                }
            }
        }

        if (req.user.role === 'AGENT') {
            const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
            const assignedSalons = await SalonOwnerProfile.find({ agentId: req.user._id }).select('userId').lean();
            const salonUserIds = assignedSalons.map(s => s.userId);
            query._id = { $in: salonUserIds };
            query.role = 'SALON_OWNER';
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 100; // Increased limit for admin view or handle pagination

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('firstName lastName email role isActive status createdAt avatarUrl phone')
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

        // Fetch monthly rewards for salons
        const RewardTransaction = (await import('../models/RewardTransaction.js')).default;
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyRewards = await RewardTransaction.aggregate([
            {
                $match: {
                    userId: { $in: salonOwnerIds },
                    type: 'REWARD_EARNED',
                    status: 'COMPLETED',
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const usersWithProfiles = users.map(user => {
            const userObj = { ...user };
            if (user.role === 'AGENT') {
                userObj.agentProfile = agentProfiles.find(p => p.userId.toString() === user._id.toString());
            } else if (user.role === 'SALON_OWNER') {
                const profile = salonOwnerProfiles.find(p => p.userId.toString() === user._id.toString());
                if (profile) {
                    const rewards = monthlyRewards.find(r => r._id.toString() === user._id.toString());
                    profile.currentMonthRewards = rewards ? rewards.total : 0;
                    userObj.salonOwnerProfile = profile;
                }
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

        // Security check for AGENT role
        if (req.user.role === 'AGENT') {
            const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
            const assignedSalon = await SalonOwnerProfile.findOne({
                userId: id,
                agentId: req.user._id
            });

            if (!assignedSalon) {
                return res.status(403).json({ message: 'Unauthorized to update status for this salon partner' });
            }
        }

        const user = await userService.updateSalonStatus(id, status);
        res.json(user);
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
