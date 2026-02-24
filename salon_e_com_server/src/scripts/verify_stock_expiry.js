
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon_e_com';

async function runVerification() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const resolveImport = (relPath) => pathToFileURL(path.resolve(__dirname, relPath)).href;

        const { default: Product } = await import(resolveImport('../v1/models/Product.js'));
        const { default: Order } = await import(resolveImport('../v1/models/Order.js'));
        const { default: Cart } = await import(resolveImport('../v1/models/Cart.js'));
        const { default: User } = await import(resolveImport('../v1/models/User.js'));
        const productService = await import(resolveImport('../v1/services/product.service.js'));
        const cartService = await import(resolveImport('../v1/services/cart.service.js'));
        const orderService = await import(resolveImport('../v1/services/order.service.js'));

        const userId = new mongoose.Types.ObjectId();
        await Cart.deleteMany({ userId });

        const testProduct = await Product.create({
            name: 'Verification Product',
            slug: `verify-${Date.now()}`,
            price: 1000,
            inventoryCount: 10,
            category: 'Testing',
            status: 'ACTIVE'
        });

        console.log('\n--- Scenario 1: Stock Reservation in Cart ---');
        console.log(`Initial Stock: ${testProduct.inventoryCount}`);

        await cartService.addToCart(userId, testProduct._id.toString(), 2);
        const productAfterCart = await Product.findById(testProduct._id);
        console.log(`Stock after adding 2 to cart: ${productAfterCart.inventoryCount} (Expected: 8)`);
        if (productAfterCart.inventoryCount !== 8) throw new Error('Stock reservation failed');

        console.log('\n--- Scenario 2: Purchase Stock Logic ---');
        const order = await orderService.createOrder(userId, {
            items: [{ productId: testProduct._id.toString(), quantity: 2 }],
            shippingAddress: { name: 'Test', street: '123 Test St', city: 'Test City', zip: '123456' },
            paymentMethod: 'COD'
        });

        const productAfterPurchase = await Product.findById(testProduct._id);
        console.log(`Stock after purchase: ${productAfterPurchase.inventoryCount} (Expected: 8)`);
        if (productAfterPurchase.inventoryCount !== 8) throw new Error('Stock double decremented or restored incorrectly');

        const cartAfterPurchase = await Cart.findOne({ userId });
        console.log(`Cart items count: ${cartAfterPurchase.items.length} (Expected: 0)`);
        if (cartAfterPurchase.items.length !== 0) throw new Error('Cart not cleared after purchase');

        console.log('\n--- Scenario 3: Cancellation Stock Restoration ---');
        await orderService.updateOrderStatus(order._id, 'CANCELLED');
        const productAfterCancel = await Product.findById(testProduct._id);
        console.log(`Stock after cancellation: ${productAfterCancel.inventoryCount} (Expected: 10)`);
        if (productAfterCancel.inventoryCount !== 10) throw new Error('Stock not restored on cancellation');

        console.log('\n--- Scenario 4: Product Expiry Logic ---');
        const expiredProduct = await Product.create({
            name: 'Expired Product',
            slug: `expired-${Date.now()}`,
            price: 500,
            inventoryCount: 5,
            category: 'Testing',
            status: 'ACTIVE',
            expiryDate: new Date(Date.now() - 86400000) // Yesterday
        });

        console.log(`Initial Status: ${expiredProduct.status}`);
        await productService.listProducts(); // Triggers expiry check

        const updatedExpiredProduct = await Product.findById(expiredProduct._id);
        console.log(`Status after check: ${updatedExpiredProduct.status} (Expected: EXPIRED)`);
        if (updatedExpiredProduct.status !== 'EXPIRED') throw new Error('Expiry status not updated');

        // Cleanup
        await Product.deleteOne({ _id: testProduct._id });
        await Product.deleteOne({ _id: expiredProduct._id });
        await Order.deleteOne({ _id: order._id });
        await Cart.deleteOne({ userId });

        console.log('\nVerification Passed!');
        process.exit(0);
    } catch (err) {
        console.error('\nVerification Failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

runVerification();
