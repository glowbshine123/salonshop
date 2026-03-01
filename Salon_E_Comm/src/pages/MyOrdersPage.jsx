import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext';
import { orderAPI, productAPI } from '../services/apiService';
import { ShoppingBag, Package, Calendar, ChevronRight, ChevronDown, CheckCircle2, Clock, XCircle, AlertCircle, ExternalLink, Star } from 'lucide-react';
import OrderSkeleton from '../components/common/OrderSkeleton';
import ReviewModal from '../components/common/ReviewModal';
import OrderInvoiceModal from '../components/admin/OrderInvoiceModal';
import { Button } from '../components/ui/button';
import toast from 'react-hot-toast';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const { startLoading, finishLoading } = useLoading();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const [reviewedProductIds, setReviewedProductIds] = useState(new Set());
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    fetchUserReviews();
  }, []);

  const fetchOrders = async () => {
    if (!localStorage.getItem('token')) {
      navigate('/auth/signin');
      return;
    }

    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      // Backend returns { orders: [], count: 0, ... }
      const list = response.data?.orders || response.data || [];
      setOrders(Array.isArray(list) ? list : []);
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      finishLoading();
    }
  };

  const fetchUserReviews = async () => {
    try {
      const res = await productAPI.getMyReviews();
      const reviews = res.data || [];
      const ids = new Set(reviews.map(r => r.product));
      setReviewedProductIds(ids);
    } catch (err) {
      console.error("Failed to fetch user reviews", err);
    }
  };

  const handleOpenReview = (item) => {
    setSelectedProduct(item);
    setIsReviewFormOpen(true);
  };

  const handleSubmitReview = async (formData) => {
    setSubmittingReview(true);
    try {
      // item.productId is usually an ID string, but check if it's an object
      const productId = selectedProduct.productId._id || selectedProduct.productId;

      await productAPI.addReview(productId, formData);

      toast.success("Review submitted successfully!");
      setReviewedProductIds(prev => new Set(prev).add(productId));
      setIsReviewFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: { color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
      PAID: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
      PROCESSING: { color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: Package },
      SHIPPED: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Package },
      DELIVERED: { color: 'text-emerald-700 bg-emerald-100 border-emerald-200', icon: CheckCircle2 },
      CANCELLED: { color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle },
      REFUNDED: { color: 'text-neutral-600 bg-neutral-50 border-neutral-100', icon: AlertCircle }
    };
    return configs[status] || { color: 'text-neutral-500 bg-neutral-50 border-neutral-100', icon: Clock };
  };

  if (loading) {
    return (
      <div className="bg-neutral-50/50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="h-12 w-64 bg-neutral-200 animate-pulse rounded-xl mb-8" />
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary/30 min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-body selection:bg-primary/10">
      <ReviewModal
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        onSubmit={handleSubmitReview}
        product={selectedProduct}
        loading={submittingReview}
      />

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-primary/5 pb-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-display font-black text-neutral-900 tracking-tighter leading-[0.8]">
              YOUR <br />
              <span className="text-primary italic">RITUALS</span>.
            </h1>
            <p className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
              <ShoppingBag size={14} className="text-primary" />
              {orders.length} Past Acquisition{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="group flex items-center gap-3 px-8 py-4 bg-white border border-neutral-100 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-900 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all"
          >
            Sourcing Collection
            <ExternalLink size={14} className="text-neutral-400 group-hover:text-primary transition-colors" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[48px] p-20 md:p-32 border border-primary/5 shadow-2xl shadow-primary/5 text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-24 h-24 bg-bg-secondary rounded-[32px] flex items-center justify-center mx-auto mb-8 transform -rotate-6 border border-primary/5">
              <Package size={40} className="text-primary/20" />
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <h2 className="text-3xl font-display font-black text-neutral-900 tracking-tight leading-none">NO RITUALS YET</h2>
              <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Your history is a blank canvas. Start curating your professional collection today.
              </p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-3 h-16 px-10 bg-primary text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 mt-6"
            >
              Start Curation
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedOrder === order._id;

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-[32px] border transition-all duration-500 overflow-hidden group ${isExpanded
                    ? 'border-primary/20 ring-8 ring-primary/5 shadow-2xl shadow-primary/10 bg-white'
                    : 'border-neutral-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/10'
                    }`}
                >
                  <div
                    className="p-8 md:p-10 cursor-pointer select-none"
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  >
                    <div className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
                      {/* Left: ID & Status */}
                      <div className="flex items-start gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner border border-primary/5 ${isExpanded ? 'bg-primary text-white' : 'bg-bg-secondary text-primary'}`}>
                          <StatusIcon size={24} className={isExpanded ? 'text-white' : 'text-primary'} />
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-xl font-display font-black text-neutral-900 tracking-tighter">
                              #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </h3>
                            <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors", statusCfg.color, "bg-white")}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-3">
                            <Calendar size={12} className="text-primary" />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                            {order.items.length} Product{order.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Right: Price & Toggle */}
                      <div className="flex items-center justify-between lg:justify-end gap-10 w-full lg:w-auto pl-20 lg:pl-0">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-1">Acquisition Value</p>
                          <p className="text-3xl font-display font-black text-neutral-900 tracking-tighter italic">₹{order.total.toLocaleString()}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Invoice Button */}
                          {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoiceOrder(order);
                                setIsInvoiceOpen(true);
                              }}
                              className="w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center bg-white text-neutral-400 hover:text-primary hover:border-primary/20 transition-all hover:scale-110 shadow-sm"
                              title="Download Invoice"
                            >
                              <ExternalLink size={20} />
                            </button>
                          )}

                          <div className={`w-12 h-12 rounded-full border border-neutral-100 flex items-center justify-center transition-all duration-500 ${isExpanded ? 'bg-neutral-900 text-white rotate-180 border-neutral-900' : 'bg-white text-neutral-400 group-hover:border-primary/20'}`}>
                            <ChevronDown size={22} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className={`grid transition-all duration-700 ease-[cubic-bezier(0.4, 0, 0.2, 1)] ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-primary/5 bg-bg-secondary/20 p-8 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">

                          {/* Col 1: Order Items (Span 2) */}
                          <div className="lg:col-span-2 space-y-10">
                            <h4 className="flex items-center gap-3 text-[10px] font-black text-neutral-900 uppercase tracking-[0.3em]">
                              <Package size={16} className="text-primary" />
                              MANIFEST
                            </h4>
                            <div className="space-y-4">
                              {order.items.map((item, idx) => {
                                const productId = item.productId._id || item.productId;
                                const isDelivered = order.status === 'DELIVERED' || order.status === 'COMPLETED';
                                const hasReviewed = reviewedProductIds.has(productId);
                                const showReviewBtn = isDelivered && !hasReviewed;

                                return (
                                  <div key={idx} className="bg-white p-6 rounded-3xl border border-primary/5 shadow-sm flex gap-6 items-center group/item hover:border-primary/20 transition-all">
                                    <div className="w-20 h-20 bg-bg-secondary rounded-[20px] shrink-0 overflow-hidden border border-primary/5 shadow-inner">
                                      {(item.image || item.productImage) ? (
                                        <img src={item.image || item.productImage} alt={item.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary/10">
                                          <Package size={28} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-lg font-display font-black text-neutral-900 line-clamp-1 italic">{item.name}</p>
                                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Quantity <span className="text-primary">{item.quantity}</span></p>
                                    </div>

                                    <div className="text-right space-y-3">
                                      <p className="text-xl font-display font-black text-neutral-900 tracking-tighter italic">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>

                                      {showReviewBtn && (
                                        <Button
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenReview(item);
                                          }}
                                          className="h-10 px-6 text-[9px] font-black rounded-full bg-primary hover:bg-primary-dark text-white uppercase tracking-widest shadow-lg shadow-primary/20"
                                        >
                                          <Star size={12} className="mr-2" />
                                          Rate
                                        </Button>
                                      )}

                                      {hasReviewed && (
                                        <span className="inline-flex items-center text-[9px] font-black text-accent-color bg-accent-color/5 px-3 py-1.5 rounded-full border border-accent-color/10 uppercase tracking-widest">
                                          <Star size={10} className="mr-1.5 fill-current" />
                                          Vetted
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Col 2: Details & Timeline */}
                          <div className="space-y-12">

                            {/* Shipping Address */}
                            <div className="space-y-6">
                              <h4 className="flex items-center gap-3 text-[10px] font-black text-neutral-900 uppercase tracking-[0.3em]">
                                <MapPin size={16} className="text-primary" />
                                DESTINATION
                              </h4>
                              <div className="bg-white p-8 rounded-[32px] border border-primary/5 shadow-xl shadow-primary/5 space-y-4">
                                <p className="text-base font-display font-black text-neutral-900 tracking-tight italic">{order.shippingAddress?.name || 'Authorized Member'}</p>
                                <p className="text-[11px] text-neutral-500 font-bold uppercase tracking-widest leading-relaxed">
                                  {order.shippingAddress?.street}<br />
                                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
                                </p>
                                <div className="pt-4 border-t border-primary/5">
                                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] italic">
                                    Contact: {order.shippingAddress?.phone}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Timeline/Status */}
                            <div className="space-y-6">
                              <h4 className="flex items-center gap-3 text-[10px] font-black text-neutral-900 uppercase tracking-[0.3em]">
                                <Clock size={16} className="text-primary" />
                                PROGRESS
                              </h4>
                              <div className="bg-white p-8 rounded-[32px] border border-primary/5 shadow-xl shadow-primary/5">
                                <div className="space-y-8 relative pl-4">
                                  {/* Line */}
                                  <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-bg-secondary" />

                                  {(order.timeline || [
                                    { status: 'PENDING', timestamp: order.createdAt, note: 'Order placed' },
                                    { status: order.status, timestamp: new Date(), note: 'Current Status' }
                                  ]).map((evt, idx) => (
                                    <div key={idx} className="relative flex gap-6">
                                      <div className={`w-3 h-3 rounded-full border-4 border-white shadow-xl shrink-0 z-10 mt-1.5 ring-4 ring-bg-secondary ${idx === 0 ? 'bg-primary' : 'bg-neutral-200'}`} />
                                      <div className="space-y-1">
                                        <p className="text-[10px] font-black text-neutral-900 uppercase tracking-widest">{evt.status}</p>
                                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest opacity-60">{new Date(evt.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                          </div>

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <OrderInvoiceModal
              isOpen={isInvoiceOpen}
              onClose={() => {
                setIsInvoiceOpen(false);
                setSelectedInvoiceOrder(null);
              }}
              order={selectedInvoiceOrder}
            />
          </div>
        )}
      </div>
    </div>
  );
}
