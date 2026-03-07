import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI, userAPI, authAPI, rewardAPI, settingsAPI } from '../services/apiService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Package,
  Zap,
  IndianRupee,
  Link2,
  Info
} from 'lucide-react';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { user } = useAuth();
  const [shippingMethod, setShippingMethod] = useState('default');
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [agentId, setAgentId] = useState('');
  const [agents, setAgents] = useState([]);
  const [agentVerified, setAgentVerified] = useState(false);
  const { startLoading, finishLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({ name: '', street: '', city: '', state: '', zip: '', phone: '' });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const [rewardWallet, setRewardWallet] = useState(null);
  const [rewardConfig, setRewardConfig] = useState({ maxRedemptionPercentage: 50, minOrderAmountForRewards: 1000 });
  const [redeemRewards, setRedeemRewards] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [pointsError, setPointsError] = useState('');

  const navigate = useNavigate();
  const { items: cartItems, getCartTotal, clearCart } = useCart();
  const { totalPrice } = getCartTotal();

  const displayItems = cartItems || [];
  const subtotal = totalPrice || 0;

  const discount = 0;
  const tax = 0;
  const shipping = 0;
  const totalBeforePoints = subtotal + discount + tax + shipping;
  const total = totalBeforePoints - pointsToRedeem;

  useEffect(() => {
    if (!loading && displayItems.length === 0) {
      navigate('/cart');
    }

    if (user?.role === 'SALON_OWNER') {
      const profile = user.salonOwnerProfile;
      if (profile?.agentId) {
        const agent = profile.agentId;
        setAgentId(typeof agent === 'object' ? agent._id : agent);
        setAgentVerified(true);
      }

      // Auto-fill address
      if (profile?.shippingAddresses?.length > 0) {
        const defaultAddr = profile.shippingAddresses.find(a => a.isDefault) || profile.shippingAddresses[0];
        setShippingAddress({
          name: `${user.firstName} ${user.lastName}`,
          street: defaultAddr.street || '',
          city: defaultAddr.city || '',
          state: defaultAddr.state || '',
          zip: defaultAddr.zip || '',
          phone: defaultAddr.phone || user.phone || ''
        });
      }
    }

    const fetchAgents = async () => {
      try {
        const list = await userAPI.getAgents();
        setAgents(Array.isArray(list?.data) ? list.data : (Array.isArray(list) ? list : []));
      } catch (err) {
        setAgents([]);
      }
    };


    const fetchUserData = async () => {
      try {
        const res = await authAPI.me();
        const currentUser = res.data;

        setShippingAddress({
          name: `${user.firstName} ${user.lastName}`,
          street: currentUser.salonOwnerProfile?.shippingAddresses?.find(a => a.isDefault)?.street || '',
          city: currentUser.salonOwnerProfile?.shippingAddresses?.find(a => a.isDefault)?.city || '',
          state: currentUser.salonOwnerProfile?.shippingAddresses?.find(a => a.isDefault)?.state || '',
          zip: currentUser.salonOwnerProfile?.shippingAddresses?.find(a => a.isDefault)?.zip || '',
          phone: currentUser.salonOwnerProfile?.shippingAddresses?.find(a => a.isDefault)?.phone || user.phone || ''
        })

        // Fetch Reward Wallet
        try {
          const walletRes = await rewardAPI.getRewardWallet();
          setRewardWallet(walletRes.data);
        } catch (err) {
          console.error("Error fetching reward wallet:", err);
        }

        // Fetch System Settings for Reward Config
        try {
          const settingsRes = await settingsAPI.get();
          if (settingsRes && settingsRes.rewardConfig) {
            setRewardConfig(settingsRes.rewardConfig);
          }
        } catch (err) {
          console.error("Error fetching system settings:", err);
        }

      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        finishLoading();
      }
    };

    fetchAgents();
    fetchUserData();
  }, [displayItems.length, loading, navigate, user]);

  const handleVerifyAgent = () => {
    if (agentId) {
      const selected = agents.find(a => a._id === agentId);
      if (selected) {
        setAgentVerified(true);
      }
    }
  };

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/auth/signin');
      return;
    }

    if (displayItems.length === 0) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zip) {
        setError('Please fill the shipping address (street, city, zip)');
        setLoading(false);
        return;
      }

      const orderData = {
        items: displayItems.map(item => ({
          name: item.productName || item.name,
          quantity: item.quantity,
          price: item.price,
          productId: item.productId
        })),
        subtotal,
        discount,
        tax,
        shipping,
        total,
        shippingAddress,
        paymentMethod,
        shippingMethod,
        agentId: agentId || null,
        status: 'PENDING',
        pointsToRedeem: pointsToRedeem > 0 ? pointsToRedeem : undefined
      };

      const createdOrderRes = await orderAPI.create(orderData);
      const createdOrder = createdOrderRes.data;

      if (!createdOrder || !createdOrder._id) {
        throw new Error('Failed to create order on server');
      }

      // 0-Total or COD handling
      if (total === 0 || paymentMethod === 'COD') {
        try { await clearCart(); } catch (clearErr) { }

        toast.success(total === 0 ? 'Order placed successfully using rewards!' : 'Order placed successfully!');
        navigate('/my-orders');
        return;
      }

      setPaymentProcessing(true);
      const razorOrderRes = await paymentAPI.createOrder({ amount: total, orderId: createdOrder._id, currency: 'INR' });
      const razorOrder = razorOrderRes.data;

      const loaded = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID || window?.__RAZORPAY_KEY_ID || '';

      const options = {
        key: keyId,
        amount: razorOrder.amount,
        currency: razorOrder.currency,
        name: 'SalonPro',
        description: `Order ${createdOrder.orderNumber}`,
        order_id: razorOrder.id,
        handler: async function (response) {
          try {
            const verifyRes = await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: createdOrder._id
            });

            if (verifyRes && verifyRes.data && verifyRes.data.status === 'success') {
              try {
                await clearCart();
              } catch (clearErr) { }
              navigate('/my-orders');
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            setError('Payment verification failed: ' + (err.message || 'Unknown error'));
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: '',
          email: ''
        },
        notes: { orderId: createdOrder._id },
        theme: { color: '#059669' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'));
        setPaymentProcessing(false);
      });

      rzp.open();

    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to place order. Please try again.';
      setError(msg);
      toast.error(msg);
      setPaymentProcessing(false);
    } finally {
      setLoading(false);
    }
  };

  const getAgentName = () => {
    if (user?.role === 'SALON_OWNER' && user?.salonOwnerProfile?.agentId) {
      const agent = user.salonOwnerProfile.agentId;
      if (typeof agent === 'object') {
        return `${agent.firstName} ${agent.lastName}`;
      }
    }
    const selected = agents.find(a => a._id === agentId);
    return selected ? `${selected.firstName} ${selected.lastName}` : '';
  };

  return (
    <div className="min-h-screen bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-4xl font-black text-foreground tracking-tight">Checkout <span className="text-primary">& Attribution</span></h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-2">Finalize your Cart.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Section - Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-2 px-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-bold text-foreground capitalize tracking-wide">Shipping Address</h2>
                </div>
                {!isEditingAddress && (
                  <button
                    onClick={() => setIsEditingAddress(true)}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Edit Address
                  </button>
                )}
              </div>
              <div className="p-4">
                {isEditingAddress ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted capitalize tracking-wide ml-1">Recipient Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={shippingAddress.name}
                            onChange={e => setShippingAddress(s => ({ ...s, name: e.target.value }))}
                            className="w-full bg-input-bg border border-border-strong rounded-md p-2 pl-12 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted capitalize tracking-wide ml-1">Contact Phone</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <input
                            type="tel"
                            placeholder="+91 00000 00000"
                            value={shippingAddress.phone}
                            onChange={e => setShippingAddress(s => ({ ...s, phone: e.target.value }))}
                            className="w-full bg-input-bg border border-border-strong rounded-md p-2 pl-12 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-foreground-muted capitalize tracking-wide ml-1">Street Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <input
                            type="text"
                            placeholder="123 Luxury Lane, Business District"
                            value={shippingAddress.street}
                            onChange={e => setShippingAddress(s => ({ ...s, street: e.target.value }))}
                            className="w-full bg-input-bg border border-border-strong rounded-md p-2 pl-12 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground-muted capitalize tracking-wide ml-1">City</label>
                        <input
                          type="text"
                          placeholder="Mumbai"
                          value={shippingAddress.city}
                          onChange={e => setShippingAddress(s => ({ ...s, city: e.target.value }))}
                          className="w-full bg-input-bg border border-border-strong rounded-md p-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-foreground-muted capitalize tracking-wide ml-1">State</label>
                          <input
                            type="text"
                            placeholder="MH"
                            value={shippingAddress.state}
                            onChange={e => setShippingAddress(s => ({ ...s, state: e.target.value }))}
                            className="w-full bg-input-bg border border-border-strong rounded-md p-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-foreground-muted capitalize tracking-wide ml-1">ZIP / PIN</label>
                          <input
                            type="text"
                            placeholder="400001"
                            value={shippingAddress.zip}
                            onChange={e => setShippingAddress(s => ({ ...s, zip: e.target.value }))}
                            className="w-full bg-input-bg border border-border-strong rounded-md p-3 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditingAddress(false)}
                      className="w-full py-3 bg-foreground text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-foreground/90 transition-all"
                    >
                      Save Address
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold text-foreground">{shippingAddress.name}</p>
                    <p className="text-sm font-semibold text-muted-foreground">{shippingAddress.street}, {shippingAddress.city}</p>
                    <p className="text-sm font-semibold text-muted-foreground">{shippingAddress.state}, {shippingAddress.zip}</p>
                    <p className="text-sm font-semibold text-muted-foreground mt-2 flex items-center gap-2">
                      <Phone size={14} className="text-primary" />
                      {shippingAddress.phone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method - Now 2nd */}
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="p-2 px-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-bold text-foreground capitalize tracking-wide">Payment Method</h2>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'ONLINE', label: 'ONLINE PAYMENT', icon: Zap, sub: 'UPI/QR, CARD' },
                    { id: 'COD', label: 'COD', icon: Truck, sub: 'Pay on arrival' }
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => {
                        setPaymentMethod(method.id);
                        if (method.id === 'COD') {
                          setRedeemRewards(false);
                          setPointsToRedeem(0);
                        }
                      }}
                      className={`cursor-pointer p-2 rounded-md border-2 transition-all flex items-center gap-3 ${paymentMethod === method.id
                        ? 'bg-primary/5 border-primary shadow-md'
                        : 'bg-card border-border hover:border-border-strong'
                        }`}
                    >
                      <div className={`w-14 h-14 rounded-md flex items-center justify-center shrink-0 ${paymentMethod === method.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                        <method.icon size={28} />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-bold uppercase tracking-wide ${paymentMethod === method.id ? 'text-primary' : 'text-foreground'
                          }`}>{method.label}</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{method.sub}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <div className="ml-auto hidden md:block">
                          <CheckCircle2 className="text-primary" size={24} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {paymentMethod === 'COD' && (
                  <div className="mt-4 p-4 bg-amber-50/50 rounded-lg border border-amber-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-amber-800 uppercase tracking-tight mb-1">
                        {rewardWallet?.deliveredOrdersCount === 0 ? 'First Order Perk' : 'Rewards Ineligible'}
                      </p>
                      <p className="text-[10px] font-bold text-amber-600 leading-relaxed">
                        {rewardWallet?.deliveredOrdersCount === 0
                          ? "Great news! Since this is your first order, you're eligible for reward points even on COD. Subsequent COD orders will not earn points."
                          : "To earn rewards on this order, please select a prepaid payment method (UPI, Cards). Postpaid/COD orders do not accumulate points after your first order."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Attribution - Now 3rd */}
            {user?.role === 'SALON_OWNER' && user?.salonOwnerProfile?.agentId && (
              <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="p-2 px-4 border-b border-border flex items-center gap-4 bg-muted/30">
                  <h2 className="text-sm font-bold text-foreground capitalize tracking-wide">Agent Attribution</h2>
                </div>
                <div className="p-4 space-y-6">
                  <div className="p-2 bg-primary/5 border border-primary/10 rounded-lg flex items-center gap-6 shadow-sm border-dashed">
                    <div className="w-16 h-16 bg-card rounded-md flex items-center justify-center text-primary shadow-sm border border-border">
                      <Link2 size={32} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 items-center flex gap-2">
                        <ShieldCheck size={12} />
                        Identity Verified Relationship
                      </p>
                      <h4 className="text-xl font-black text-foreground tracking-tight">
                        {getAgentName()}
                      </h4>
                      <p className="text-[10px] font-noraml text-foreground-muted mt-1 capitalize tracking-wider">Your Assigned Professional Agent</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-card p-4 rounded-lg border border-border shadow-sm max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar flex flex-col">
              <h3 className="text-lg font-bold text-foreground capitalize tracking-wide mb-3 border-b border-border pb-1">Order Summary</h3>

              <div className="space-y-3 mb-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar shrink-0">
                {displayItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center group">
                    <img
                      src={item.productImage || item.image || 'https://via.placeholder.com/64?text=Product'}
                      alt={item.productName || item.name || 'Product'}
                      className="w-12 md:w-16 h-12 md:h-16 rounded-lg object-cover border border-border"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-foreground truncate uppercase tracking-tight">{item.productName || item.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">₹{item.price?.toLocaleString()} × {item.quantity}</p>
                        <p className="text-[11px] font-black text-foreground tracking-tighter">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground-muted capitalize tracking-wide">Order Total</span>
                  <span className="font-black text-foreground">₹{subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Rewards Redemption UI */}
              <div className="pt-8 border-t border-neutral-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest flex items-center gap-1">
                    <Zap size={12} className="text-success" />
                    Loyalty Rewards
                  </span>
                  {rewardWallet && (
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">
                      {rewardWallet.isUnlocked ? `Balance: ${rewardWallet.balance}` : 'Locked'}
                    </span>
                  )}
                </div>

                {rewardWallet ? (
                  !rewardWallet.isUnlocked ? (
                    <div className="bg-primary/10 p-2 rounded-md border border-border-strong flex items-start gap-2">
                      <div className="p-2 bg-secondary rounded-lg text-neutral-500">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-900 uppercase tracking-tight">Rewards Locked</p>
                        <p className="text-[10px] font-bold text-neutral-400 mt-1">
                          Complete {rewardWallet.ordersNeededForUnlock} more delivered order(s) to unlock redemption.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rewardWallet.balance > 0 ? (
                        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                          <div className="flex items-center gap-3 mb-3">
                            <input
                              type="checkbox"
                              checked={redeemRewards}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setRedeemRewards(checked);
                                if (checked) {
                                  // Auto-apply max
                                  const maxRedeemable = Math.min(rewardWallet.balance, Math.floor(subtotal * (rewardConfig.maxRedemptionPercentage / 100)));
                                  setPointsToRedeem(maxRedeemable);
                                } else {
                                  setPointsToRedeem(0);
                                }
                              }}
                              className="w-4 h-4 text-success rounded-md focus:ring-emerald-500 border-border disabled:opacity-50"
                            />
                            <label className="text-xs font-black uppercase tracking-wide text-neutral-900">
                              Redeem Rewards
                            </label>
                          </div>

                          {redeemRewards && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  value={pointsToRedeem || ''}
                                  placeholder="Points"
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setPointsError('');
                                    const maxAllowed = Math.floor(subtotal * (rewardConfig.maxRedemptionPercentage / 100));

                                    if (val > rewardWallet.balance) {
                                      setPointsError(`Max available: ${rewardWallet.balance}`);
                                      setPointsToRedeem(rewardWallet.balance);
                                    } else if (val > maxAllowed) {
                                      setPointsError(`Max redeemable (${rewardConfig.maxRedemptionPercentage}%): ${maxAllowed}`);
                                      setPointsToRedeem(maxAllowed);
                                    } else {
                                      setPointsToRedeem(val);
                                    }
                                  }}
                                  className="w-full bg-white border border-success rounded-md px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-success-bg/50 outline-none"
                                />
                              </div>
                              {pointsError && <p className="text-[9px] text-red-500 font-bold">{pointsError}</p>}
                              <p className="text-[9px] text-success font-bold uppercase tracking-widest">
                                Max Redeemable: {Math.min(rewardWallet.balance, Math.floor(subtotal * (rewardConfig.maxRedemptionPercentage / 100)))}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-neutral-400 italic">No points available to redeem.</p>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex justify-center p-4">
                    <Loader2 className="animate-spin text-neutral-300" size={16} />
                  </div>
                )}

                {rewardWallet && (
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <Info size={14} className="text-primary mt-0.5 shrink-0" />
                    <div className="text-[10px] font-bold text-primary leading-tight">
                      {rewardWallet.deliveredOrdersCount === 0
                        ? "First Order Special: Earn 10% rewards on orders above ₹300."
                        : `Note: To earn rewards on this order, total value must be above ₹${rewardConfig.minOrderAmountForRewards}.`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-foreground border-dashed mt-6 pt-6 mb-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Grand Payable</p>
                  <p className="text-3xl font-black text-foreground tracking-tighter flex items-center gap-1">
                    <IndianRupee size={24} className="text-primary" />
                    {total.toLocaleString()}
                  </p>
                </div>
                <div className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest">
                  Verified Checkout
                </div>
              </div>
            </div>

            {error && (
              <div className="p-2 bg-destructive-bg border border-red-100 rounded-md flex items-center gap-3 text-destructive mb-6 animate-in shake duration-500">
                <AlertCircle size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={loading || paymentProcessing || (!agentVerified && agentId)}
              className="w-full h-12 bg-primary text-white rounded-md font-black hover:bg-primary-hover transition-all shadow-xl shadow-primary/10 active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs disabled:opacity-50"
            >
              {loading || paymentProcessing ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <ShieldCheck size={20} />
                  AUTHORIZE PAYMENT
                </>
              )}
            </button>

            <div className="mt-4 flex flex-col items-center gap-2 pb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
                <ShieldCheck size={10} className="text-primary" />
                <span className="text-[8px] font-black text-primary uppercase tracking-widest">SECURE 256-BIT SSL ENCRYPTION</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
