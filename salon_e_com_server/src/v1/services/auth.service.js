// src/v1/services/auth.service.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as notificationService from './notification.service.js';

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Internal helper for user creation without token generation
export const baseCreateUser = async (userData) => {
    const { email, password, firstName, lastName, role, phone, countryCode, agentId, categories, panCard, aadharCard, address } = userData;

    // Check if user exists
    const normalizedEmail = email.toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Prepare user object
    const newUserObj = {
        email: normalizedEmail,
        passwordHash,
        firstName,
        lastName,
        phone,
        countryCode: countryCode || '91',
        role: role || 'SALON_OWNER',
        status: (role === 'SALON_OWNER' || !role) ? 'ACTIVE' : 'PENDING'
    };

    // Role Specific Logic
    if (newUserObj.role === 'SALON_OWNER') {
        newUserObj.salonOwnerProfile = {
            agentId: agentId || null,
            rewardPoints: { locked: 0, available: 0 },
            categories: categories ? categories.split(',').map(c => c.trim()).filter(Boolean) : []
        };
    } else if (newUserObj.role === 'AGENT') {
        newUserObj.agentProfile = {
            commissionRate: 0.10,
            referralCode: `REF-${firstName.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
            wallet: { pending: 0, available: 0 },
            panCard: panCard || '',
            aadharCard: aadharCard || '',
            address: address || {}
        };
    }

    const user = await User.create(newUserObj);
    // 1. User Welcome/Status Notification
    if (user.role === 'SALON_OWNER') {
        await notificationService.createNotification({
            userId: user._id,
            title: 'Welcome to Salon E-Comm',
            description: 'Your professional salon owner account has been registered successfully.',
            type: 'REGISTRATION',
            priority: 'HIGH'
        });
    } else if (user.role === 'AGENT') {
        await notificationService.createNotification({
            userId: user._id,
            title: 'Agent Registration Pending',
            description: 'Your agent application is under review by the administrator.',
            type: 'REGISTRATION',
            priority: 'MEDIUM'
        });
    }

    // 1.1 Security Notification for new users
    await notificationService.createNotification({
        userId: user._id,
        title: 'Security Recommendation',
        description: 'For better security, we recommend changing your password. Go to My Profile > Security > Change Password.',
        type: 'SECURITY',
        priority: 'MEDIUM',
        actionText: 'Change Password',
        actionLink: '/profile?tab=SECURITY'
    });

    // 2. Admin Notification for New Registration
    const referringAgent = agentId ? await User.findById(agentId) : null;
    const roleLabel = user.role === 'AGENT' ? 'Agent' : 'Salon Owner';
    await notificationService.notifyAdmins({
        title: `New ${roleLabel} Registered`,
        description: `A new ${roleLabel} (${user.firstName} ${user.lastName}) has joined the platform${referringAgent ? ` via Agent ${referringAgent.firstName} ${referringAgent.lastName}` : ''}.`,
        type: 'REGISTRATION',
        priority: user.role === 'AGENT' ? 'HIGH' : 'MEDIUM',
        metadata: { userId: user._id, agentId }
    });

    // 3. Agent Notification if their code was used
    if (user.role === 'SALON_OWNER' && agentId) {
        await notificationService.createNotification({
            userId: agentId,
            title: 'New Referral Joined',
            description: `${user.firstName} ${user.lastName} registered using your referral code.`,
            type: 'REGISTRATION',
            priority: 'MEDIUM'
        });
    }

    return user;
};

export const registerUser = async (userData) => {
    // Strict Access Control: Public registration cannot create ADMIN or AGENT
    if (userData.role === 'ADMIN' || userData.role === 'AGENT') {
        throw new Error('Unauthorized role registration. Please contact administrator.');
    }

    const user = await baseCreateUser(userData);

    if (user) {
        let profile = null;
        if (user.role === 'SALON_OWNER') {
            const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
            profile = await SalonOwnerProfile.findOne({ userId: user._id });
        }

        return {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            salonOwnerProfile: profile,
            token: generateToken(user.id, user.role),
        };
    } else {
        throw new Error('Invalid user data');
    }
};

export const loginUser = async (email, password) => {
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new Error('Email not found');
    }

    if (user.role === 'SALON_OWNER' && user.status === 'REJECTED') {
        throw new Error('Your account has been rejected. Please contact support.');
    }

    if (user.role === 'SALON_OWNER' && user.status === 'DEACTIVE') {
        throw new Error('Your account is deactivated. Please contact support.');
    }

    if (await bcrypt.compare(password, user.passwordHash)) {
        let agentProfile = null;
        let salonOwnerProfile = null;
        let adminProfile = null;

        if (user.role === 'AGENT') {
            const AgentProfile = (await import('../models/AgentProfile.js')).default;
            agentProfile = await AgentProfile.findOne({ userId: user._id });
        } else if (user.role === 'SALON_OWNER') {
            const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
            salonOwnerProfile = await SalonOwnerProfile.findOne({ userId: user._id });
        } else if (user.role === 'ADMIN') {
            const AdminProfile = (await import('../models/AdminProfile.js')).default;
            adminProfile = await AdminProfile.findOne({ userId: user._id });
        }

        return {
            _id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            status: user.status,
            agentProfile,
            salonOwnerProfile,
            adminProfile,
            token: generateToken(user.id, user.role),
        };
    } else {
        throw new Error('Incorrect password');
    }
};

export const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) throw new Error('Incorrect old password');

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return { message: 'Password changed successfully' };
};
