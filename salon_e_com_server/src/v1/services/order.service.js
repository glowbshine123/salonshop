import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { ObjectId } from 'mongodb';
import * as notificationService from './notification.service.js';

export const createOrder = async (userId, orderData) => {
    const { items, referralCode, shippingAddress, paymentMethod } = orderData;

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        let product;

        if (ObjectId.isValid(item.productId) && typeof item.productId === 'string' && item.productId.length === 24) {
            product = await Product.findById(item.productId);
        }

        if (!product) {
            product = await Product.findOne({ slug: item.productId });
        }

        if (!product && !isNaN(item.productId)) {
            product = await Product.findOne({ slug: `product-${item.productId}` });
        }

        if (!product) {
            throw new Error(`Product ${item.productId} not found`);
        }

        const price = product.price;
        subtotal += price * item.quantity;

        // Stock is already reserved by cart.service.js
        // We just verify it here.
        if (typeof product.inventoryCount === 'number' && product.inventoryCount < 0) {
            // This shouldn't happen if reservation worked, but good for safety
            throw new Error(`Insufficient stock for product ${product.name}`);
        }

        orderItems.push({
            productId: product._id,
            name: product.name,
            quantity: item.quantity,
            priceAtPurchase: price,
            image: product.images?.[0]
        });
    }

    const tax = 0; // Tax removed as per requirement
    const shippingCost = subtotal > 50 ? 0 : 10;
    const total = subtotal + tax + shippingCost;

    const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
    const salonOwnerProfile = await SalonOwnerProfile.findOne({ userId });

    let agentId = null;

    if (orderData.agentId) {
        agentId = orderData.agentId;
    } else if (salonOwnerProfile && salonOwnerProfile.agentId) {
        agentId = salonOwnerProfile.agentId;
    } else if (referralCode) {
        const agent = await User.findOne({ 'agentProfile.referralCode': referralCode, role: 'AGENT' });
        if (agent) agentId = agent._id;
    }

    const commissionSlabService = await import('./commissionSlab.service.js');
    const commissionRate = await commissionSlabService.getCommissionRate(subtotal);
    const agentCommissionAmount = agentId ? (subtotal * (commissionRate / 100)) : 0;

    let pointsUsed = 0;
    let finalTotalWithDiscount = total;

    if (orderData.pointsToRedeem && orderData.pointsToRedeem > 0) {
        const rewardService = await import('./reward.service.js');

        // 1. Validate Redemption
        const { pointsToRedeem, error } = await rewardService.validateRedemption(
            userId,
            orderData.pointsToRedeem,
            subtotal, // Validation against subtotal or full total? Prompt: "Max redemption allowed per order = 50% of order price"
            paymentMethod || 'card'
        );

        if (error) {
            throw new Error(error);
        }

        pointsUsed = pointsToRedeem;
        finalTotalWithDiscount = total - pointsUsed;
    }

    const salonRewardPointsAmount = await (async () => {
        const rewardService = await import('./reward.service.js');
        // Preview points (optional, but good to store expected points). 
        // We calculate this for storage in 'earned' but actual crediting happens on delivery.
        return await rewardService.calculatePoints(userId, finalTotalWithDiscount, paymentMethod || 'ONLINE', pointsUsed);
    })();

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
        orderNumber,
        customerId: userId,
        agentId,
        items: orderItems,
        subtotal,
        tax,
        shippingCost,
        total: finalTotalWithDiscount,
        pointsUsed,
        shippingAddress: shippingAddress || null,
        paymentMethod: paymentMethod || 'ONLINE', // Default to ONLINE if not specified, or checks provided
        paymentStatus: 'UNPAID',
        agentCommission: {
            rate: commissionRate,
            amount: agentCommissionAmount,
            isCredited: false
        },
        salonRewardPoints: {
            earned: salonRewardPointsAmount,
            redeemed: pointsUsed,
            isCredited: false
        },
        timeline: [{ status: 'PENDING', note: `Order created - ${pointsUsed > 0 ? `Redeemed ${pointsUsed} points. ` : ''}Payment Method: ${paymentMethod || 'ONLINE'}` }]
    });

    if (salonRewardPointsAmount > 0) {
        const rewardService = await import('./reward.service.js');
        await rewardService.lockOrderRewards(order._id);
    }

    // Execute Redemption (Deduct points)
    if (pointsUsed > 0) {
        const rewardService = await import('./reward.service.js');
        await rewardService.executeRedemption(userId, order._id, pointsUsed);
    }

    // Clear Cart (isPurchase = true to keep stock decremented)
    try {
        const cartService = await import('./cart.service.js');
        await cartService.clearCart(userId, true);
    } catch (cartErr) {
        console.warn('Failed to clear cart after order creation:', cartErr.message);
    }

    await notificationService.createNotification({
        userId: userId,
        title: 'Order Created',
        description: `Your order ${order.orderNumber} has been successfully placed.`,
        type: 'ORDER'
    });

    if (agentId) {
        await notificationService.createNotification({
            userId: agentId,
            title: 'New Order Assigned',
            description: `New order ${order.orderNumber} has been placed with your referral code.`,
            type: 'ORDER'
        });
    }

    // Admin Notification for New Order
    await notificationService.notifyAdmins({
        title: 'New Order Received',
        description: `Order ${order.orderNumber} for ₹${order.total} has been placed.`,
        type: 'ORDER',
        priority: 'MEDIUM',
        metadata: { orderId: order._id }
    });

    return order;
};

