import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../context/LoadingContext';
import { orderAPI, productAPI } from '../../services/apiService';
import { ShoppingBag, Package, Calendar, ChevronRight, ChevronDown, CheckCircle2, Clock, XCircle, AlertCircle, ExternalLink, Star, Phone } from 'lucide-react';
import OrderSkeleton from '../../components/product/OrderSkeleton';
import ReviewModal from '../../components/product/ReviewModal';
import OrderInvoiceModal from '../../components/admin/OrderInvoiceModal';
import { Button } from '../../components/ui/button';
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
      PAID: { color: 'text-primary bg-primary/10 border-primary-muted', icon: CheckCircle2 },
      PROCESSING: { color: 'text-primary bg-primary/10 border-primary-muted', icon: Package },
      SHIPPED: { color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Package },
      DELIVERED: { color: 'text-primary bg-primary/20 border-primary-muted', icon: CheckCircle2 },
      CANCELLED: { color: 'text-red-600 bg-red-50 border-red-100', icon: XCircle },
      REFUNDED: { color: 'text-neutral-600 bg-neutral-50 border-neutral-100', icon: AlertCircle }
    };
    return configs[status] || { color: 'text-neutral-500 bg-neutral-50 border-neutral-100', icon: Clock };
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="h-12 w-64 bg-muted animate-pulse rounded-xl mb-8" />
          {Array.from({ length: 3 }).map((_, i) => (
            <OrderSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <ReviewModal
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        onSubmit={handleSubmitReview}
        product={selectedProduct}
        loading={submittingReview}
      />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">
              Order <span className="text-primary">History</span>
            </h1>
            <p className="flex items-center gap-2 mt-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <ShoppingBag size={14} className="text-primary" />
              {orders.length} Past Order{orders.length !== 1 ? 's' : ''}
            </p>
          </div>

        </div>

        {orders.length === 0 ? (
          <div className="bg-card rounded-[32px] p-16 md:p-24 border border-border shadow-xl shadow-foreground/5 text-center space-y-6">
            <div className="w-24 h-24 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <Package size={40} className="text-muted-foreground" />
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <h2 className="text-2xl font-black text-foreground tracking-tight">No Orders Yet</h2>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Your order history is empty. Start building your salon inventory with our premium professional collection.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 h-14 px-8 bg-foreground text-background rounded-2xl font-bold hover:bg-primary transition-all shadow-lg shadow-foreground/20 active:scale-95 mt-4"
            >
              Start Shopping
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedOrder === order._id;

              return (
                <div
                  key={order._id}
                  className={`bg-card rounded-lg border transition-all duration-300 overflow-hidden group ${isExpanded
                    ? 'border-primary/20 ring-4 ring-primary/5 shadow-xl'
                    : 'border-border shadow-sm hover:shadow-md hover:border-border-strong'
                    }`}
                >
                  <div
                    className="p-4 cursor-pointer select-none"
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  >
                    <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                      {/* Left: ID & Status */}
                      <div className="flex items-center gap-6">
                        {/* Avatar Group */}
                        <div className="flex -space-x-3 overflow-hidden shrink-0">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="inline-block h-12 w-12 rounded-full ring-2 ring-card overflow-hidden bg-muted border border-border">
                              <img
                                className="h-full w-full object-cover"
                                src={item.image || item.productImage || 'https://via.placeholder.com/48'}
                                alt=""
                              />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted ring-2 ring-card text-[10px] font-black text-muted-foreground border border-border bg-white-secondary">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-black text-foreground tracking-tight">
                              #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </h3>
                          </div>
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar size={12} />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                            <span className="w-1 h-1 rounded-full bg-border" />
                            {order.items.length} Items
                          </p>
                        </div>
                      </div>

                      {/* Right: Price, Status & Invoice */}
                      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 md:gap-6 w-full lg:w-auto">
                        <div className="text-left lg:text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Total</p>
                          <p className="text-2xl font-black text-foreground tracking-tight leading-none">₹{order.total.toLocaleString()}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${statusCfg.color} bg-card leading-none`}>
                            {order.status}
                          </span>

                          {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInvoiceOrder(order);
                                setIsInvoiceOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-md border border-border flex items-center gap-2 bg-card text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/20 transition-all hover:scale-105 active:scale-95 shadow-sm"
                              title="Download Invoice"
                            >
                              <ExternalLink size={12} />
                              Invoice
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-dashed border-border bg-muted/30 p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-4">

                          {/* Col 1: Order Items (Span 2) */}
                          <div className="lg:col-span-2 space-y-4">
                            <h4 className="flex items-center gap-2 text-xs font-black text-foreground uppercase tracking-widest">
                              <Package size={14} className="text-primary" />
                              Items Purchased
                            </h4>
                            <div className="space-y-2">
                              {order.items.map((item, idx) => {
                                // Check if reviewable
                                const productId = item.productId._id || item.productId;
                                const isDelivered = order.status === 'DELIVERED' || order.status === 'COMPLETED';
                                const hasReviewed = reviewedProductIds.has(productId);
                                const showReviewBtn = isDelivered && !hasReviewed;

                                return (
                                  <div key={idx} className="bg-card p-4 rounded-xl border border-border flex gap-4 items-center group/item hover:border-border-strong transition-all">
                                    <div className="w-16 h-16 bg-muted rounded-lg shrink-0 overflow-hidden border border-border group-hover/item:scale-105 transition-transform">
                                      {(item.image || item.productImage) ? (
                                        <img src={item.image || item.productImage} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                          <Package size={24} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-foreground line-clamp-1">{item.name}</p>
                                      <p className="text-xs text-muted-foreground mt-1 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-sm font-black text-foreground mb-2 tracking-tighter">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>

                                      {showReviewBtn && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenReview(item);
                                          }}
                                          className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg border-border hover:bg-muted hover:text-primary transition-all"
                                        >
                                          <Star size={12} className="mr-1.5" />
                                          Rate Product
                                        </Button>
                                      )}

                                      {hasReviewed && (
                                        <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                                          <Star size={10} className="mr-1 fill-current" />
                                          Reviewed
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Col 2: Details & Timeline */}
                          <div className="space-y-8">

                            {/* Shipping Address */}
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2 text-xs font-black text-foreground uppercase tracking-widest">
                                <ExternalLink size={14} className="text-primary" />
                                Shipping Details
                              </h4>
                              <div className="bg-card p-5 rounded-2xl border border-border shadow-sm space-y-3">
                                <p className="text-sm font-black text-foreground">{order.shippingAddress?.name || 'Customer'}</p>
                                <p className="text-xs text-muted-foreground leading-relaxed font-bold">
                                  {order.shippingAddress?.street}<br />
                                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
                                </p>
                                <div className="pt-2 border-t border-border">
                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                    <Phone size={12} />
                                    {order.shippingAddress?.phone ? `${order.shippingAddress?.countryCode || '91'} ${order.shippingAddress?.phone}` : 'NOT PROVIDED'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Timeline/Status */}
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2 text-xs font-black text-foreground uppercase tracking-widest">
                                <Clock size={14} className="text-primary" />
                                Order Timeline
                              </h4>
                              <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
                                <div className="space-y-6 relative pl-2">
                                  {/* Line */}
                                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border" />

                                  {(order.timeline || [
                                    { status: 'PENDING', timestamp: order.createdAt, note: 'Order placed' },
                                    { status: order.status, timestamp: new Date(), note: 'Current Status' }
                                  ]).map((evt, idx) => (
                                    <div key={idx} className="relative flex gap-4">
                                      <div className={`w-5 h-5 rounded-full border-2 border-card shadow-sm shrink-0 z-10 flex items-center justify-center ${idx === 0 ? 'bg-primary' : 'bg-muted'}`}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-foreground uppercase tracking-wider">{evt.status}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{new Date(evt.timestamp).toLocaleDateString()}</p>
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
