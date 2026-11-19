import * as rewardService from '../services/reward.service.js';

export const getRewardWallet = async (req, res) => {
    try {
        const wallet = await rewardService.getRewardWallet(req.user._id);
        if (!wallet) {
            return res.status(404).json({ message: 'Reward wallet not found' });
        }
        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRewardTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await rewardService.getRewardTransactions(req.user._id, page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
