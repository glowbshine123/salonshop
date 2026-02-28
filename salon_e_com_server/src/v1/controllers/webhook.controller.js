import Settlement from '../models/Settlement.js';
import CommissionTransaction from '../models/CommissionTransaction.js';
import AgentProfile from '../models/AgentProfile.js';
import * as notificationService from '../services/notification.service.js';
import crypto from 'crypto';

export const handleRazorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        // Verify signature if secret is provided
        if (secret && signature) {
            const shasum = crypto.createHmac('sha256', secret);
            shasum.update(JSON.stringify(req.body));
            const digest = shasum.digest('hex');

            if (signature !== digest) {
                console.warn('[webhook] Invalid signature');
                return res.status(400).json({ message: 'Invalid signature' });
            }
        }

        const { event, payload } = req.body;
        console.log(`[webhook] Received event: ${event}`);

        if (event.startsWith('payout.')) {
            const payout = payload.payout.entity;
            const payoutId = payout.id;
            const status = payout.status;

            const settlement = await Settlement.findOne({ razorpayPayoutId: payoutId });
            if (!settlement) {
                console.warn(`[webhook] Settlement not found for payoutId: ${payoutId}`);
                return res.status(200).json({ status: 'ignored' });
            }

            if (event === 'payout.processed') {
                settlement.status = 'SUCCESS';
                settlement.settledAt = new Date();
                await settlement.save();

                // 1. Mark transactions as SETTLED
                await CommissionTransaction.updateMany(
                    { agentId: settlement.agentId, status: 'PENDING' },
                    { status: 'SETTLED' }
                );

                // 2. Reset earnings in AgentProfile
                const agentProfile = await AgentProfile.findOne({ userId: settlement.agentId });
                if (agentProfile) {
                    agentProfile.currentMonthEarnings = 0;
                    agentProfile.lastSettlementDate = new Date();
                    await agentProfile.save();
                }

                // 3. Notify Agent
                await notificationService.createNotification({
                    userId: settlement.agentId,
                    title: 'Payout Successful',
                    description: `Your payout of ₹${settlement.amount} has been processed successfully.`,
                    type: 'PAYMENT',
                    priority: 'HIGH',
                    metadata: { settlementId: settlement._id }
                });

            } else if (['payout.failed', 'payout.rejected', 'payout.reversed'].includes(event)) {
                settlement.status = 'FAILED';
                await settlement.save();

                // Notify Agent of failure
                await notificationService.createNotification({
                    userId: settlement.agentId,
                    title: 'Payout Failed',
                    description: `Your payout of ₹${settlement.amount} failed (${status}). Please check your bank details.`,
                    type: 'PAYMENT',
                    priority: 'HIGH',
                    metadata: { settlementId: settlement._id }
                });
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (error) {
        console.error('[webhook] Error:', error);
        res.status(500).json({ message: error.message });
    }
};
