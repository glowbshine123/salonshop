import * as agentService from '../services/agent.service.js';
import * as walletService from '../services/wallet.service.js';
import CommissionTransaction from '../models/CommissionTransaction.js';
import Settlement from '../models/Settlement.js';

export const getDashboard = async (req, res) => {
    try {
        const stats = await agentService.getAgentStats(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAssignedSalons = async (req, res) => {
    try {
        const stats = await agentService.getAgentStats(req.user._id);
        res.json(stats.salons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REMOVED: requestPayout (Legacy)
// REMOVED: getMyPayouts (Legacy)

export const getCommissionTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const month = req.query.month;
        const skip = (page - 1) * limit;

        const query = { agentId: req.user._id };
        if (month) query.month = month;

        const [transactions, total] = await Promise.all([
            CommissionTransaction.find(query)
                .populate('orderId', 'orderNumber')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            CommissionTransaction.countDocuments(query)
        ]);

        res.json({
            items: transactions,
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

export const getSettlements = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [settlements, total] = await Promise.all([
            Settlement.find({ agentId: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Settlement.countDocuments({ agentId: req.user._id })
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
