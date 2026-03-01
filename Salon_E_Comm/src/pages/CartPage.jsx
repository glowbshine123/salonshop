import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLoading } from '../context/LoadingContext';
import { Loader2, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Zap, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from '@/context/AuthContext';
import { cn } from "@/lib/utils";

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
    <div className="bg-white min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative mx-auto w-32 h-32 bg-primary-light rounded-[40px] flex items-center justify-center text-primary rotate-3 transform transition-transform hover:rotate-0">
          <LogIn size={48} />
          <div className="absolute top-0 right-0 w-8 h-8 bg-accent-color rounded-full border-4 border-white" />
        </div>

        <div className="space-y-3">
          <h2 className="text-4xl font-display font-black text-neutral-900 tracking-tighter">Enter the Temple.</h2>
          <p className="text-neutral-400 font-medium leading-relaxed">
            Your ritual selections are waiting. Please sign in to access your curated basket.
          </p>
        </div>

        <Button
          onClick={() => navigate('/auth/signin')}
          className="h-14 font-bold uppercase tracking-widest w-full bg-primary hover:bg-primary-dark text-white rounded-full shadow-2xl shadow-primary/20"
        >
          Sign In to Basket
        </Button>
      </div>
    </div>
  );

  if (!items || items.length === 0) {
    return (
      <div className="bg-white min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative mx-auto w-32 h-32 bg-bg-secondary rounded-[40px] flex items-center justify-center text-neutral-300 -rotate-3 transform transition-transform hover:rotate-0">
            <ShoppingBag size={48} />
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-display font-black text-neutral-900 tracking-tighter">Basket is Empty.</h2>
            <p className="text-neutral-400 font-medium leading-relaxed">
              Your ritual hasn't begun. Explore our curated collections to find your perfect professional companion.
            </p>
          </div>

          <Button
            onClick={() => navigate('/products')}
            className="h-14 font-bold uppercase tracking-widest w-full bg-primary hover:bg-primary-dark text-white rounded-full shadow-2xl shadow-primary/20"
          >
            Explore Collections
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
    <div className="bg-white min-h-screen pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Your Ritual</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-black text-neutral-900 tracking-tighter">
              Salon House. <span className="text-primary-light bg-primary-light text-primary px-4 py-1 rounded-3xl">{totalItems}</span>
            </h1>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-primary transition-all uppercase tracking-widest group"
          >
            Continue Ritual
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-8">
            {items.map((item) => (
              <div key={item.productId} className="group relative bg-white p-6 md:p-8 border border-primary/5 rounded-[40px] shadow-xl shadow-primary/5 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-700 flex flex-col sm:flex-row gap-8 items-center">
                {/* Product Image */}
                <Link to={`/products/${item.productId}`} className="w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-[32px] overflow-hidden bg-bg-secondary border border-primary/5">
                  <img
                    src={item.productImage || item.image || 'https://via.placeholder.com/128?text=Product'}
                    alt={item.productName || item.name || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-2">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <Link to={`/products/${item.productId}`} className="text-2xl font-display font-black text-neutral-900 hover:text-primary transition-colors leading-[0.9] tracking-tight">
                          {item.productName}
                        </Link>
                        <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest">ID: {item.productId.slice(-8)}</p>
                      </div>
                      <span className="text-2xl font-black text-neutral-900 tracking-tighter">₹{item.price.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {item.inventoryCount <= 0 ? (
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-full">Depleted Ritual</span>
                      ) : item.quantity > item.inventoryCount ? (
                        <span className="text-[9px] font-bold text-accent-color uppercase tracking-widest bg-accent-color/10 px-3 py-1.5 rounded-full">Only {item.inventoryCount} Remaining</span>
                      ) : item.status === 'EXPIRED' ? (
                        <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-3 py-1.5 rounded-full">Selection Expired</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-8">
                    {/* Qty Selector */}
                    <div className="flex items-center bg-bg-secondary rounded-full p-1.5 border border-primary/5 w-fit h-12">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={updatingId === item.productId}
                        className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-primary transition-all active:scale-95 disabled:opacity-30"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-neutral-900">
                        {updatingId === item.productId ? <Loader2 size={14} className="animate-spin mx-auto text-primary" /> : item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={updatingId === item.productId || item.quantity >= (item.inventoryCount || 0)}
                        className="w-9 h-9 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-primary transition-all active:scale-95 disabled:opacity-30"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-3.5 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all active:scale-90"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4 space-y-8 sticky top-32">
            <div className="p-10 bg-bg-secondary rounded-[48px] border border-primary/5 space-y-10 relative overflow-hidden group">
              <div className="relative z-10 space-y-10">
                <h3 className="text-3xl font-display font-black text-neutral-900 tracking-tighter text-center">Ritual Value.</h3>

                <div className="space-y-6">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    <span>Collective ({totalItems} Rituals)</span>
                    <span className="text-neutral-900">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    <span>Logistics</span>
                    <span className="text-primary">Complimentary</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                    <span>Taxation</span>
                    <span className="text-neutral-900">Inclusive</span>
                  </div>
                </div>

                <div className="pt-8 border-t border-primary/10">
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Net Total</span>
                    <div className="text-right">
                      <p className="text-4xl font-black text-neutral-900 tracking-tighter leading-none">₹{totalPrice.toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-accent-color uppercase tracking-widest mt-2">B2B Saving Enabled</p>
                    </div>
                  </div>

                  <Button
                    asChild
                    disabled={hasInvalidItems}
                    className={cn(
                      "w-full h-16 bg-primary hover:bg-primary-dark text-white rounded-[24px] font-black uppercase tracking-widest transition-all shadow-2xl shadow-primary/20 scale-1 group overflow-hidden relative",
                      hasInvalidItems && "opacity-50 cursor-not-allowed grayscale shadow-none"
                    )}
                  >
                    {hasInvalidItems ? (
                      <div className="flex items-center justify-center gap-2">
                        <AlertCircle size={20} />
                        Purge Unavailable
                      </div>
                    ) : (
                      <Link to="/checkout" className="flex items-center justify-center">
                        Secure Checkout
                        <Zap size={18} className="ml-2 group-hover:scale-125 transition-transform" />
                      </Link>
                    )}
                  </Button>
                </div>
              </div>

              <div className="absolute -bottom-10 -left-10 opacity-5 group-hover:scale-110 transition-transform">
                <ShoppingBag size={200} className="text-primary fill-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, title: 'Safe Data', desc: 'Secure SSL' },
                { icon: Zap, title: 'B2B Flow', desc: 'Verified Pros' }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white border border-primary/5 rounded-[32px] flex flex-col items-center text-center gap-3">
                  <div className="w-10 h-10 bg-primary-light text-primary rounded-2xl flex items-center justify-center">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">{item.title}</p>
                    <p className="text-[9px] font-bold text-neutral-300 uppercase tracking-tighter">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
