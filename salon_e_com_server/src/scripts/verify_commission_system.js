
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../v1/models/User.js';
import Order from '../v1/models/Order.js';
import CommissionTransaction from '../v1/models/CommissionTransaction.js';
import Settlement from '../v1/models/Settlement.js';
import * as commissionService from '../v1/services/commission.service.js';
import * as settlementService from '../v1/services/settlement.service.js';

dotenv.config();

async function runVerification() {
    await connectDB();
    console.log('--- Verification Started ---');

    try {
        // 1. Create a Unique Agent
        console.log('Creating unique dummy agent...');
        const agent = await User.create({
            firstName: 'Audit',
            lastName: 'Test',
            email: 'auditagent' + Date.now() + '@example.com',
            passwordHash: 'hashed_password_for_testing',
            role: 'AGENT',
            agentProfile: {
                totalEarnings: 0,
                currentMonthEarnings: 0
            }
        });

        const AgentProfile = (await import('../v1/models/AgentProfile.js')).default;
        const agentProfile = await AgentProfile.findOne({ userId: agent._id });

        // 1.1 Find or create a Customer
        let customer = await User.findOne({ role: 'SALON_OWNER' });
        if (!customer) {
            console.log('Creating dummy customer...');
            customer = await User.create({
                firstName: 'Test',
                lastName: 'Customer',
                email: 'testcustomer' + Date.now() + '@example.com',
                passwordHash: 'hashed_password_for_testing',
                role: 'SALON_OWNER'
            });
        }

        const initialTotal = agentProfile?.totalEarnings || 0;
        const initialMonth = agentProfile?.currentMonthEarnings || 0;
        console.log(`Agent: ${agent.email}`);
        console.log(`Initial Total: ${initialTotal}, Initial Month: ${initialMonth}`);

        // 2. Create a dummy order
        console.log('Creating dummy order...');
        const order = await Order.create({
            orderNumber: 'ORD-' + Date.now(),
            customerId: customer._id,
            agentId: agent._id,
            subtotal: 1000,
            total: 1080,
            status: 'COMPLETED',
            agentCommission: {
                rate: 0.1,
                amount: 100
            }
        });

        // 3. Simulate order completion
        console.log('Simulating order completion...');
        await commissionService.calculateCommission(order);

        // 4. Verify earnings updated
        const updatedProfile = await AgentProfile.findOne({ userId: agent._id });
        console.log(`Updated Total: ${updatedProfile.totalEarnings}`);
        console.log(`Updated Month: ${updatedProfile.currentMonthEarnings}`);

        if (updatedProfile.currentMonthEarnings === initialMonth + 100) {
            console.log('✅ Earnings updated correctly.');
        } else {
            console.error('❌ Earnings update failed.');
        }

        // 5. Verify transaction created
        const transaction = await CommissionTransaction.findOne({ orderId: order._id });
        if (transaction && transaction.amount === 100 && transaction.status === 'PENDING') {
            console.log('✅ CommissionTransaction created and PENDING.');
        } else {
            console.error('❌ CommissionTransaction verification failed.');
        }

        // 6. Simulate Monthly Settlement
        console.log('Triggering Monthly Settlement...');
        const settlementResults = await settlementService.processMonthlySettlement();
        console.log(`Settlement Results: ${JSON.stringify(settlementResults)}`);

        // 7. Verify settlement
        const finalizedProfile = await AgentProfile.findOne({ userId: agent._id });
        const settlement = await Settlement.findOne({ agentId: agent._id }).sort({ createdAt: -1 });

        if (finalizedProfile.currentMonthEarnings === 0 && settlement && settlement.setid) {
            console.log(`✅ Settlement processed: currentMonthEarnings reset, Settlement created with setid: ${settlement.setid}`);
            console.log(`✅ Summary Counts: Orders: ${settlement.totalOrders}, Commissions: ${settlement.totalCommissions}`);
            if (settlement.totalOrders === 1 && settlement.totalCommissions === 1) {
                console.log('✅ Counts are accurate.');
            } else {
                console.error('❌ Counts are inaccurate.');
            }
        } else {
            console.error('❌ Settlement verification failed (missing setid or earnings not reset).');
        }

        const settledTransaction = await CommissionTransaction.findOne({ orderId: order._id });
        if (settledTransaction && settledTransaction.status === 'SETTLED') {
            console.log('✅ CommissionTransaction status updated to SETTLED.');
        } else {
            console.error('❌ Settlement status update failed for transaction.');
        }

        // 8. Test Idempotency
        console.log('Testing Idempotency (Running settlement again)...');
        const secondRun = await settlementService.processMonthlySettlement();
        if (secondRun.success === 0) {
            console.log('✅ Idempotency check passed: No duplicate settlement created.');
        } else {
            console.error('❌ Idempotency check failed: Duplicate settlement might have been created.');
        }

        // Cleanup (Optional)
        // await Order.deleteOne({ _id: order._id });
        // await CommissionTransaction.deleteMany({ agentId: agent._id });
        // await Settlement.deleteMany({ agentId: agent._id });

    } catch (error) {
        console.error('An error occurred during verification:', error);
    } finally {
        await mongoose.connection.close();
        console.log('--- Verification Finished ---');
    }
}

runVerification();
