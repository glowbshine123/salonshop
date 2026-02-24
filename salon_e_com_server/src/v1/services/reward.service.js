import User from '../models/User.js';
import Order from '../models/Order.js';
import RewardLedger from '../models/RewardLedger.js';
import WalletTransaction from '../models/WalletTransaction.js';
import * as notificationService from './notification.service.js';

// --- 8. GET REWARD DATA (API Support) ---
export const getRewardWallet = async (userId) => {
    const user = await User.findById(userId).select('salonOwnerProfile.rewardPoints');
    if (!user) return null;

    // Get active ledgers for detailed breakdown
    const activeLedgers = await RewardLedger.find({
        userId,
        status: 'ACTIVE',
        pointsRemaining: { $gt: 0 }
    }).sort({ expiresAt: 1 });

    // Check unlocking status
    const isUnlocked = await isRedemptionUnlocked(userId);
    const deliveredCount = await getDeliveredOrderCount(userId);

    return {
        balance: user.salonOwnerProfile.rewardPoints.available,
        lifetimeEarned: user.salonOwnerProfile.rewardPoints.totalLifetimeEarned,
        isUnlocked,
        deliveredOrdersCount: deliveredCount,
        ordersNeededForUnlock: Math.max(0, 3 - deliveredCount),
        expiringSoon: activeLedgers.slice(0, 3) // Return top 3 expiring batches
    };
};

export const getRewardTransactions = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    // Filter for REWARD types
    const query = {
        userId,
        type: { $in: ['REWARD_EARNED', 'REWARD_REDEEMED', 'REWARD_EXPIRED', 'REWARD_LOCKED', 'REWARD_UNLOCKED'] }
    };

    const total = await WalletTransaction.countDocuments(query);
    const transactions = await WalletTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('orderId', 'orderNumber total');

    return {
        transactions,
        total,
        page,
        limit
    };
};

// --- HELPER: Get Delivered Order Count (Eligible Orders Only) ---
export const getDeliveredOrderCount = async (userId, excludeOrderId = null) => {
    const query = {
        customerId: userId,
        status: { $nin: ['CANCELLED', 'REFUNDED'] }
    };
    if (excludeOrderId) {
        query._id = { $ne: excludeOrderId };
    }
    return await Order.countDocuments(query);
};

// --- 1. CALCULATE POINTS (Preview) ---
export const calculatePoints = async (userId, orderTotal, paymentMethod, pointsRedeemed = 0, currentOrderId = null) => {
    // Global Rule: No Rewards if Points were Redeemed
    if (pointsRedeemed > 0) return 0;

    const deliveredCount = await getDeliveredOrderCount(userId, currentOrderId);
    const isFirstOrder = deliveredCount === 0;

    const normalizedPaymentMethod = (paymentMethod || '').toUpperCase();
    const isCodOrPostPaid = normalizedPaymentMethod === 'COD' || normalizedPaymentMethod === 'POSTPAID' || normalizedPaymentMethod === 'POST PAID';
    const isPrepaid = !isCodOrPostPaid;

    // First Order: Bypasses both conditions (Min 1000 and Prepaid)
    if (isFirstOrder) {
        // Keep a reasonable minimum of 300 for the very first order to earn points
        if (orderTotal > 300) {
            return Math.floor(orderTotal * 0.10);
        }
        return 0;
    }

    // Subsequent Orders: Must be > 1000 AND Prepaid
    if (orderTotal > 1000 && isPrepaid) {
        return Math.floor(orderTotal * 0.10);
    }

    return 0;
};

