import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI, paymentAPI, userAPI, authAPI, rewardAPI, settingsAPI } from '../services/apiService';
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from '../context/CartContext';
import { useAuth } from '@/context/AuthContext';
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
  Info,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from "@/lib/utils";
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
          name: `${user.firstName} ${user.lastName} `,
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
          name: `${user.firstName} ${user.lastName} `,
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
        description: `Order ${createdOrder.orderNumber} `,
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
        return `${agent.firstName} ${agent.lastName} `;
      }
    }
    const selected = agents.find(a => a._id === agentId);
    return selected ? `${selected.firstName} ${selected.lastName} ` : '';
  };

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Final Step</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black text-neutral-900 tracking-tighter">
              Checkout Ritual.
            </h1>
            <p className="text-neutral-400 font-medium tracking-tight">Finalize your professional inventory selection with precision.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Section - Form */}
          <div className="lg:col-span-7 space-y-12">
            <div className="bg-white rounded-[48px] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="p-10 border-b border-primary/5 flex items-center gap-6 bg-bg-secondary/50">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">1</div>
                <h2 className="text-2xl font-display font-black text-neutral-900 tracking-tight">Shipping Logistics</h2>
              </div>
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Recipient Name</label>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={shippingAddress.name}
                        onChange={e => setShippingAddress(s => ({ ...s, name: e.target.value }))}
                        className="w-full bg-bg-secondary border border-transparent rounded-[24px] p-5 pl-14 text-sm font-bold focus:bg-white focus:border-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Contact Phone</label>
                    <div className="relative group">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={shippingAddress.phone}
                        onChange={e => setShippingAddress(s => ({ ...s, phone: e.target.value }))}
                        className="w-full bg-bg-secondary border border-transparent rounded-[24px] p-5 pl-14 text-sm font-bold focus:bg-white focus:border-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Street Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-300 group-focus-within:text-primary transition-colors" size={20} />
                      <input
                        type="text"
                        placeholder="123 Luxury Lane, Business District"
                        value={shippingAddress.street}
                        onChange={e => setShippingAddress(s => ({ ...s, street: e.target.value }))}
                        className="w-full bg-bg-secondary border border-transparent rounded-[24px] p-5 pl-14 text-sm font-bold focus:bg-white focus:border-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">City</label>
                    <input
                      type="text"
                      placeholder="Mumbai"
                      value={shippingAddress.city}
                      onChange={e => setShippingAddress(s => ({ ...s, city: e.target.value }))}
                      className="w-full bg-bg-secondary border border-transparent rounded-[24px] p-5 text-sm font-bold focus:bg-white focus:border-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">State</label>
                      <input
                        type="text"
                        placeholder="MH"
                        value={shippingAddress.state}
                        onChange={e => setShippingAddress(s => ({ ...s, state: e.target.value }))}
                        className="w-full bg-bg-secondary border border-transparent rounded-[24px] p-5 text-sm font-bold focus:bg-white focus:border-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">ZIP / PIN</label>
                      <input
                        type="text"
                        placeholder="400001"
                        value={shippingAddress.zip}
                        onChange={e => setShippingAddress(s => ({ ...s, zip: e.target.value }))}
                        className="w-full bg-bg-secondary border border-transparent rounded-[24px] p-5 text-sm font-bold focus:bg-white focus:border-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Agent - Only visible if assigned */}
            {user?.role === 'SALON_OWNER' && user?.salonOwnerProfile?.agentId && (
              <div className="bg-white rounded-[48px] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="p-10 border-b border-primary/5 flex items-center gap-6 bg-bg-secondary/50">
                  <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">2</div>
                  <h2 className="text-2xl font-display font-black text-neutral-900 tracking-tight">Agent Attribution</h2>
                </div>
                <div className="p-10">
                  <div className="p-10 bg-primary-light border border-primary/10 rounded-[40px] flex items-center gap-8 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-5 -mr-10 -mt-10 rotate-12 transition-transform group-hover:rotate-0">
                      <Zap size={160} className="text-primary fill-primary" />
                    </div>
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-primary shadow-xl shadow-primary/10 border border-primary/5 relative z-10 transition-transform hover:scale-110">
                      <Link2 size={36} />
                    </div>
                    <div className="flex-1 relative z-10">
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 items-center flex gap-2">
                        <ShieldCheck size={14} />
                        Professional Liaison
                      </p>
                      <h4 className="text-3xl font-display font-black text-neutral-900 tracking-tight">
                        {getAgentName()}
                      </h4>
                      <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-widest leading-relaxed">Identity Verified Professional Relationship</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            <div className="bg-white rounded-[48px] border border-primary/5 shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="p-10 border-b border-primary/5 flex items-center gap-6 bg-bg-secondary/50">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">3</div>
                <h2 className="text-2xl font-display font-black text-neutral-900 tracking-tight">Payment Protocol</h2>
              </div>
              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'ONLINE', label: 'DIGITAL RITUAL', icon: Zap, sub: 'UPI, Cards, Wallets' },
                    { id: 'COD', label: 'OFFLINE HANDOVER', icon: Truck, sub: 'Pay on arrival' }
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
                      className={cn(
                        "cursor-pointer p-8 rounded-[40px] border-2 transition-all flex flex-col items-start gap-6 group relative overflow-hidden",
                        paymentMethod === method.id
                          ? 'bg-primary/5 border-primary shadow-2xl shadow-primary/10'
                          : 'bg-white border-transparent hover:border-primary/10 hover:bg-bg-secondary'
                      )}
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                        paymentMethod === method.id ? 'bg-primary text-white scale-110 rotate-3 shadow-lg shadow-primary/30' : 'bg-bg-secondary text-neutral-300'
                      )}>
                        <method.icon size={32} />
                      </div>
                      <div className="space-y-1">
                        <p className={cn(
                          "text-base font-black uppercase tracking-widest transition-colors",
                          paymentMethod === method.id ? 'text-primary' : 'text-neutral-900'
                        )}>{method.label}</p>
                        <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">{method.sub}</p>
                      </div>

                      {paymentMethod === method.id && (
                        <div className="absolute top-6 right-6">
                          <CheckCircle2 className="text-primary" size={24} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {paymentMethod === 'COD' && (
                  <div className="mt-8 p-6 bg-accent-color/5 rounded-[32px] border border-accent-color/20 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Info size={20} className="text-accent-color mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-accent-color uppercase tracking-tight mb-1">
                        {rewardWallet?.deliveredOrdersCount === 0 ? 'Welcome Privilege' : 'Loyalty Limitation'}
                      </p>
                      <p className="text-xs font-medium text-neutral-500 leading-relaxed">
                        {rewardWallet?.deliveredOrdersCount === 0
                          ? "Congratulations on your first selection! You remain eligible for reward points even via offline handover. Subsequent offline rituals do not accumulate points."
                          : "To ensure your loyalty rewards accumulate, please select a digital ritual. Offline handovers do not contribute to your ritual balance."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Sidebar */}
          <div className="lg:col-span-5 space-y-12 h-fit lg:sticky lg:top-32">
            <div className="bg-bg-secondary p-10 rounded-[56px] border border-primary/5 shadow-2xl shadow-primary/5 flex flex-col relative overflow-hidden group">
              <h3 className="text-2xl font-display font-black text-neutral-900 tracking-tight mb-10 border-b border-primary/5 pb-6 text-center">Ritual Invoice.</h3>

              <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar shrink-0">
                {displayItems.map((item, idx) => (
                  <div key={idx} className="flex gap-6 items-center group/item">
                    <div className="relative">
                      <img
                        src={item.productImage || item.image || 'https://via.placeholder.com/64?text=Product'}
                        alt={item.productName || item.name || 'Product'}
                        className="w-20 h-20 rounded-[28px] object-cover border border-primary/5 group-hover/item:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute -top-3 -right-3 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg shadow-primary/20 scale-0 group-hover/item:scale-100 transition-transform duration-500">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-display font-black text-neutral-900 truncate tracking-tight">{item.productName || item.name}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">₹{item.price?.toLocaleString()} <span className="text-primary-light bg-primary/10 px-2 py-0.5 rounded-full ml-2">x {item.quantity}</span></p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-5 border-t border-primary/5 pt-10">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <span>Collective Value</span>
                  <span className="text-neutral-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
                  <span>Logistics</span>
                  <span className="text-primary">Complimentary</span>
                </div>
              </div>

              {/* Rewards Redemption UI */}
              <div className="mt-8 pt-8 border-t border-primary/5">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black text-neutral-900 uppercase tracking-[0.3em] flex items-center gap-2">
                    <Zap size={14} className="text-primary fill-primary" />
                    Ritual Loyalty
                  </span>
                  {rewardWallet && (
                    <span className="text-[10px] font-bold text-primary-dark/60 uppercase tracking-widest bg-primary-light px-3 py-1.5 rounded-full border border-primary/5">
                      {rewardWallet.isUnlocked ? `Balance: ${rewardWallet.balance} ` : 'Encrypted'}
                    </span>
                  )}
                </div>

                {rewardWallet ? (
                  !rewardWallet.isUnlocked ? (
                    <div className="bg-white p-6 rounded-[32px] border border-primary/5 flex items-start gap-4">
                      <div className="p-3 bg-bg-secondary rounded-2xl text-neutral-300">
                        <Lock size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-black text-neutral-900 uppercase tracking-tight">Privilege Encrypted</p>
                        <p className="text-[10px] font-bold text-neutral-400 mt-1 leading-relaxed">
                          Conclude {rewardWallet.ordersNeededForUnlock} more successful rituals to unlock your loyalty privileges.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {rewardWallet.balance > 0 ? (
                        <div className="bg-white p-6 rounded-[32px] border border-primary/10 shadow-xl shadow-primary/5">
                          <div className="flex items-center gap-4 mb-5">
                            <input
                              type="checkbox"
                              checked={redeemRewards}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setRedeemRewards(checked);
                                if (checked) {
                                  const maxRedeemable = Math.min(rewardWallet.balance, Math.floor(subtotal * (rewardConfig.maxRedemptionPercentage / 100)));
                                  setPointsToRedeem(maxRedeemable);
                                } else {
                                  setPointsToRedeem(0);
                                }
                              }}
                              className="w-5 h-5 text-primary rounded-[6px] focus:ring-primary/20 border-primary/20"
                            />
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-900">
                              Redeem Ritual Points
                            </label>
                          </div>

                          {redeemRewards && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                              <div className="relative">
                                <input
                                  type="number"
                                  value={pointsToRedeem || ''}
                                  placeholder="00"
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value) || 0;
                                    setPointsError('');
                                    const maxAllowed = Math.floor(subtotal * (rewardConfig.maxRedemptionPercentage / 100));

                                    if (val > rewardWallet.balance) {
                                      setPointsError(`Balance limit: ${rewardWallet.balance} `);
                                      setPointsToRedeem(rewardWallet.balance);
                                    } else if (val > maxAllowed) {
                                      setPointsError(`${rewardConfig.maxRedemptionPercentage}% limit: ${maxAllowed} `);
                                      setPointsToRedeem(maxAllowed);
                                    } else {
                                      setPointsToRedeem(val);
                                    }
                                  }}
                                  className="w-full bg-bg-secondary border border-primary/10 rounded-2xl px-5 py-3 text-sm font-black focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                                />
                                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary">POINTS</span>
                              </div>
                              {pointsError && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-widest">{pointsError}</p>}
                              <p className="text-[9px] text-neutral-300 font-bold uppercase tracking-[0.2em]">
                                Ritual Max: {Math.min(rewardWallet.balance, Math.floor(subtotal * (rewardConfig.maxRedemptionPercentage / 100)))}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] font-bold text-neutral-300 italic text-center">No ritual points available for redemption.</p>
                      )}
                    </div>
                  )
                ) : (
                  <div className="flex justify-center p-6 bg-white rounded-3xl border border-primary/5">
                    <Loader2 className="animate-spin text-primary/30" size={24} />
                  </div>
                )}

                {rewardWallet && (
                  <div className="mt-8 p-5 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-4">
                    <Info size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-[9px] font-bold text-primary-dark/60 leading-relaxed uppercase tracking-widest">
                      {rewardWallet.deliveredOrdersCount === 0
                        ? "Premiere Ritual Perk: Earn 10% rewards on selections above ₹300."
                        : `Requirement: Ritual value must exceed ₹${rewardConfig.minOrderAmountForRewards} to earn loyalty points.`}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-12 pt-10 border-t-2 border-primary border-dashed relative">
                <div className="flex justify-between items-end mb-10">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.3em]">Ritual Settlement</p>
                    <p className="text-5xl font-black text-neutral-900 tracking-tighter flex items-center gap-2">
                      <span className="text-2xl text-primary mt-1">₹</span>
                      {total.toLocaleString()}
                    </p>
                  </div>
                  <div className="px-5 py-2 bg-primary text-white rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20">
                    Net Total
                  </div>
                </div>

                {error && (
                  <div className="p-5 bg-rose-50 border border-rose-100 rounded-[28px] flex items-center gap-4 text-rose-600 mb-8 animate-in bounce duration-700">
                    <AlertCircle size={24} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                  </div>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || paymentProcessing || (!agentVerified && agentId)}
                  className="w-full h-20 bg-primary text-white rounded-[32px] font-black hover:bg-primary-dark transition-all shadow-2xl shadow-primary/30 active:scale-[0.97] flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-sm disabled:opacity-50 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12" />
                  {loading || paymentProcessing ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <Zap size={20} className="fill-white" />
                      Authorize Ritual
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-bg-secondary rounded-full border border-primary/5">
                    <ShieldCheck size={14} className="text-primary" />
                    <span className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.3em]">Encrypted Ritual Protocol</span>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-20 -right-20 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none">
                <Zap size={400} className="text-primary fill-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
