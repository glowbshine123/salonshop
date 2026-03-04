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
