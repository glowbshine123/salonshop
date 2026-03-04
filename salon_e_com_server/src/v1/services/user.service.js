import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as notificationService from './notification.service.js';

export const getUserProfile = async (userId) => {
    const user = await User.findById(userId).lean();
    if (!user) {
        throw new Error('User not found');
    }

    // Fetch profiles separately
    const AgentProfile = (await import('../models/AgentProfile.js')).default;
    const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;

    if (user.role === 'AGENT') {
        user.agentProfile = await AgentProfile.findOne({ userId: user._id }).lean();
    } else if (user.role === 'SALON_OWNER') {
        user.salonOwnerProfile = await SalonOwnerProfile.findOne({ userId: user._id })
            .populate('agentId', 'firstName lastName email role')
            .lean();
    } // ... admin profile can similarly be loaded

    return user;
};

export const updateUserProfile = async (userId, updateData) => {
    delete updateData.role;
    delete updateData.passwordHash;

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (updateData.firstName) user.firstName = updateData.firstName;
    if (updateData.lastName) user.lastName = updateData.lastName;
    if (updateData.email) user.email = updateData.email;
    if (updateData.phone) user.phone = updateData.phone;
    if (updateData.avatarUrl) user.avatarUrl = updateData.avatarUrl;

    // Handle Profile updates based on Role
    if (updateData.address || updateData.commissionRate || updateData.salonName || updateData.bankDetails || updateData.upiId !== undefined) {
        if (user.role === 'ADMIN') {
            const AdminProfile = (await import('../models/AdminProfile.js')).default;
            let adminProfile = await AdminProfile.findOne({ userId: user._id });
            if (!adminProfile) adminProfile = new AdminProfile({ userId: user._id });

            if (updateData.address) {
                adminProfile.address = { ...(adminProfile.address || {}), ...updateData.address };
            }
            await adminProfile.save();
        } else if (user.role === 'SALON_OWNER') {
            const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
            let salonOwnerProfile = await SalonOwnerProfile.findOne({ userId: user._id });
            if (!salonOwnerProfile) salonOwnerProfile = new SalonOwnerProfile({ userId: user._id });

            if (updateData.address) {
                const newAddress = {
                    street: updateData.address.street,
                    city: updateData.address.city,
                    state: updateData.address.state,
                    zip: updateData.address.zip,
                    phone: updateData.phone || user.phone,
                    isDefault: true
                };

                if (salonOwnerProfile.shippingAddresses && salonOwnerProfile.shippingAddresses.length > 0) {
                    Object.assign(salonOwnerProfile.shippingAddresses[0], newAddress);
                } else {
                    salonOwnerProfile.shippingAddresses = [newAddress];
                }
            }
            if (updateData.salonName) salonOwnerProfile.salonName = updateData.salonName;
            await salonOwnerProfile.save();

        } else if (user.role === 'AGENT') {
            const AgentProfile = (await import('../models/AgentProfile.js')).default;
            let agentProfile = await AgentProfile.findOne({ userId: user._id });
            if (!agentProfile) agentProfile = new AgentProfile({ userId: user._id });

            if (updateData.address) {
                agentProfile.address = { ...(agentProfile.address || {}), ...updateData.address };
            }

            await agentProfile.save();
        }
    }

    await user.save();
    return user;

    /* 
    // OLD Logic replaced for more granular control
    const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true
    }); 
    */

    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

export const createInternalUser = async (creatorRole, creatorId, userData) => {
    const { email, password, firstName, lastName, role, phone, agentId, categories, panCard, aadharCard, address } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) throw new Error('User already exists');

    if (creatorRole === 'AGENT') {
        if (role !== 'SALON_OWNER') throw new Error('Agents can only create Salon Owners');
    } else if (creatorRole !== 'ADMIN') {
        throw new Error('Unauthorized to create users internally');
    }

    if (role === 'AGENT' && creatorRole !== 'ADMIN') {
        throw new Error('Only Admin can create Agents');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUserObj = {
        email,
        passwordHash,
        firstName,
        lastName,
        phone,
        role,
        status: 'ACTIVE'
    };

    const createdUser = await User.create(newUserObj);

    if (role === 'AGENT') {
        const AgentProfile = (await import('../models/AgentProfile.js')).default;
        await AgentProfile.create({
            userId: createdUser._id,
            referralCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
            commissionRate: userData.commissionRate || 0.10,
            wallet: { pending: 0, available: 0 },
            panCard: panCard || '',
            aadharCard: aadharCard || '',
            address: address || {}
        });
    }

    if (role === 'SALON_OWNER') {
        const ownerProfile = {
            userId: createdUser._id,
            agentId: creatorRole === 'AGENT' ? creatorId : (agentId || null),
            rewardPoints: { locked: 0, available: 0 },
            salonName: userData.salonName || '',
            categories: categories ? categories.split(',').map(c => c.trim()).filter(Boolean) : (userData.categories || []),
            sellingCategories: userData.sellingCategories || []
        };

        if (userData.address) {
            ownerProfile.shippingAddresses = [{
                street: userData.address,
                city: userData.city,
                state: userData.state,
                zip: userData.pincode,
                phone: userData.phoneNumber || phone,
                isDefault: true
            }];
        }

        const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
        await SalonOwnerProfile.create(ownerProfile);
    }

    // 1. User Welcome Notification
    await notificationService.createNotification({
        userId: createdUser._id,
        title: 'Welcome to Salon E-Comm',
        description: `Your account has been created by ${creatorRole === 'AGENT' ? 'your agent' : 'the administrator'}. You can now login with your email.`,
        type: 'REGISTRATION',
        priority: 'HIGH'
    });

    // 1.1 Security Notification
    await notificationService.createNotification({
        userId: createdUser._id,
        title: 'Security Recommendation',
        description: 'For better security, we recommend changing your password. Go to My Profile > Security > Change Password.',
        type: 'SECURITY',
        priority: 'MEDIUM',
        actionText: 'Change Password',
        actionLink: '/profile?tab=SECURITY'
    });

    // 2. Admin Notification
    const creator = creatorRole === 'AGENT' ? await User.findById(creatorId) : null;
    const roleLabel = createdUser.role === 'AGENT' ? 'Agent' : 'Salon Owner';
    await notificationService.notifyAdmins({
        title: `New ${roleLabel} Added`,
        description: `A new ${roleLabel} (${createdUser.firstName} ${createdUser.lastName}) was added ${creator ? `by Agent ${creator.firstName} ${creator.lastName}` : 'internally'}.`,
        type: 'REGISTRATION',
        priority: 'MEDIUM',
        metadata: { userId: createdUser._id, creatorId }
    });

    return createdUser;
};

export const updateSalonStatus = async (userId, status) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.status = status;
    await user.save();
    return user;
};

export const assignAgent = async (salonId, agentId) => {
    const salon = await User.findById(salonId);
    if (!salon || salon.role !== 'SALON_OWNER') throw new Error('Salon Owner not found');

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'AGENT') throw new Error('Agent not found');

    const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
    let salonOwnerProfile = await SalonOwnerProfile.findOne({ userId: salonId });

    if (!salonOwnerProfile) {
        salonOwnerProfile = new SalonOwnerProfile({ userId: salonId, agentId: agentId });
    } else {
        salonOwnerProfile.agentId = agentId;
    }

    await salonOwnerProfile.save();
    return salon;
};