// --- 2. EARN POINTS (On Delivery) ---
export const processOrderDeliveryRewards = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order || !order.customerId) return;

    // Avoid double processing
    const existingLedger = await RewardLedger.findOne({ orderId: order._id });
    if (existingLedger) return;

    // Calculate points based on the rules
    const pointsToEarn = await calculatePoints(order.customerId, order.total, order.paymentMethod, order.pointsUsed, order._id);

    if (pointsToEarn > 0) {
        // Expiry: 4 months from NOW (Delivery time)
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 4);

        // 1. Create Ledger Entry
        await RewardLedger.create({
            userId: order.customerId,
            orderId: order._id,
            pointsEarned: pointsToEarn,
            pointsRemaining: pointsToEarn,
            status: 'ACTIVE',
            expiresAt: expiryDate,
            activatedAt: new Date()
        });

        // 2. Update User Wallet
        await User.findByIdAndUpdate(order.customerId, {
            $inc: {
                'salonOwnerProfile.rewardPoints.available': pointsToEarn,
                'salonOwnerProfile.rewardPoints.totalLifetimeEarned': pointsToEarn
            }
        });

        // 3. Log Transaction
        await WalletTransaction.create({
            userId: order.customerId,
            orderId: order._id,
            type: 'REWARD_EARNED',
            amount: pointsToEarn,
            status: 'COMPLETED',
            description: `Earned rewards for order #${order.orderNumber}`
        });

        // 4. Update Order (snapshot)
        order.salonRewardPoints = {
            earned: pointsToEarn,
            isCredited: true,
            // We can also store expiry here if needed for easy reference
        };
        await order.save();

        // 5. Notify
        await notificationService.createNotification({
            userId: order.customerId,
            title: 'Rewards Earned!',
            description: `You've earned ${pointsToEarn} points from your recent order. They will expire in 4 months.`,
            type: 'REWARD',
            metadata: { orderId: order._id }
        });
    }
};

// --- 3. CHECK UNLOCK STATUS ---
export const isRedemptionUnlocked = async (userId) => {
    const deliveredCount = await getDeliveredOrderCount(userId);
    // "After 3rd delivered order -> user becomes eligible"
    return deliveredCount >= 3;
};

// --- 4. REDEEM POINTS (Validation & Calculation) ---
// Returns: { pointsToRedeem: Number, error: String | null }
export const validateRedemption = async (userId, pointsRequested, orderTotal, paymentMethod) => {
    if (!pointsRequested || pointsRequested <= 0) return { pointsToRedeem: 0, error: null };

    // 1. Check Unlock
    const isUnlocked = await isRedemptionUnlocked(userId);
    if (!isUnlocked) return { pointsToRedeem: 0, error: "Reward redemption is locked until you complete 3 delivered orders." };

    // 2. Check Order Type (Prepaid only)
    const normalizedPaymentMethod = (paymentMethod || '').toUpperCase();
    if (normalizedPaymentMethod !== 'ONLINE' && normalizedPaymentMethod !== 'UPI' && normalizedPaymentMethod !== 'CARD') {
        return { pointsToRedeem: 0, error: "Rewards can only be redeemed on prepaid orders (UPI or Card)." };
    }

    // 3. Check Max Redemption (50% of Order)
    const maxRedeemable = Math.floor(orderTotal * 0.50);
    if (pointsRequested > maxRedeemable) {
        return {
            pointsToRedeem: 0,
            error: `You can only redeem up to ${maxRedeemable} points (50% of order value).`
        };
    }

    // 4. Check Balance
    const user = await User.findById(userId);
    if (!user || user.salonOwnerProfile.rewardPoints.available < pointsRequested) {
        return { pointsToRedeem: 0, error: "Insufficient reward balance." };
    }

    return { pointsToRedeem: pointsRequested, error: null };
};

