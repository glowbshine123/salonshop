import CommissionTransaction from '../models/CommissionTransaction.js';
import User from '../models/User.js';

export const calculateCommission = async (order) => {
    if (!order.agentId || order.commissionCalculated || (order.status !== 'COMPLETED' && order.status !== 'DELIVERED' && order.status !== 'PAID')) {
        return null;
    }

    const rewardService = await import('./reward.service.js');
    const deliveredCount = await rewardService.getDeliveredOrderCount(order.customerId, order._id);
    const isFirstOrder = deliveredCount === 0;

    const normalizedPaymentMethod = (order.paymentMethod || '').toUpperCase();
    const isCodOrPostPaid = normalizedPaymentMethod === 'COD' || normalizedPaymentMethod === 'POSTPAID' || normalizedPaymentMethod === 'POST PAID';
    const isPrepaid = !isCodOrPostPaid;

    // Condition: Must be > 1000 and Prepaid, unless it's the first order
    if (!isFirstOrder && (order.total <= 1000 || !isPrepaid)) {
        return null;
    }

    // Double check to prevent duplicates
    const existingTransaction = await CommissionTransaction.findOne({ orderId: order._id });
    if (existingTransaction) {
        order.commissionCalculated = true;
        await order.save();
        return existingTransaction;
    }

    const agent = await User.findById(order.agentId);
    if (!agent || agent.role !== 'AGENT') {
        return null;
    }

    const commissionSlabService = await import('./commissionSlab.service.js');
    const slabRate = await commissionSlabService.getCommissionRate(order.subtotal);
    const amountEarned = order.subtotal * (slabRate / 100);

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const transaction = await CommissionTransaction.create({
        agentId: agent._id,
        orderId: order._id,
        amount: amountEarned,
        month,
        status: 'PENDING'
    });

    agent.agentProfile.totalEarnings += amountEarned;
    agent.agentProfile.currentMonthEarnings += amountEarned;
    agent.agentProfile.points = (agent.agentProfile.points || 0) + Math.round(amountEarned);

    await agent.save();

    order.commissionCalculated = true;
    await order.save();

    return transaction;
};

export const deductCommission = async (order) => {
    if (!order.agentId || !order.commissionCalculated) {
        return null;
    }

    const transaction = await CommissionTransaction.findOne({ orderId: order._id });
    if (!transaction || transaction.status === 'SETTLED') {
        // If already settled, we might need a clawback logic, 
        // but per requirements, we deduct from currentMonthEarnings.
        return null;
    }

    const agent = await User.findById(order.agentId);
    if (!agent) return null;

    const deductionAmount = transaction.amount;

    agent.agentProfile.totalEarnings -= deductionAmount;
    agent.agentProfile.currentMonthEarnings -= deductionAmount;
    // Ensure it doesn't go below 0 if that's a requirement, but usually it can be negative if refund happens.

    await agent.save();

    // Delete or mark transaction as cancelled? 
    // Requirements say "Update the transaction record accordingly"
    await CommissionTransaction.deleteOne({ _id: transaction._id });

    order.commissionCalculated = false; // Allow recalculation if it somehow becomes COMPLETED again?
    await order.save();

    return deductionAmount;
};

export const listCommissions = async (userId, role, filters = {}) => {
    const query = {};
    if (role === 'AGENT') {
        query.agentId = userId;
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    const total = await CommissionTransaction.countDocuments(query);
    const commissions = await CommissionTransaction.find(query)
        .populate('orderId', 'orderNumber total')
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return { commissions, count: total, page, limit };
};

export const approveCommission = async (orderId) => {
    const Commission = (await import('../models/Commission.js')).default;
    const commission = await Commission.findOne({ orderId });
    if (commission && commission.status === 'PENDING') {
        commission.status = 'SETTLED'; // Mapping APPROVED to SETTLED as CommissionTransaction only has PENDING/SETTLED
        await commission.save();
    }
};
