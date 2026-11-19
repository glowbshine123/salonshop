import User from '../models/User.js';
import WalletTransaction from '../models/WalletTransaction.js';
import * as notificationService from './notification.service.js';

export const creditOrderRewards = async (order) => {
    if (order.agentId && order.agentCommission && !order.agentCommission.isCredited) {
        const agent = await User.findById(order.agentId);
        if (agent) {
            const AgentProfile = (await import('../models/AgentProfile.js')).default;
            let agentProfile = await AgentProfile.findOne({ userId: agent._id });

            if (!agentProfile) {
                agentProfile = new AgentProfile({
                    userId: agent._id,
                    commissionRate: 0.10,
                    totalEarnings: 0,
                    wallet: { pending: 0, available: 0 },
                    points: 0
                });
            }
            if (!agentProfile.wallet) agentProfile.wallet = { pending: 0, available: 0 };

            agentProfile.wallet.pending += order.agentCommission.amount;
            await agentProfile.save();

            await WalletTransaction.create({
                userId: agent._id,
                orderId: order._id,
                type: 'COMMISSION_PENDING',
                amount: order.agentCommission.amount,
                status: 'COMPLETED',
                description: `Commission tracked for order ${order.orderNumber}`
            });

            order.agentCommission.isCredited = true;

            // Trigger Notification for Agent
            await notificationService.createNotification({
                userId: agent._id,
                title: 'New Commission Tracked',
                description: `₹${order.agentCommission.amount} commission is pending for order #${order.orderNumber?.split('-')[2] || order._id.slice(-6).toUpperCase()}.`,
                type: 'COMMISSION',
                metadata: { orderId: order._id }
            });
        }
    }

    // Salon Reward Points logic removed - now handled by reward.service.js

    await order.save();
};

export const unlockOrderRewards = async (order) => {
    if (order.agentId && order.agentCommission && order.agentCommission.isCredited) {
        const agent = await User.findById(order.agentId);
        if (agent) {
            const AgentProfile = (await import('../models/AgentProfile.js')).default;
            let agentProfile = await AgentProfile.findOne({ userId: agent._id });

            if (!agentProfile) {
                agentProfile = new AgentProfile({
                    userId: agent._id,
                    commissionRate: 0.10,
                    totalEarnings: 0,
                    wallet: { pending: 0, available: 0 },
                    points: 0
                });
            }
            if (!agentProfile.wallet) agentProfile.wallet = { pending: 0, available: 0 };

            if (agentProfile.wallet.pending >= order.agentCommission.amount) {
                agentProfile.wallet.pending -= order.agentCommission.amount;
                agentProfile.wallet.available += order.agentCommission.amount;
                await agentProfile.save();

                await WalletTransaction.create({
                    userId: agent._id,
                    orderId: order._id,
                    type: 'COMMISSION_AVAILABLE',
                    amount: order.agentCommission.amount,
                    status: 'COMPLETED',
                    description: `Commission settled for order ${order.orderNumber}`
                });

                // Trigger Notification
                await notificationService.createNotification({
                    userId: agent._id,
                    title: 'Commission Credited',
                    description: `₹${order.agentCommission.amount} has been moved to your available balance.`,
                    type: 'COMMISSION',
                    priority: 'HIGH'
                });
            }
        }
    }

    // Salon Reward Unlock logic removed - now handled by reward.service.js
}

// reconcileMaturedPoints REMOVED - handled by reward.service.js/processExpiredRewards (sort of, different logic now)
// redeemPoints REMOVED - handled by reward.service.js/redeemPoints

