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

                    // 5. Post-Payout Internal Ledger Updates
                    // Mark all pending transactions as SETTLED for this agent
                    await CommissionTransaction.updateMany(
                        { agentId: agent._id, status: 'PENDING' },
                        { $set: { status: 'SETTLED' } }
                    );

                    // Reset Current Month Yield (as it has been settled/payout triggered)
                    if (agentProfile) {
                        agentProfile.currentMonthEarnings = 0;
                        agentProfile.lastSettlementDate = new Date();
                        await agentProfile.save();
                    }

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



    // Notify Admin
    await notificationService.notifyAdmins({
        title: 'Payout Batch Completed',
        description: `Batch for ${targetMonth} completed. Success: ${results.success}, Failed: ${results.failed}, Skipped: ${results.skipped}. Total: ₹${results.totalAmount}`,
        type: 'PAYMENT',
        priority: 'MEDIUM'
    });

    return results;
};

/**
 * Creates a manual settlement record.
 */
export const createManualSettlement = async (data) => {
    const { agentId, amount, month, payoutMethod, transactionId, notes, status } = data;

    const settlement = await Settlement.create({
        agentId,
        amount,
        month,
        payoutMethod,
        transactionId,
        notes,
        status,
        settledAt: status === 'paid' ? new Date() : null
    });

    if (status === 'paid') {
        await applySettlementAccounting(agentId, amount);
    }

    return settlement;
};

/**
 * Updates an existing settlement record and handles accounting if status changes to 'paid'.
 */
export const updateSettlementStatus = async (settlementId, updateData) => {
    const settlement = await Settlement.findById(settlementId);
    if (!settlement) throw new Error('Settlement not found');

    const previousStatus = settlement.status;
    const newStatus = updateData.status;

    Object.assign(settlement, updateData);

    if (newStatus === 'paid' && previousStatus !== 'paid') {
        settlement.settledAt = new Date();
    } else if (newStatus !== 'paid' && previousStatus === 'paid') {
        settlement.settledAt = null;
    }

    await settlement.save();

    // Always sync accounting if either the old or new status is 'paid'
    if (newStatus === 'paid' || previousStatus === 'paid') {
        await applySettlementAccounting(settlement.agentId, settlement.amount, newStatus === 'paid' && previousStatus !== 'paid');
    }

    return settlement;
};

/**
 * Internal accounting helper for paid settlements.
 */
async function applySettlementAccounting(agentId, amount, isMarkingAsPaid = true) {
    const agentProfile = await AgentProfile.findOne({ userId: agentId });
    if (agentProfile) {
        // Recalculate lifetime total earnings from all PAID settlements
        const paidSettlements = await Settlement.find({ agentId, status: 'paid' });
        const totalLifetimeSettled = paidSettlements.reduce((sum, s) => sum + s.amount, 0);

        agentProfile.totalEarnings = totalLifetimeSettled;

        if (isMarkingAsPaid) {
            agentProfile.currentMonthEarnings = Math.max(0, (agentProfile.currentMonthEarnings || 0) - amount);
            agentProfile.lastSettlementDate = new Date();

            // Update all PENDING transactions to SETTLED
            await CommissionTransaction.updateMany(
                { agentId, status: 'PENDING' },
                { $set: { status: 'SETTLED' } }
            );
        } else {
            // Reverting status away from 'paid'
            agentProfile.currentMonthEarnings = (agentProfile.currentMonthEarnings || 0) + amount;
        }

        await agentProfile.save();
    }
}
