import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLoading } from '../context/LoadingContext';
import { Loader2, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Zap, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
  const { cart, items, loading: cartLoading, removeFromCart, updateCartItem, getCartTotal } = useCart();
  const { startLoading, finishLoading } = useLoading();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { totalPrice, totalItems } = getCartTotal();
  const [updatingId, setUpdatingId] = useState(null);

  const hasInvalidItems = items.some(item => (item.inventoryCount <= 0) || (item.quantity > item.inventoryCount) || (item.status === 'EXPIRED'));

  React.useEffect(() => {
    if (!cartLoading && !authLoading) {
      finishLoading();
    }
  }, [cartLoading, authLoading]);

  if (cartLoading || authLoading) {
    return null;
  }

  if (!user) return (
    <div className="bg-neutral-50/50 flex items-center justify-center max-w-7xl py-4 px-8 w-full mx-auto h-full">
      <div className="w-full border-2 border-neutral-300 border-dashed rounded-3xl p-12 text-center flex flex-col items-center gap-6 bg-white/50 backdrop-blur-sm">
        <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 mb-2 transform rotate-3">
          <LogIn size={40} />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-neutral-900 tracking-tight">Login Required</h2>
          <p className="text-neutral-500 font-medium leading-relaxed">
            You are not logged in. <br />Please log in or create an account to view your cart.
          </p>
        </div>

        <Button
          onClick={() => navigate('/auth/signin')}
          className="h-12 text-lg w-fit px-12"
        >
          Log In
        </Button>

      </div>
    </div>
  );

  if (!items || items.length === 0) {
    return (
      <div className="bg-neutral-50/50 flex items-center justify-center max-w-7xl py-4 px-8 w-full mx-auto h-full">
        <div className="w-full border-2 border-neutral-300 border-dashed rounded-3xl p-12 text-center flex flex-col items-center gap-6 bg-white/50 backdrop-blur-sm">
          <div className="w-24 h-24 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 mb-2 -rotate-3">
            <ShoppingBag size={40} />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Your Cart is Empty</h2>
            <p className="text-neutral-500 font-medium leading-relaxed">
              Looks like you haven't added any professional salon products yet.
            </p>
          </div>

          <Button
            onClick={() => navigate('/products')}
            className="h-12 text-lg w-fit px-12"
          >
            Browse Products
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div >
    );
  }

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingId(productId);
    try {
      await updateCartItem(productId, newQuantity);
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-neutral-50/50 min-h-screen pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
            Salon <span className="text-blue-600">Basket</span>
            <span className="ml-4 text-sm text-neutral-400 font-bold uppercase tracking-widest">{totalItems} Items</span>
          </h1>
          <button
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-black transition-colors"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.productId} className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-neutral-200/40 transition-all duration-500 flex flex-col sm:flex-row gap-6 items-center">
                {/* Product Image */}
                <Link to={`/products/${item.productId}`} className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 group">
                  <img
                    src={item.productImage || item.image || 'https://via.placeholder.com/128?text=Product'}
                    alt={item.productName || item.name || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link to={`/products/${item.productId}`} className="text-lg font-black text-neutral-900 hover:text-blue-600 transition-colors line-clamp-1 truncate">
                        {item.productName}
                      </Link>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mt-1">Ref No: {item.productId.slice(-8)}</p>
                    </div>
                    <span className="text-xl font-black text-neutral-900 leading-none tracking-tighter">₹{item.price.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    {/* Stock Warning */}
                    <div className="flex flex-col gap-1">
                      {item.inventoryCount <= 0 ? (
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg">Out of Stock</span>
                      ) : item.quantity > item.inventoryCount ? (
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-lg">Only {item.inventoryCount} left</span>
                      ) : item.status === 'EXPIRED' ? (
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-lg">Product Expired</span>
                      ) : null}

                      {/* Qty Selector */}
                      <div className="flex items-center bg-neutral-50 rounded-xl p-1 border border-neutral-100 w-fit">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={updatingId === item.productId}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white hover:rounded-lg transition-all text-neutral-600 disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-black">
                          {updatingId === item.productId ? <Loader2 size={12} className="animate-spin mx-auto text-blue-600" /> : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={updatingId === item.productId || item.quantity >= (item.inventoryCount || 0)}
                          title={item.quantity >= (item.inventoryCount || 0) ? "Maximum stock reached" : "Add one"}
                          className="w-8 h-8 flex items-center justify-center hover:bg-white hover:rounded-lg transition-all text-neutral-600 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all active:scale-95"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-2xl space-y-8 sticky top-32">
            <h3 className="text-2xl font-black text-neutral-900 tracking-tight">Basket Summary</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-2.5">
                <span className="text-neutral-400 font-bold text-sm tracking-wide">SUBTOTAL ({totalItems} ITEMS)</span>
                <span className="text-neutral-900 font-black tracking-tighter">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-neutral-400 font-bold text-sm tracking-wide">ESTIMATED LOGISTICS</span>
                <span className="text-green-600 font-black text-xs uppercase">Free Delivery</span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-neutral-400 font-bold text-sm tracking-wide">VENDOR TAXES</span>
                <span className="text-neutral-900 font-bold text-[11px] uppercase tracking-wider">Included in Price</span>
              </div>
            </div>

            <div className="h-px bg-neutral-100" />

            <div className="flex justify-between items-center pb-4">
              <span className="text-lg font-black text-neutral-900 leading-none">TOTAL AMOUNT</span>
              <div className="text-right">
                <p className="text-3xl font-black text-neutral-900 tracking-tighter leading-none">₹{totalPrice.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5">You save ₹{Math.floor(totalPrice * 0.15).toLocaleString()} with B2B</p>
              </div>
            </div>

            <Button
              asChild
              disabled={hasInvalidItems}
              className={`w-full h-16 bg-neutral-900 text-white rounded-[24px] font-black hover:bg-emerald-600 transition-all shadow-xl shadow-neutral-900/20 active:scale-[0.98] group ${hasInvalidItems ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {hasInvalidItems ? (
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle size={20} className="text-rose-500" />
                  REMOVE UNAVAILABLE ITEMS
                </div>
              ) : (
                <Link to="/checkout" className="flex items-center justify-center">
                  PROCEED TO SECURE CHECKOUT
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </Button>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-neutral-100">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Protected Payments</p>
                  <p className="text-[10px] font-bold text-neutral-400 mt-0.5">256-bit SSL Data Encryption</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-neutral-100">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Instant Verification</p>
                  <p className="text-[10px] font-bold text-neutral-400 mt-0.5">Salon identity verified instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
