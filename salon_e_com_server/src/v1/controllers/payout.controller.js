import * as payoutService from '../services/payout.service.js';

export const updatePayoutSettings = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const result = await payoutService.updateAgentPayoutSettings(userId, req.body);
        res.status(200).json({ success: true, agentProfile: result });
    } catch (error) {
        console.error('Payout Settings Update Error:', error);
        res.status(400).json({ message: error.message });
    }
};
