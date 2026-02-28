import User from '../models/User.js';
import SalonOwnerProfile from '../models/SalonOwnerProfile.js';
import Order from '../models/Order.js';
import RewardLedger from '../models/RewardLedger.js';
import RewardTransaction from '../models/RewardTransaction.js';
import * as notificationService from './notification.service.js';

// --- 8. GET REWARD DATA (API Support) ---
export const getRewardWallet = async (userId) => {
    const profile = await SalonOwnerProfile.findOne({ userId }).select('rewardPoints');
    if (!profile) return null;

    // Get active ledgers for detailed breakdown
    const activeLedgers = await RewardLedger.find({
        userId,
        status: 'ACTIVE',
        pointsRemaining: { $gt: 0 }
    }).sort({ expiresAt: 1 });

    // Check unlocking status
    const isUnlocked = await isRedemptionUnlocked(userId);
    const eligibleCount = await getEligibleOrderCount(userId);
    const lastRedemptionCount = profile.rewardPoints?.ordersCountAtLastRedemption || 0;
    const ordersSinceLastRedemption = Math.max(0, eligibleCount - lastRedemptionCount);

    return {
        balance: profile.rewardPoints?.available || 0,
        locked: profile.rewardPoints?.locked || 0,
        lifetimeEarned: profile.rewardPoints?.totalLifetimeEarned || 0,
        isUnlocked,
        deliveredOrdersCount: eligibleCount, // Frontend expects this for progress bar
        ordersSinceLastRedemption,
        ordersNeededForUnlock: Math.max(0, 3 - ordersSinceLastRedemption),
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

    const total = await RewardTransaction.countDocuments(query);
    const transactions = await RewardTransaction.find(query)
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

// --- HELPER: Get Delivered Order Count (Any active order - for first order detection) ---
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

export const getEligibleOrderCount = async (userId) => {
    // We need to fetch all delivered/completed orders to check chronology
    const allValidOrders = await Order.find({
        customerId: userId,
        status: { $in: [/delivered/i, /completed/i] }
    }).sort({ createdAt: 1 }); // Oldest first

    if (allValidOrders.length === 0) return 0;

    let eligibleCount = 0;

    for (let i = 0; i < allValidOrders.length; i++) {
        const order = allValidOrders[i];

        // 0. Orders where points were redeemed DO NOT count towards the next unlock.
        if (order.pointsUsed && order.pointsUsed > 0) {
            continue;
        }

        // 1. The FIRST valid order is ALWAYS eligible.
        if (i === 0) {
            eligibleCount++;
            continue;
        }

        // 2. Subsequent orders MUST be > 1000 AND Prepaid
        const normalizedPaymentMethod = (order.paymentMethod || '').toUpperCase();
        const isPrepaid = normalizedPaymentMethod !== 'COD' && normalizedPaymentMethod !== 'POSTPAID' && normalizedPaymentMethod !== 'POST PAID';

        if (order.total > 1000 && isPrepaid) {
            eligibleCount++;
        }
    }

    return eligibleCount;
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

// --- 1.5 LOCK POINTS (On Checkout) ---
export const lockOrderRewards = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order || !order.customerId || !order.salonRewardPoints || order.salonRewardPoints.earned <= 0) return;

    const pointsToLock = order.salonRewardPoints.earned;

    await SalonOwnerProfile.findOneAndUpdate({ userId: order.customerId }, {
        $inc: { 'rewardPoints.locked': pointsToLock }
    });

    let transaction = await RewardTransaction.findOne({ orderId: order._id, type: { $in: ['REWARD_EARNED', 'REWARD_LOCKED'] } });
    if (!transaction) {
        await RewardTransaction.create({
            userId: order.customerId,
            orderId: order._id,
            type: 'REWARD_LOCKED',
            amount: pointsToLock,
            status: 'PENDING',
            description: `Rewards locked pending delivery for order #${order.orderNumber}`,
            timeline: [{ status: 'PENDING', note: 'Rewards Locked' }]
        });
    }
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

        // 2. Update Salon Owner Wallet
        await SalonOwnerProfile.findOneAndUpdate({ userId: order.customerId }, {
            $inc: {
                'rewardPoints.locked': -pointsToEarn,
                'rewardPoints.available': pointsToEarn,
                'rewardPoints.totalLifetimeEarned': pointsToEarn
            }
        });

        // 3. Log Transaction - Update existing or create new
        let transaction = await RewardTransaction.findOne({ orderId: order._id, type: { $in: ['REWARD_EARNED', 'REWARD_LOCKED'] } });

        if (transaction) {
            transaction.type = 'REWARD_EARNED';
            transaction.status = 'COMPLETED';
            transaction.expiresAt = expiryDate;
            transaction.description = `Earned rewards for order #${order.orderNumber}`;
            transaction.timeline.push({ status: 'COMPLETED', note: 'Rewards Earned and Unlocked' });
            await transaction.save();
        } else {
            await RewardTransaction.create({
                userId: order.customerId,
                orderId: order._id,
                type: 'REWARD_EARNED',
                amount: pointsToEarn,
                status: 'COMPLETED',
                expiresAt: expiryDate,
                description: `Earned rewards for order #${order.orderNumber}`,
                timeline: [{ status: 'COMPLETED', note: 'Rewards Earned and Unlocked' }]
            });
        }

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
    const profile = await SalonOwnerProfile.findOne({ userId }).select('rewardPoints');
    if (!profile) return false;

    const eligibleCount = await getEligibleOrderCount(userId);
    const lastRedemptionCount = profile.rewardPoints?.ordersCountAtLastRedemption || 0;

    // "After 3 eligible orders since last redemption (or start) -> user becomes eligible"
    const ordersSinceLastRedemption = Math.max(0, eligibleCount - lastRedemptionCount);
    return ordersSinceLastRedemption >= 3;
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
    const profile = await SalonOwnerProfile.findOne({ userId });
    if (!profile || (profile.rewardPoints?.available || 0) < pointsRequested) {
        return { pointsToRedeem: 0, error: "Insufficient reward balance." };
    }

    return { pointsToRedeem: pointsRequested, error: null };
};

// --- 5. FINALIZE REDEMPTION (Execute Deduction) ---
export const executeRedemption = async (userId, orderId, pointsUsed) => {
    if (pointsUsed <= 0) return;

    // 1. Deduct from User Wallet & Update Last Redemption Order Count
    // To properly lock it for the NEXT 3 orders, we snap the 'last redemption count'
    // directly to whatever their current eligible count is.
    // e.g., if they are at 5 orders and redeem, we set lastRedemption = 5.
    // The unlock logic computes: Math.max(0, current_count - 5) >= 3.
    // Thus it will stay locked until they hit 8 eligible orders.
    const currentEligibleCount = await getEligibleOrderCount(userId);
    await SalonOwnerProfile.findOneAndUpdate({ userId }, {
        $inc: { 'rewardPoints.available': -pointsUsed },
        $set: { 'rewardPoints.ordersCountAtLastRedemption': currentEligibleCount }
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
    let transaction = await RewardTransaction.findOne({ orderId, type: 'REWARD_REDEEMED' });
    if (!transaction) {
        await RewardTransaction.create({
            userId,
            orderId,
            type: 'REWARD_REDEEMED',
            amount: pointsUsed,
            status: 'COMPLETED',
            description: `Redeemed ${pointsUsed} points for order #${orderId}`,
            timeline: [{ status: 'COMPLETED', note: 'Points Deducted' }]
        });
    }
};

export const reverseLockedRewards = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order || !order.customerId || !order.salonRewardPoints || order.salonRewardPoints.earned <= 0) return;

    const pointsToReverse = order.salonRewardPoints.earned;

    await SalonOwnerProfile.findOneAndUpdate({ userId: order.customerId }, {
        $inc: { 'rewardPoints.locked': -pointsToReverse }
    });

    let transaction = await RewardTransaction.findOne({ orderId: order._id, type: { $in: ['REWARD_EARNED', 'REWARD_LOCKED'] } });
    if (transaction) {
        transaction.status = 'CANCELLED';
        transaction.timeline.push({ status: 'CANCELLED', note: 'Order Cancelled - Rewards Reversed' });
        await transaction.save();
    }
};

// --- 6. REVERSE REDEMPTION (On Refund/Cancel) ---
export const reverseRedemption = async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order || !order.pointsUsed || order.pointsUsed <= 0) return;

    const pointsToRefund = order.pointsUsed;

    // 1. Refund to User Wallet
    await SalonOwnerProfile.findOneAndUpdate({ userId: order.customerId }, {
        $inc: { 'rewardPoints.available': pointsToRefund }
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

    // 3. Log Transaction - Update existing redeemption transaction if applicable, else create
    let transaction = await RewardTransaction.findOne({ orderId: order._id, type: 'REWARD_REDEEMED' });
    if (transaction) {
        transaction.status = 'CANCELLED';
        transaction.timeline.push({ status: 'CANCELLED', note: 'Order Cancelled - Points Refunded' });
        await transaction.save();
    } else {
        await RewardTransaction.create({
            userId: order.customerId,
            orderId: order._id,
            type: 'REWARD_EARNED', // Technically earned back
            amount: pointsToRefund,
            status: 'COMPLETED',
            description: `Points reversed from cancelled order #${order.orderNumber}`,
            timeline: [{ status: 'COMPLETED', note: 'Refunded' }]
        });
    }
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
            await SalonOwnerProfile.findOneAndUpdate({ userId: ledger.userId }, {
                $inc: { 'rewardPoints.available': -amountToExpire }
            });

            // 2. Update Ledger
            ledger.status = 'EXPIRED';
            ledger.pointsRemaining = 0;
            await ledger.save();

            // 3. Log Transaction
            await RewardTransaction.create({
                userId: ledger.userId,
                orderId: ledger.orderId,
                type: 'REWARD_EXPIRED',
                amount: amountToExpire,
                status: 'COMPLETED',
                description: `Points expired from order #${ledger.orderId}`,
                timeline: [{ status: 'COMPLETED', note: 'Points Expired' }]
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
