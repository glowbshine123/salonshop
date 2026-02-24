import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import * as notificationService from './notification.service.js';

export const getUserProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
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

    // Handle Address Updates based on Role
    if (updateData.address) {
        if (user.role === 'ADMIN') {
            user.adminProfile = {
                ...(user.adminProfile || {}),
                address: {
                    ...(user.adminProfile?.address || {}),
                    ...updateData.address
                }
            };
        } else if (user.role === 'SALON_OWNER') {
            if (!user.salonOwnerProfile) user.salonOwnerProfile = {};
            if (!user.salonOwnerProfile.shippingAddresses) user.salonOwnerProfile.shippingAddresses = [];

            const newAddress = {
                street: updateData.address.street,
                city: updateData.address.city,
                state: updateData.address.state,
                zip: updateData.address.zip,
                phone: updateData.phone || user.phone, // Ensure phone is synced or pulled from update
                isDefault: true
            };

            if (user.salonOwnerProfile.shippingAddresses.length > 0) {
                // Update existing default/first address
                Object.assign(user.salonOwnerProfile.shippingAddresses[0], newAddress);
            } else {
                // Add new address
                user.salonOwnerProfile.shippingAddresses.push(newAddress);
            }
        } else if (user.role === 'AGENT') {
            user.agentProfile = {
                ...(user.agentProfile || {}),
                address: {
                    ...(user.agentProfile?.address || {}),
                    ...updateData.address
                }
            };
        }
    }

    if (updateData.adminProfile && user.role === 'ADMIN') {
        // ... (keep existing adminProfile logic if any, but address is handled above)
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
    const { email, password, firstName, lastName, role, phone, agentId, categories } = userData;

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

    if (role === 'AGENT') {
        newUserObj.agentProfile = {
            referralCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
            commissionRate: userData.commissionRate || 0.10,
            wallet: { pending: 0, available: 0 }
        };
    }

    if (role === 'SALON_OWNER') {
        const ownerProfile = {
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

        newUserObj.salonOwnerProfile = ownerProfile;
    }

    const createdUser = await User.create(newUserObj);

    // 1. User Welcome Notification
    await notificationService.createNotification({
        userId: createdUser._id,
        title: 'Welcome to Salon E-Comm',
        description: `Your account has been created by ${creatorRole === 'AGENT' ? 'your agent' : 'the administrator'}. You can now login with your email.`,
        type: 'REGISTRATION',
        priority: 'HIGH'
    });

    // 2. Admin Notification
    const creator = creatorRole === 'AGENT' ? await User.findById(creatorId) : null;
    await notificationService.notifyAdmins({
        title: 'New Salon Owner Added',
        description: `A new Salon Owner (${createdUser.firstName} ${createdUser.lastName}) was added ${creator ? `by Agent ${creator.firstName} ${creator.lastName}` : 'internally'}.`,
        type: 'REGISTRATION',
        priority: 'MEDIUM',
        metadata: { userId: createdUser._id, creatorId }
    });

    return createdUser;
};

export const updateSalonStatus = async (salonId, status) => {
    const salon = await User.findById(salonId);
    if (!salon || salon.role !== 'SALON_OWNER') throw new Error('Salon Owner not found');

    salon.status = status;
    await salon.save();
    return salon;
};

export const assignAgent = async (salonId, agentId) => {
    const salon = await User.findById(salonId);
    if (!salon || salon.role !== 'SALON_OWNER') throw new Error('Salon Owner not found');

    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'AGENT') throw new Error('Agent not found');

    salon.salonOwnerProfile.agentId = agentId;
    await salon.save();
    return salon;
};