export const getMyOrders = async (userId, filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const query = { customerId: userId };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        orders: orders, // Harmonized key
        count: total,
        page: page,
        limit: limit
    };
};

export const getAssignedOrders = async (agentId, filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;
    const query = { agentId };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('customerId', 'firstName lastName email')
        .populate('agentId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        assignedOrders: orders,
        orders: orders, // Harmonized key
        count: total,
        page: page,
        limit: limit
    };
};

export const assignAgent = async (orderId, agentId) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.agentId = agentId || null;
    order.timeline.push({ status: 'AGENT_ASSIGNED', note: `Agent assigned: ${agentId}` });

    await order.save();
    return order;
};

export const getAgentOrders = async (agentId) => {
    return await Order.find({ agentId: agentId })
        .populate('customerId', 'firstName lastName email')
        .sort({ createdAt: -1 });
};

export const getAllOrders = async (filters = {}) => {
    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    const query = {};
    if (filters.status && filters.status !== 'All') {
        query.status = filters.status;
    }
    if (filters.search) {
        query.orderNumber = new RegExp(filters.search, 'i');
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
        .populate('customerId', 'firstName lastName email salonOwnerProfile.salonName')
        .populate('agentId', 'firstName lastName email')
        .populate({
            path: 'items.productId',
            select: 'sku hsnCode weight'
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

    return {
        allOrders: orders,
        orders: orders, // Harmonized key
        count: total,
        page: page,
        limit: limit
    };
};

export const updateOrderStatus = async (orderId, status) => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const prevStatus = order.status;
    order.status = status;
    order.timeline.push({ status, note: `Status updated to ${status}` });

    await notificationService.createNotification({
        userId: order.customerId,
        title: `Order ${status}`,
        description: `Your order ${order.orderNumber} status has been updated to ${status}.`,
        type: 'ORDER'
    });

    if (status === 'CANCELLED' && order.agentId) {
        await notificationService.createNotification({
            userId: order.agentId,
            title: 'Order Cancelled',
            description: `Order ${order.orderNumber} assigned to you has been cancelled.`,
            type: 'ORDER'
        });
    }

    // REWARD LOGIC: Earn points on Delivery or Completion
    // Updated: Supports both DELIVERED and COMPLETED as triggers
    if (status === 'DELIVERED' || status === 'COMPLETED') {
        const rewardService = await import('./reward.service.js');
        await rewardService.processOrderDeliveryRewards(order._id);
    }

    // REWARD LOGIC: Refund/Cancel
    if (status === 'CANCELLED' || status === 'REFUNDED') {
        if (order.pointsUsed > 0) {
            const rewardService = await import('./reward.service.js');
            await rewardService.reverseRedemption(order._id);
        }

        if (!order.salonRewardPoints?.isCredited && order.salonRewardPoints?.earned > 0) {
            const rewardService = await import('./reward.service.js');
            await rewardService.reverseLockedRewards(order._id);
        }

        // STOCK LOGIC: Restore stock on cancellation/refund
        if (!order.stockRestored) {
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.inventoryCount += item.quantity;
                    await product.save();
                }
            }
            order.stockRestored = true;
        }
    }

    const walletService = await import('./wallet.service.js');

    if (status === 'PAID' || status === 'COMPLETED') {
        await walletService.creditOrderRewards(order);
        const commissionService = await import('./commission.service.js');
        await commissionService.calculateCommission(order);
    }

    if (status === 'DELIVERED' || status === 'COMPLETED') {
        await walletService.unlockOrderRewards(order);
        const commissionService = await import('./commission.service.js');
        await commissionService.calculateCommission(order);
    }

    if ((status === 'CANCELLED' || status === 'REFUNDED') && order.commissionCalculated) {
        const commissionService = await import('./commission.service.js');
        await commissionService.deductCommission(order);
    }

    await order.save();
    return order;
};
