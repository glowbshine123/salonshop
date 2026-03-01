
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/v1/models/Order.js';
import * as commissionService from '../src/v1/services/commission.service.js';
import CommissionTransaction from '../src/v1/models/CommissionTransaction.js';
import User from '../src/v1/models/User.js';

dotenv.config();

async function testCommission() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/salon_e_com';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        // 1. Create a dummy agent if not exists
        let agent = await User.findOne({ role: 'AGENT' });
        if (!agent) {
            agent = await User.create({
                firstName: 'Test',
                lastName: 'Agent',
                email: 'testagent@example.com',
                password: 'password123',
                role: 'AGENT'
            });
        }

        // 2. Create a dummy order < 1000 and COD
        const orderData = {
            orderNumber: `TEST-ORD-${Date.now()}`,
            customerId: new mongoose.Types.ObjectId(),
            agentId: agent._id,
            subtotal: 500,
            total: 300, // 500 - 200 reward points
            pointsUsed: 200,
            paymentMethod: 'COD',
            status: 'COMPLETED',
            commissionCalculated: false
        };

        const order = new Order(orderData);
        await order.save();
        console.log('Created test order < 1000 and COD');

        // 3. Calculate commission
        const transaction = await commissionService.calculateCommission(order);

        if (transaction) {
            console.log('✅ Commission calculated successfully!');
            console.log('Commission Amount:', transaction.amount);
            // subtotal is 500, let's say slab is 5%, it should be 25
            console.log('Expected Amount: Check slab for 500');
        } else {
            console.error('❌ Commission calculation failed (returned null)');
        }

        // Cleanup
        await Order.deleteOne({ _id: order._id });
        await CommissionTransaction.deleteOne({ orderId: order._id });
        console.log('Cleanup done');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error during test:', err);
    }
}

testCommission();
