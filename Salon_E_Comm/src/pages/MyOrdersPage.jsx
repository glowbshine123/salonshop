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
    <div className="bg-neutral-50/50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <ReviewModal
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        onSubmit={handleSubmitReview}
        product={selectedProduct}
        loading={submittingReview}
      />

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter">
              Order <span className="text-emerald-600">History</span>
            </h1>
            <p className="flex items-center gap-2 mt-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
              <ShoppingBag size={14} className="text-emerald-600" />
              {orders.length} Past Order{orders.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 px-6 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-black uppercase tracking-widest text-neutral-900 hover:border-neutral-300 hover:shadow-md transition-all"
          >
            Sourcing Collection
            <ExternalLink size={14} className="text-neutral-400 group-hover:text-emerald-600 transition-colors" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-[32px] p-16 md:p-24 border border-neutral-100 shadow-xl shadow-neutral-100/50 text-center space-y-6">
            <div className="w-24 h-24 bg-neutral-50 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <Package size={40} className="text-neutral-300" />
            </div>
            <div className="max-w-md mx-auto space-y-3">
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">No Orders Yet</h2>
              <p className="text-neutral-500 font-medium leading-relaxed">
                Your order history is empty. Start building your salon inventory with our premium professional collection.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 h-14 px-8 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-neutral-900/20 active:scale-95 mt-4"
            >
              Start Shopping
              <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedOrder === order._id;

              return (
                <div
                  key={order._id}
                  className={`bg-white rounded-[24px] border transition-all duration-300 overflow-hidden group ${isExpanded
                    ? 'border-emerald-500/20 ring-4 ring-emerald-500/5 shadow-xl'
                    : 'border-neutral-100 shadow-sm hover:shadow-md hover:border-neutral-200'
                    }`}
                >
                  <div
                    className="p-6 md:p-8 cursor-pointer select-none"
                    onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                  >
                    <div className="flex flex-col lg:flex-row gap-6 lg:items-center justify-between">
                      {/* Left: ID & Status */}
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${statusCfg.bg} ${statusCfg.color.replace('text-', 'bg-').replace('600', '100')}`}>
                          <StatusIcon size={20} className={statusCfg.color} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-black text-neutral-900 tracking-tight">
                              #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                            </h3>
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${statusCfg.color} bg-white`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-neutral-400 flex items-center gap-2">
                            <Calendar size={12} />
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
                            <span className="w-1 h-1 rounded-full bg-neutral-300" />
                            {order.items.length} Items
                          </p>
                        </div>
                      </div>

                      {/* Right: Price & Toggle */}
                      <div className="flex items-center justify-between lg:justify-end gap-8 w-full lg:w-auto pl-16 lg:pl-0">
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total</p>
                          <p className="text-2xl font-black text-neutral-900 tracking-tight">₹{order.total.toLocaleString()}</p>
                        </div>

                        {/* Invoice Button */}
                        {(order.status === 'DELIVERED' || order.status === 'COMPLETED') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInvoiceOrder(order);
                              setIsInvoiceOpen(true);
                            }}
                            className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center bg-white text-neutral-400 hover:text-emerald-600 hover:border-emerald-200 transition-all hover:scale-105 active:scale-95 shadow-sm"
                            title="Download Invoice"
                          >
                            <ExternalLink size={18} />
                          </button>
                        )}

                        <div className={`w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-neutral-900 text-white rotate-180' : 'bg-white text-neutral-400 group-hover:border-neutral-300'}`}>
                          <ChevronDown size={20} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <div className="border-t border-dashed border-neutral-100 bg-neutral-50/30 p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

                          {/* Col 1: Order Items (Span 2) */}
                          <div className="lg:col-span-2 space-y-6">
                            <h4 className="flex items-center gap-2 text-xs font-black text-neutral-900 uppercase tracking-widest">
                              <Package size={14} className="text-emerald-600" />
                              Items Purchased
                            </h4>
                            <div className="space-y-3">
                              {order.items.map((item, idx) => {
                                // Check if reviewable
                                const productId = item.productId._id || item.productId;
                                const isDelivered = order.status === 'DELIVERED' || order.status === 'COMPLETED';
                                const hasReviewed = reviewedProductIds.has(productId);
                                const showReviewBtn = isDelivered && !hasReviewed;

                                return (
                                  <div key={idx} className="bg-white p-4 rounded-xl border border-neutral-100 flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-neutral-50 rounded-lg shrink-0 overflow-hidden border border-neutral-100">
                                      {(item.image || item.productImage) ? (
                                        <img src={item.image || item.productImage} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                          <Package size={24} />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-bold text-neutral-900 line-clamp-1">{item.name}</p>
                                      <p className="text-xs text-neutral-500 mt-1">Qty: {item.quantity}</p>
                                    </div>

                                    <div className="text-right">
                                      <p className="text-sm font-black text-neutral-900 mb-2">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>

                                      {showReviewBtn && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenReview(item);
                                          }}
                                          className="h-8 text-xs rounded-lg border-neutral-200 hover:bg-neutral-50 hover:text-emerald-600"
                                        >
                                          <Star size={12} className="mr-1.5" />
                                          Rate Product
                                        </Button>
                                      )}

                                      {hasReviewed && (
                                        <span className="inline-flex items-center text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded-md">
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
                              <h4 className="flex items-center gap-2 text-xs font-black text-neutral-900 uppercase tracking-widest">
                                <ExternalLink size={14} className="text-emerald-600" />
                                Shipping Details
                              </h4>
                              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-3">
                                <p className="text-sm font-bold text-neutral-900">{order.shippingAddress?.name || 'Customer'}</p>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                  {order.shippingAddress?.street}<br />
                                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zip}
                                </p>
                                <div className="pt-2 border-t border-neutral-50">
                                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                    Phone: {order.shippingAddress?.phone}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Timeline/Status */}
                            <div className="space-y-4">
                              <h4 className="flex items-center gap-2 text-xs font-black text-neutral-900 uppercase tracking-widest">
                                <Clock size={14} className="text-emerald-600" />
                                Order Timeline
                              </h4>
                              <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm">
                                <div className="space-y-6 relative pl-2">
                                  {/* Line */}
                                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-neutral-100" />

                                  {(order.timeline || [
                                    { status: 'PENDING', timestamp: order.createdAt, note: 'Order placed' },
                                    { status: order.status, timestamp: new Date(), note: 'Current Status' }
                                  ]).map((evt, idx) => (
                                    <div key={idx} className="relative flex gap-4">
                                      <div className={`w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0 z-10 flex items-center justify-center ${idx === 0 ? 'bg-emerald-500' : 'bg-neutral-200'}`}>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">{evt.status}</p>
                                        <p className="text-[10px] text-neutral-400 font-medium">{new Date(evt.timestamp).toLocaleDateString()}</p>
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
