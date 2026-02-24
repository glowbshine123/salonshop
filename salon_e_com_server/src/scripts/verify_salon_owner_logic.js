import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import * as rewardService from '../v1/services/reward.service.js';
import * as commissionService from '../v1/services/commission.service.js';

dotenv.config();

async function runTests() {
    await connectDB();
    console.log('--- Salon Owner Logic Verification Started ---');

    const User = (await import('../v1/models/User.js')).default;
    const Order = (await import('../v1/models/Order.js')).default;
    const RewardLedger = (await import('../v1/models/RewardLedger.js')).default;
    const CommissionTransaction = (await import('../v1/models/CommissionTransaction.js')).default;

    try {
        const userId = new mongoose.Types.ObjectId();
        const agentId = new mongoose.Types.ObjectId();

        // 1. Setup Agent for Commission tests
        const agent = await User.create({
            firstName: 'Test',
            lastName: 'Agent',
            email: 'testagent' + Date.now() + '@example.com',
            passwordHash: 'hash',
            role: 'AGENT',
            agentProfile: { totalEarnings: 0, currentMonthEarnings: 0 }
        });

        console.log('\n--- REWARD TESTS ---');

        // Case 1: First Order, COD, Any amount (e.g. 500) -> Should get rewards
        console.log('Case 1: First Order, COD, 500 -> Expected: Rewards (10% of 500 = 50)');
        const points1 = await rewardService.calculatePoints(userId, 500, 'COD', 0);
        console.log(`Rewards: ${points1} (Result: ${points1 === 50 ? 'PASS' : 'FAIL'})`);

        // Case 2: Subsequent Order, COD, 2000 -> Should NOT get rewards
        // Simulate a delivered order first
        await Order.create({
            orderNumber: 'PREV-1-' + Date.now(),
            customerId: userId,
            subtotal: 500,
            total: 500,
            status: 'DELIVERED',
            paymentMethod: 'CARD'
        });
        console.log('Case 2: Subsequent Order, COD, 2000 -> Expected: 0 Rewards');
        const points2 = await rewardService.calculatePoints(userId, 2000, 'COD', 0);
        console.log(`Rewards: ${points2} (Result: ${points2 === 0 ? 'PASS' : 'FAIL'})`);

        // Case 3: Subsequent Order, card (lowercase), 1500 -> Should get rewards (Test Case Sensitive)
        console.log('Case 3: Subsequent Order, card (lowercase), 1500 -> Expected: Rewards (150)');
        const points3 = await rewardService.calculatePoints(userId, 1500, 'card', 0);
        console.log(`Rewards: ${points3} (Result: ${points3 === 150 ? 'PASS' : 'FAIL'})`);

        console.log('\n--- COMMISSION TESTS ---');

        // Case 4: First Order, COD, 20000 -> Should get commission (User's reported failure case)
        // Reset Orders for this case (except the agent)
        await Order.deleteMany({ customerId: userId });
        await RewardLedger.deleteMany({ userId });
        console.log('Case 4: First Order, COD, 20000 -> Expected: Commission (True)');
        const order4 = await Order.create({
            orderNumber: 'FIRST-AGENT-' + Date.now(),
            customerId: userId,
            agentId: agent._id,
            total: 20000,
            subtotal: 20000,
            paymentMethod: 'COD',
            status: 'COMPLETED'
        });
        const comm4 = await commissionService.calculateCommission(order4);
        console.log(`Commission Created: ${!!comm4} (Result: ${!!comm4 === true ? 'PASS' : 'FAIL'})`);

        // Case 5: Subsequent Order, COD, 20000 -> Should NOT get commission
        // (order4 is already completed, so it counts as 1 delivered order now)
        console.log('Case 5: Subsequent Order, COD, 20000 -> Expected: Commission (False)');
        const order5 = await Order.create({
            orderNumber: 'SUB-COD-' + Date.now(),
            customerId: userId,
            agentId: agent._id,
            total: 20000,
            subtotal: 20000,
            paymentMethod: 'COD',
            status: 'COMPLETED'
        });
        const comm5 = await commissionService.calculateCommission(order5);
        console.log(`Commission Created: ${!!comm5} (Result: ${!!comm5 === false ? 'PASS' : 'FAIL'})`);

        // Cleanup
        await User.deleteOne({ _id: agent._id });
        await Order.deleteMany({ customerId: userId });
        await RewardLedger.deleteMany({ userId });

        const txIds = [comm4, comm5]
            .filter(c => c && c._id)
            .map(c => c._id);

        if (txIds.length > 0) {
            await CommissionTransaction.deleteMany({ _id: { $in: txIds } });
        }

    } catch (error) {
        console.error('Test failed:', error.stack || error);
    } finally {
        await mongoose.connection.close();
        console.log('\n--- Verification Finished ---');
    }
}

runTests();
