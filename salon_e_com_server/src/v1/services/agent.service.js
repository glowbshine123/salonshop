import User from '../models/User.js';
import Order from '../models/Order.js';

export const getAgentStats = async (agentId) => {
    const user = await User.findById(agentId);
    if (!user) throw new Error('Agent not found');

    const AgentProfile = (await import('../models/AgentProfile.js')).default;
    const agentProfile = await AgentProfile.findOne({ userId: agentId });
    if (!agentProfile) throw new Error('Agent profile missing');

    const SalonOwnerProfile = (await import('../models/SalonOwnerProfile.js')).default;
    const salonProfiles = await SalonOwnerProfile.find({ agentId });
    const salonIds = salonProfiles.map(s => s.userId);

    const salons = await User.find({ _id: { $in: salonIds } });

    const orders = await Order.find({ customerId: { $in: salonIds } }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    // We removed pending wallet concepts earlier, tracking 'totalEarnings' & 'wallet.available' instead
    const pendingCommission = 0; // Legacy mapping 
    const earnedCommission = agentProfile.totalEarnings || 0;

    // Reorder behavior insights: Group by customer and check average days between orders
    const salonInsights = salons.map(salon => {
        const salonOrders = orders.filter(o => o.customerId.toString() === salon._id.toString());
        const orderCount = salonOrders.length;
        const sProfile = salonProfiles.find(p => p.userId.toString() === salon._id.toString());

        return {
            salonId: salon._id,
            salonName: sProfile?.salonName || `${salon.firstName} ${salon.lastName}`,
            email: salon.email,
            orderCount,
            lastOrderDate: salonOrders[0]?.createdAt || null,
            totalSpent: salonOrders.reduce((sum, o) => sum + o.total, 0),
            shippingAddress: sProfile?.shippingAddresses?.[0] || null,
            createdAt: salon.createdAt,
        };
    });

    return {
        stats: {
            totalSalons: salons.length,
            totalOrders,
            pendingCommission,
            earnedCommission,
            availableBalance: agentProfile.wallet?.available || 0
        },
        salons: salonInsights,
        recentOrders: orders.slice(0, 10)
    };
};
