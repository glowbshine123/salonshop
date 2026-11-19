import * as cartService from '../services/cart.service.js';

export const getCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.user.id);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;
        const userId = req.user.id;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const cart = await cartService.addToCart(userId, productId, quantity);

        res.status(201).json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const cart = await cartService.removeFromCart(req.user.id, productId);
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined || quantity === null) {
            return res.status(400).json({ message: 'Quantity is required' });
        }

        const cart = await cartService.updateCartItem(req.user.id, productId, quantity);
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const cart = await cartService.clearCart(req.user.id);
        res.json(cart);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getCartTotal = async (req, res) => {
    try {
        const total = await cartService.getCartTotal(req.user.id);
        res.json(total);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
