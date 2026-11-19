import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/apiService';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchCart = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            const guestCart = JSON.parse(localStorage.getItem('salon_guest_cart') || '{"items":[], "totalItems":0, "totalPrice":0}');
            setCart(guestCart);
            return;
        }

        setLoading(true);
        try {
            const guestCart = JSON.parse(localStorage.getItem('salon_guest_cart') || '{"items":[]}');
            if (guestCart.items.length > 0) {
                for (const item of guestCart.items) {
                    await cartAPI.add(item.productId, item.quantity);
                }
                localStorage.removeItem('salon_guest_cart');
            }

            const res = await cartAPI.get();
            setCart(res.data || { items: [], totalItems: 0, totalPrice: 0 });
        } catch (err) {
            console.warn('Failed to fetch/sync cart:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        const handleAuthChange = () => fetchCart();
        window.addEventListener('authChange', handleAuthChange);
        return () => window.removeEventListener('authChange', handleAuthChange);
    }, []);

    const addToCart = async (productId, quantity = 1, productDetails = null) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await cartAPI.add(productId, quantity);
                setCart(res.data);
                return res.data;
            } catch (err) {
                setError(err.message);
                throw err;
            }
        } else {
            const current = { ...cart };
            const existing = current.items.find(i => i.productId === productId);
            if (existing) {
                existing.quantity += quantity;
            } else if (productDetails) {
                current.items.push({
                    productId,
                    quantity,
                    productName: productDetails.name,
                    productImage: productDetails.images?.[0] || productDetails.image,
                    price: productDetails.price
                });
            } else {
                // If we don't have details, we can't add to guest cart properly 
                // but usually the caller provides them or has fetched them.
                throw new Error("Product details required for guest cart addition");
            }

            // Recalculate totals
            current.totalItems = current.items.reduce((sum, item) => sum + item.quantity, 0);
            current.totalPrice = current.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            localStorage.setItem('salon_guest_cart', JSON.stringify(current));
            setCart(current);
            return current;
        }
    };

    const removeFromCart = async (productId) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await cartAPI.remove(productId);
                setCart(res.data);
                return res.data;
            } catch (err) {
                setError(err.message);
                throw err;
            }
        } else {
            const current = { ...cart };
            current.items = current.items.filter(i => i.productId !== productId);
            current.totalItems = current.items.reduce((sum, item) => sum + item.quantity, 0);
            current.totalPrice = current.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            localStorage.setItem('salon_guest_cart', JSON.stringify(current));
            setCart(current);
            return current;
        }
    };

    const updateCartItem = async (productId, quantity) => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await cartAPI.update(productId, quantity);
                setCart(res.data);
                return res.data;
            } catch (err) {
                setError(err.message);
                throw err;
            }
        } else {
            const current = { ...cart };
            const item = current.items.find(i => i.productId === productId);
            if (item) {
                item.quantity = quantity;
                current.totalItems = current.items.reduce((sum, item) => sum + item.quantity, 0);
                current.totalPrice = current.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                localStorage.setItem('salon_guest_cart', JSON.stringify(current));
                setCart(current);
            }
            return current;
        }
    };

    const clearCart = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const res = await cartAPI.clear();
                setCart(res.data);
                return res.data;
            } catch (err) {
                setError(err.message);
                throw err;
            }
        } else {
            const empty = { items: [], totalItems: 0, totalPrice: 0 };
            localStorage.removeItem('salon_guest_cart');
            setCart(empty);
            return empty;
        }
    };

    const getCartTotal = () => {
        return {
            totalItems: cart.totalItems || 0,
            totalPrice: cart.totalPrice || 0,
            itemCount: cart.items?.length || 0,
        };
    };

    const value = {
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getCartTotal,
        items: cart.items || [],
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
