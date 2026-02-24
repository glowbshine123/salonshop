import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { ObjectId } from 'mongodb';

export const getCart = async (userId) => {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
        return cart;
    }

    // Enhance items with current stock info and status from Product collection
    const enhancedItems = await Promise.all(cart.items.map(async (item) => {
        const product = await Product.findById(item.productId) || await Product.findOne({ slug: item.productId });
        const itemObj = item.toObject();
        itemObj.inventoryCount = product ? product.inventoryCount : 0;
        itemObj.status = product ? product.status : 'ACTIVE';
        itemObj.expiryDate = product ? product.expiryDate : null;
        return itemObj;
    }));

    const cartObj = cart.toObject();
    cartObj.items = enhancedItems;

    return cartObj;
};

export const addToCart = async (userId, productId, quantity = 1) => {
    try {
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        let product;

        if (ObjectId.isValid(productId) && typeof productId === 'string' && productId.length === 24) {
            product = await Product.findById(productId);
        }

        if (!product) {
            product = await Product.findOne({ slug: productId });
        }

        if (!product && !isNaN(productId)) {
            product = await Product.findOne({ slug: `product-${productId}` });
        }

        if (!product) {
            throw new Error(`Product not found: ${productId}`);
        }

        const existingItem = cart.items.find(
            item => item.productId === productId
        );

        if (product.inventoryCount < quantity) {
            throw new Error(`Only ${product.inventoryCount} items available in stock`);
        }

        // Reserve stock immediately
        product.inventoryCount -= quantity;
        await product.save();

        // Low Stock Alert for Admins
        if (product.inventoryCount < 10) {
            const notificationService = await import('./notification.service.js');
            await notificationService.notifyAdmins({
                title: 'Low Stock Alert',
                description: `Product "${product.name}" is low on stock (${product.inventoryCount} remaining after cart reservation).`,
                type: 'SYSTEM',
                priority: 'HIGH',
                metadata: { productId: product._id }
            });
        }

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                productId: productId,
                productName: product.name,
                productImage: product.images?.[0] || product.image || '',
                price: product.price,
                quantity: quantity
            });
        }

        await cart.save();

        // Return enhanced cart
        return await getCart(userId);
    } catch (error) {
        throw error;
    }
};

export const removeFromCart = async (userId, productId) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    const itemToRemove = cart.items.find(
        item => item.productId.toString() === productId.toString()
    );

    if (itemToRemove) {
        // Restore stock
        const product = await Product.findById(productId) || await Product.findOne({ slug: productId });
        if (product) {
            product.inventoryCount += itemToRemove.quantity;
            await product.save();
        }

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId.toString()
        );
        await cart.save();
    }

    return await getCart(userId);
};

export const updateCartItem = async (userId, productId, quantity) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    if (quantity <= 0) {
        return await removeFromCart(userId, productId);
    } else {
        const item = cart.items.find(
            item => item.productId.toString() === productId.toString()
        );

        if (item) {
            const product = await Product.findById(productId) || await Product.findOne({ slug: productId });
            if (!product) throw new Error('Product not found');

            const diff = quantity - item.quantity;

            if (diff > 0 && product.inventoryCount < diff) {
                throw new Error(`Only ${product.inventoryCount} more items available in stock`);
            }

            // Adjust stock
            product.inventoryCount -= diff;
            await product.save();

            // Low Stock Alert for Admins (only if decrementing)
            if (diff > 0 && product.inventoryCount < 10) {
                const notificationService = await import('./notification.service.js');
                await notificationService.notifyAdmins({
                    title: 'Low Stock Alert',
                    description: `Product "${product.name}" is low on stock (${product.inventoryCount} remaining after cart update).`,
                    type: 'SYSTEM',
                    priority: 'HIGH',
                    metadata: { productId: product._id }
                });
            }

            item.quantity = quantity;
        } else {
            throw new Error('Product not found in cart');
        }
    }

    await cart.save();
    return await getCart(userId);
};

export const clearCart = async (userId, isPurchase = false) => {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        throw new Error('Cart not found');
    }

    // Restore stock for all items ONLY if it's NOT a purchase
    if (!isPurchase) {
        for (const item of cart.items) {
            const product = await Product.findById(item.productId) || await Product.findOne({ slug: item.productId });
            if (product) {
                product.inventoryCount += item.quantity;
                await product.save();
            }
        }
    }

    cart.items = [];
    await cart.save();
    return await getCart(userId);
};

export const getCartTotal = async (userId) => {
    const cart = await getCart(userId);
    return {
        totalItems: cart.totalItems,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.length
    };
};
