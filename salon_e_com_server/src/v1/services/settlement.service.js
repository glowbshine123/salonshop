import User from '../models/User.js';
import CommissionTransaction from '../models/CommissionTransaction.js';
import Settlement from '../models/Settlement.js';
import AgentProfile from '../models/AgentProfile.js';
import razorpay from '../../config/razorpay.js';
import * as notificationService from './notification.service.js';

/**
 * Processes monthly settlements for agents.
 * Calculates total pending commissions, creates a settlement record,
 * and initiates a Razorpay payout.
 * 
 * @param {string} [manualMonth] - Optional month in YYYY-MM format.
 */
export const processMonthlySettlement = async (manualMonth = null) => {
    console.log('Starting monthly auto-settlement process...');

    // Determine target month (YYYY-MM)
    let targetMonth = manualMonth;
    if (!targetMonth) {
        const now = new Date();
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const year = prevMonthDate.getFullYear();
        const month = String(prevMonthDate.getMonth() + 1).padStart(2, '0');
        targetMonth = `${year}-${month}`;
    }

    const agents = await User.find({ role: 'AGENT' });

    const results = {
        success: 0,
        failed: 0,
        totalAmount: 0,
        skipped: 0
    };

    for (const agent of agents) {
        try {
            // 1. Idempotency Check: Skip if settlement already exists for this month
            const existingSettlement = await Settlement.findOne({
                agentId: agent._id,
                month: targetMonth
            });

            if (existingSettlement && existingSettlement.status !== 'FAILED') {
                console.log(`Settlement already exists for agent ${agent._id} for month ${targetMonth}. Skipping.`);
                results.skipped++;
                continue;
            }

            const agentProfile = await AgentProfile.findOne({ userId: agent._id });

            // 2. Calculate amount from PENDING transactions
            const pendingTransactions = await CommissionTransaction.find({
                agentId: agent._id,
                status: 'PENDING'
            });

            if (pendingTransactions.length === 0) {
                console.log(`No pending transactions for agent ${agent._id}, skipping.`);
                results.skipped++;
                continue;
            }

            const amount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
            const amountInPaise = Math.round(amount * 100);

            // 3. Create or Reuse Settlement record
            let settlement = existingSettlement;
            if (!settlement) {
                settlement = await Settlement.create({
                    agentId: agent._id,
                    amount: amount,
                    month: targetMonth,
                    status: 'PENDING',
                    totalOrders: [...new Set(pendingTransactions.map(t => t.orderId.toString()))].length,
                    totalCommissions: pendingTransactions.length
                });
            } else {
                // If we are retrying a FAILED one
                settlement.amount = amount;
                settlement.status = 'PENDING';
                await settlement.save();
            }

            // 4. Execute Payout
            if (agentProfile && agentProfile.fundAccountId && razorpay.isEnabled) {
                try {
                    const payoutMode = agentProfile.upiId ? 'UPI' : 'IMPS';

                    const payout = await razorpay.payouts.create({
                        account_number: process.env.RAZORPAY_X_ACCOUNT_NUMBER,
                        fund_account_id: agentProfile.fundAccountId,
                        amount: amountInPaise,
                        currency: "INR",
                        mode: payoutMode,
                        purpose: "payout",
                        queue_if_low_balance: true,
                        reference_id: `settlement_${agent._id}_${targetMonth}`,
                        narration: `Monthly commission payout - ${targetMonth}`,
                    });

                    settlement.razorpayPayoutId = payout.id;
                    settlement.status = 'PROCESSING';
                    await settlement.save();

                    results.success++;
                    results.totalAmount += amount;

                } catch (payoutError) {
                    console.error(`Razorpay Payout Failed for agent ${agent._id}:`, payoutError);
                    settlement.status = 'FAILED';
                    await settlement.save();
                    results.failed++;
                }
            } else {
                console.warn(`Skipping payout for agent ${agent._id}: Missing Fund Account or Razorpay disabled.`);
                settlement.status = 'FAILED';
                await settlement.save();
                results.failed++;
            }
        } catch (error) {
            console.error(`Failed to process settlement for agent ${agent._id}:`, error);
            results.failed++;
        }
    }

    console.log('Monthly settlement process completed:', results);

    // Notify Admin
    await notificationService.notifyAdmins({
        title: 'Payout Batch Completed',
        description: `Batch for ${targetMonth} completed. Success: ${results.success}, Failed: ${results.failed}, Skipped: ${results.skipped}. Total: ₹${results.totalAmount}`,
        type: 'PAYMENT',
        priority: 'MEDIUM'
    });

    return results;
};
