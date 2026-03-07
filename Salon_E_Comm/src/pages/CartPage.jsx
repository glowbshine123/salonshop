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
    <div className="bg-white flex items-center justify-center max-w-7xl py-12 px-8 w-full mx-auto min-h-[60vh]">
      <div className="w-full border-2 border-border border-dashed rounded-[32px] p-12 text-center flex flex-col items-center gap-6 bg-card/50 backdrop-blur-sm">
        <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-2 transform rotate-3">
          <LogIn size={40} />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Login Required</h2>
          <p className="text-muted-foreground font-medium leading-relaxed">
            You are not logged in. <br />Please log in or create an account to view your cart.
          </p>
        </div>

        <Button
          onClick={() => navigate('/auth/signin')}
          className="h-12 text-lg w-fit px-12 bg-foreground text-background hover:bg-foreground/90 rounded-full"
        >
          Log In
        </Button>
      </div>
    </div>
  );

  if (!items || items.length === 0) {
    return (
      <div className="bg-white flex items-center justify-center max-w-7xl py-12 px-8 w-full mx-auto min-h-[60vh]">
        <div className="w-full border-2 border-border border-dashed rounded-lg p-12 text-center flex flex-col items-center gap-6 bg-card/50 backdrop-blur-sm">
          <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-2 -rotate-3">
            <ShoppingBag size={40} />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Your Cart is Empty</h2>
            <p className="text-muted-foreground font-medium leading-relaxed">
              Looks like you haven't added any professional salon products yet.
            </p>
          </div>

          <Button
            onClick={() => navigate('/products')}
            className="h-12 text-lg w-fit px-12 bg-primary text-background hover:bg-primary-hover rounded-md"
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
    <div className="bg-white min-h-screen pb-6 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-black text-foreground tracking-tight">
            Salon <span className="text-primary">Basket</span>
            <span className="ml-4 text-sm text-muted-foreground font-bold uppercase tracking-widest">{totalItems} Items</span>
          </h1>
          <button
            onClick={() => navigate('/')}
            className="hidden sm:flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Continue Shopping
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-2">
            {items.map((item) => (
              <div key={item.productId} className="bg-card p-2 rounded-lg border border-border shadow-sm flex flex-row gap-6 items-center">
                {/* Product Image */}
                <Link to={`/products/${item.productId}`} className="w-28 h-28 shrink-0 rounded-md overflow-hidden bg-muted border border-border group">
                  <img
                    src={item.productImage || item.image || 'https://via.placeholder.com/128?text=Product'}
                    alt={item.productName || item.name || 'Product'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="w-full flex justify-between items-start gap-4">
                    <div className='w-full'>
                      <Link to={`/products/${item.productId}`} className="text-lg font-black text-foreground hover:text-primary transition-colors line-clamp-1 truncate">
                        {item.productName}
                      </Link>
                      <span className="text-xl mt-2 block font-black text-foreground leading-none tracking-tighter">₹{item.price.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Stock Warning */}
                    <div className="flex flex-col gap-1">
                      {item.inventoryCount <= 0 ? (
                        <span className="text-[10px] font-black text-destructive uppercase tracking-widest bg-destructive/10 px-2 py-1 rounded-md">Out of Stock</span>
                      ) : item.quantity > item.inventoryCount ? (
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md">Only {item.inventoryCount} left</span>
                      ) : item.status === 'EXPIRED' ? (
                        <span className="text-[10px] font-black text-destructive uppercase tracking-widest bg-destructive/10 px-2 py-1 rounded-md">Product Expired</span>
                      ) : null}

                      {/* Qty Selector */}
                      <div className="flex items-center bg-muted rounded-md p-1 border border-border w-fit">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={updatingId === item.productId}
                          className="w-8 h-8 flex items-center justify-center hover:bg-card hover:rounded-md transition-all text-foreground disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-xs font-black">
                          {updatingId === item.productId ? <Loader2 size={12} className="animate-spin mx-auto text-primary" /> : item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={updatingId === item.productId || item.quantity >= (item.inventoryCount || 0)}
                          title={item.quantity >= (item.inventoryCount || 0) ? "Maximum stock reached" : "Add one"}
                          className="w-8 h-8 flex items-center justify-center hover:bg-card hover:rounded-md transition-all text-foreground disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-3 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-md transition-all active:scale-95"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-4 sticky top-32">
            <h3 className="text-2xl font-black text-foreground tracking-tight">Basket Summary</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-foreground-muted font-bold text-xs tracking-wide">SUBTOTAL ({totalItems} ITEMS)</span>
                <span className="text-foreground font-black tracking-tighter">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-foreground-muted font-bold text-xs tracking-wide">ESTIMATED LOGISTICS</span>
                <span className="text-emerald-600 font-black text-xs uppercase">Free Delivery</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-foreground-muted font-bold text-xs tracking-wide">VENDOR TAXES</span>
                <span className="text-foreground font-bold text-[11px] uppercase tracking-wider">Included in Price</span>
              </div>
            </div>

            <div className="h-px bg-border/50" />

            <div className="flex justify-between items-center pb-4">
              <span className="text-lg font-black text-foreground leading-none">TOTAL AMOUNT</span>
              <div className="text-right">
                <p className="text-3xl font-black text-primary tracking-tighter leading-none">₹{totalPrice.toLocaleString()}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1.5">You saved ₹{Math.floor(totalPrice * 0.15).toLocaleString()}</p>
              </div>
            </div>

            <Button
              asChild
              disabled={hasInvalidItems}
              className={`w-full h-12 bg-primary text-white  rounded-md font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/10 active:scale-[0.98] group ${hasInvalidItems ? 'bg-primary-muted hover:bg-primary-muted cursor-not-allowed' : ''}`}
            >
              {hasInvalidItems ? (
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle size={20} className="text-destructive" />
                  REMOVE UNAVAILABLE ITEMS
                </div>
              ) : (
                <Link to="/checkout" className="flex items-center justify-center rounded-2xl text-white! tracking-wider">
                  PROCEED TO SECURE CHECKOUT
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </Button>

            <div className="space-y-2 pt-4">
              <div className="flex items-center gap-3 px-4 py-1 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 bg-card rounded-md flex items-center justify-center text-primary shadow-sm border border-border">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight text-foreground">Protected Payments</p>
                  <p className="text-[10px] font-bold text-foreground-muted mt-0.5">via Razorpay</p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-1 bg-muted/30 rounded-lg">
                <div className="w-10 h-10 bg-card rounded-md flex items-center justify-center text-primary shadow-sm border border-border">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Instant Verification</p>
                  <p className="text-[10px] font-bold text-foreground-muted mt-0.5">Salon identity verified instantly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
