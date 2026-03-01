import * as walletService from '../services/wallet.service.js';
import * as commissionSlabService from '../services/commissionSlab.service.js';
import * as settlementService from '../services/settlement.service.js';
import Settlement from '../models/Settlement.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Commission from '../models/Commission.js';
import SystemSettings from '../models/SystemSettings.js';

// REMOVED: getPayoutRequests (Legacy)
// REMOVED: approvePayout (Legacy)

export const getAllSettlements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { search, month } = req.query;

        let query = {};
        if (month) query.month = month;
        if (search) {
            query.$or = [
                { setid: { $regex: search, $options: 'i' } },
                // Note: Searching by populated field (agentId.firstName/lastName) in Mongoose 
                // requires either aggregation or a two-step query. For simplicity here, 
                // we'll use a regex on setid and handle name search if possible.
                // A better approach is to find matching users first.
            ];

            // Search users by name first
            const matchingUsers = await User.find({
                role: 'AGENT',
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            if (matchingUsers.length > 0) {
                query.$or.push({ agentId: { $in: matchingUsers.map(u => u._id) } });
            }
        }

        const [settlements, total] = await Promise.all([
            Settlement.find(query)
                .populate('agentId', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Settlement.countDocuments(query)
        ]);

        res.json({
            items: settlements,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSlab = async (req, res) => {
    try {
        const slab = await commissionSlabService.createSlab(req.body);
        res.status(201).json(slab);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getSlabs = async (req, res) => {
    try {
        const slabs = await commissionSlabService.getAllSlabs();
        res.json(slabs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSlab = async (req, res) => {
    try {
        const { id } = req.params;
        const slab = await commissionSlabService.updateSlab(id, req.body);
        res.json(slab);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const triggerAutoDisbursement = async (req, res) => {
    try {
        const results = await settlementService.processMonthlySettlement();
        res.json({
            message: 'Automated monthly settlement batch completed',
            results
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const { timeRange = 'lifetime' } = req.query;

        // Date Filter Logic
        let startDate = new Date(0); // Default to beginning of time
        const now = new Date();

        switch (timeRange) {
            case 'today':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'last_week':
                startDate = new Date();
                startDate.setDate(now.getDate() - 7);
                break;
            case 'last_month':
                startDate = new Date();
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'last_3_months':
                startDate = new Date();
                startDate.setMonth(now.getMonth() - 3);
                break;
            case 'last_6_months':
                startDate = new Date();
                startDate.setMonth(now.getMonth() - 6);
                break;
            case 'last_year':
                startDate = new Date();
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            case 'lifetime':
            default:
                startDate = new Date(0);
                break;
        }

        // 1. Total Revenue (sum of total for paid/completed orders within date range)
        const validStatuses = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'];

        const revenueAgg = await Order.aggregate([
            {
                $match: {
                    status: { $in: validStatuses },
                    createdAt: { $gte: startDate }
                }
            },
            { $group: { _id: null, total: { $sum: "$total" } } }
        ]);
        const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        // 2. Total Orders (count of all orders within date range)
        const totalOrders = await Order.countDocuments({
            createdAt: { $gte: startDate }
        });

        // 3. Expiry Count (Products expiring in next 30 days) - Unaffected by timeRange
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const current = new Date();

        const closeToExpiryCount = await Product.countDocuments({
            expiryDate: { $gte: current, $lte: thirtyDaysFromNow }
        });

        const lowStockCount = await Product.countDocuments({
            inventoryCount: { $lt: 10 }
        });

        // 4. Graphs - Data within range (or last 30 days if range is small/lifetime? No, maintain range)
        // For graphs, if 'lifetime' or long ranges, we might want to group by month instead of day to avoid too many points.
        // For now, let's keep it daily but respect the startDate.

        // Revenue Graph
        const revenueGraph = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    status: { $in: validStatuses }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$total" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Orders Graph (Count)
        const ordersGraph = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 5. Recent Data - Unaffected by timeRange (Always show absolute latest)
        // Recent Orders (Limit 10)
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('customerId', 'firstName lastName email')
            .populate('agentId', 'firstName lastName email');

        // New Agents (Limit 5)
        const agentUsers = await User.find({ role: 'AGENT' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName email createdAt')
            .lean();

        const AgentProfile = (await import('../models/AgentProfile.js')).default;
        const agentProfiles = await AgentProfile.find({ userId: { $in: agentUsers.map(u => u._id) } }).lean();

        const newAgents = agentUsers.map(u => ({
            ...u,
            agentProfile: agentProfiles.find(p => p.userId.toString() === u._id.toString())
        }));

        // New Users/Salon Owners (Limit 5)
        const newSalonOwners = await User.find({ role: { $in: ['CUSTOMER', 'SALON_OWNER'] } })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName email createdAt role');

        res.json({
            stats: {
                totalRevenue,
                totalOrders,
                closeToExpiryCount,
                lowStockCount
            },
            graphs: {
                revenue: revenueGraph.map(item => ({ date: item._id, value: item.revenue })),
                orders: ordersGraph.map(item => ({ date: item._id, count: item.count }))
            },
            recent: {
                orders: recentOrders,
                agents: newAgents,
                users: newSalonOwners
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = await SystemSettings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSystemSettings = async (req, res) => {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