// --- 5. FINALIZE REDEMPTION (Execute Deduction) ---
export const executeRedemption = async (userId, orderId, pointsUsed) => {
    if (pointsUsed <= 0) return;

    // 1. Deduct from User Wallet
    await User.findByIdAndUpdate(userId, {
        $inc: { 'salonOwnerProfile.rewardPoints.available': -pointsUsed }
    });

    // 2. Deduct from Ledgers (FIFO)
    let remainingToDeduct = pointsUsed;

    // Fetch active ledgers, oldest expiry first
    const activeLedgers = await RewardLedger.find({
        userId,
        status: 'ACTIVE',
        pointsRemaining: { $gt: 0 }
    }).sort({ expiresAt: 1 });

    for (const ledger of activeLedgers) {
        if (remainingToDeduct <= 0) break;

        const deduction = Math.min(ledger.pointsRemaining, remainingToDeduct);

        ledger.pointsRemaining -= deduction;
        if (ledger.pointsRemaining === 0) {
            ledger.status = 'FULLY_REDEEMED';
        }
        await ledger.save();

        remainingToDeduct -= deduction;
    }

    // 3. Log Transaction
    await WalletTransaction.create({
        userId,
        orderId,
        type: 'REWARD_REDEEMED',
        amount: pointsUsed,
        status: 'COMPLETED',
        description: `Redeemed ${pointsUsed} points for order #${orderId}`
    });
};

// --- 6. REVERSE REDEMPTION (On Refund/Cancel) ---
export const reverseRedemption = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order || !order.pointsUsed || order.pointsUsed <= 0) return;

    const pointsToRefund = order.pointsUsed;

    // 1. Refund to User Wallet
    await User.findByIdAndUpdate(order.customerId, {
        $inc: { 'salonOwnerProfile.rewardPoints.available': pointsToRefund }
    });

    // 2. We need to "Put back" the points into Ledgers?
    // That's complex because we consumed FIFO.
    // Easier strategy: Create a NEW "Refunded" Ledger entry with short expiry?
    // OR just add to the most recent Active ledger?
    // OR create a special "REFUND_CREDIT" ledger.
    // Let's create a new Ledger entry for simplicity and distinct tracking.
    // Expiry? Let's give it the original 4 months from NOW (fresh start) or try to restore original expiry.
    // Given complexity, let's give it a standard 4 month expiry or reasonable time.
    // Let's stick to: Create a new ACTIVE ledger.

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 4);

    await RewardLedger.create({
        userId: order.customerId,
        orderId: order._id, // References the cancelled order (source of refund)
        pointsEarned: pointsToRefund,
        pointsRemaining: pointsToRefund,
        status: 'ACTIVE',
        expiresAt: expiryDate,
        activatedAt: new Date()
    });

    // 3. Log Transaction
    await WalletTransaction.create({
        userId: order.customerId,
        orderId: order._id,
        type: 'REWARD_EARNED', // Technically earned back
        amount: pointsToRefund,
        status: 'COMPLETED',
        description: `Points reversed from cancelled order #${order.orderNumber}`
    });
};

// --- 7. EXPIRY CRON LOGIC ---
export const processExpiredRewards = async () => {
    const now = new Date();

    const expiredLedgers = await RewardLedger.find({
        status: 'ACTIVE',
        expiresAt: { $lt: now }
    });

    let count = 0;
    for (const ledger of expiredLedgers) {
        const amountToExpire = ledger.pointsRemaining;

        if (amountToExpire > 0) {
            // 1. Deduct from User
            await User.findByIdAndUpdate(ledger.userId, {
                $inc: { 'salonOwnerProfile.rewardPoints.available': -amountToExpire }
            });

            // 2. Update Ledger
            ledger.status = 'EXPIRED';
            ledger.pointsRemaining = 0;
            await ledger.save();

            // 3. Log Transaction
            await WalletTransaction.create({
                userId: ledger.userId,
                orderId: ledger.orderId,
                type: 'REWARD_EXPIRED',
                amount: amountToExpire,
                status: 'COMPLETED',
                description: `Points expired from order #${ledger.orderId}`
            });

            // 4. Notify
            await notificationService.createNotification({
                userId: ledger.userId,
                title: 'Points Expired',
                description: `Your ${amountToExpire} reward points expired today.`,
                type: 'REWARD',
                priority: 'HIGH'
            });

            count++;
        }
    }

    return count;
};
