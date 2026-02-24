import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productAPI, categoryAPI } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ShoppingCart, ShieldCheck, Truck, RefreshCcw, Star, ChevronRight, Plus, Minus, Heart, Share2, Loader2, ThumbsUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../components/ui/button";
import ProductCard from "../components/common/ProductCard";
import toast from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0, ratingDistribution: {} });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [swiperInstance, setSwiperInstance] = useState(null);

  // Fetch Product Data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await productAPI.getById(id);
        const data = res.data;
        if (!data) throw new Error("Product not found");
        setProduct(data);

        if (data.category) {
          const relatedRes = await productAPI.getAll({
            category: data.category,
            limit: 5,
            exclude: data._id
          });
          setRelatedProducts(relatedRes.data?.products || []);
        }

        await fetchReviews(data._id, 1);

      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Product not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0); // Scroll to top on id change
  }, [id]);

  useEffect(() => {
    if (swiperInstance && !swiperInstance.destroyed) {
      if (swiperInstance.activeIndex !== selectedImage) {
        swiperInstance.slideTo(selectedImage);
      }
    }
  }, [selectedImage, swiperInstance]);

  const fetchReviews = async (productId, page) => {
    setLoadingReviews(true);
    try {
      const res = await productAPI.getReviews(productId, { page, limit: 3 });
      if (page === 1) {
        setReviews(res.data.reviews || []);
      } else {
        setReviews(prev => [...prev, ...res.data.reviews]);
      }
      setReviewStats(res.data.stats || { averageRating: 0, totalReviews: 0, ratingDistribution: {} });
      setHasMoreReviews(res.data.pagination.current < res.data.pagination.pages);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleLoadMoreReviews = () => {
    const nextPage = reviewPage + 1;
    setReviewPage(nextPage);
    fetchReviews(product._id, nextPage);
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart");
      navigate("/auth/signin");
      return;
    }
    if (product.status === 'EXPIRED') {
      toast.error("This product has expired and cannot be purchased.");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      toast.success("Added to salon basket");
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const calculateDiscount = (original, price) => {
    if (!original || original <= price) return 0;
    return Math.round(((original - price) / original) * 100);
  };

  if (loading) return <DetailSkeleton />;
  if (error || !product) return <ErrorState error={error} navigate={navigate} />;

  const images = product.images && product.images.length > 0 ? product.images : [product.image || 'https://via.placeholder.com/500'];
  const discount = calculateDiscount(product.originalPrice, product.price);

  return (
    <div className="bg-white min-h-screen pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          <div className="flex flex-col-reverse md:flex-row gap-4 h-fit">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:max-h-[600px] scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-neutral-900 ring-1 ring-neutral-900' : 'border-transparent hover:border-neutral-200'}`}
                >
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 relative aspect-square bg-neutral-50 rounded-lg overflow-hidden border border-neutral-100 z-0">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                onSwiper={setSwiperInstance}
                onSlideChange={(swiper) => {
                  if (swiper.activeIndex !== selectedImage) {
                    setSelectedImage(swiper.activeIndex);
                  }
                }}
                className="w-full h-full"
              >
                {images.map((img, idx) => (
                  <SwiperSlide key={idx}>
                    <img
                      src={img}
                      alt={`${product.name} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          <div className="flex flex-col space-y-8">

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.round(reviewStats.averageRating) ? "currentColor" : "none"} className={i < Math.round(reviewStats.averageRating) ? "text-amber-500" : "text-neutral-300"} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-neutral-500">({reviewStats.totalReviews} Reviews)</span>
                </div>

                <div className="flex gap-2">
                  <button className="p-3 bg-neutral-50 rounded-full hover:bg-neutral-100 transition-colors text-neutral-600">
                    <Heart size={20} />
                  </button>
                  <button className="p-3 bg-neutral-50 rounded-full hover:bg-neutral-100 transition-colors text-neutral-600">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-medium text-neutral-900 leading-tight capitalize">{product.name}</h1>

              <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-lg">{product.category}</span>
                {product.subcategory && (
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-lg">{product.subcategory}</span>
                )}
              </div>
            </div>

            <p className="text-neutral-500 leading-relaxed text-base line-clamp-3">
              {product.description}
            </p>

            <div className="h-px bg-neutral-100" />

            <div className="space-y-6">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-neutral-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-neutral-400 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <div className="text-neutral-900 text-xs font-black tracking-wider mb-2">
                    -{discount}% OFF
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                {/* Expiry & Weight Info */}
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-100 pb-4">
                  {product.weight && <div className="flex items-center gap-2">
                    <span>Weight:</span>
                    <span className="text-neutral-900">{product.weight}</span>
                  </div>}
                </div>

                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-neutral-500">
                  <span>Quantity</span>
                  <span className={product.status === 'EXPIRED' ? "text-rose-500" : (product.inventoryCount < 10 ? "text-rose-500" : "text-emerald-600")}>
                    {product.status === 'EXPIRED' ? "Product Expired" : (product.inventoryCount > 0 ? `${product.inventoryCount} Available` : "Out of Stock")}
                  </span>
                </div>

                <div className="flex gap-4">
                  <div className={cn(
                    "flex items-center bg-neutral-100 rounded-2xl p-1 h-14 w-fit",
                    product.inventoryCount <= 0 ? "opacity-50 pointer-events-none" : ""
                  )}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-full flex items-center justify-center hover:bg-white rounded-xl transition-all"
                    >
                      <Minus size={18} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      className="w-12 bg-transparent text-center font-bold outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-full flex items-center justify-center hover:bg-white rounded-xl transition-all"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.inventoryCount <= 0 || product.status === 'EXPIRED'}
                    className={cn(
                      "flex-1 h-14 rounded-2xl bg-neutral-900 hover:bg-black text-white font-bold text-lg uppercase tracking-wide transition-all shadow-xl shadow-neutral-900/20",
                      (product.inventoryCount <= 0 || product.status === 'EXPIRED') && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {addingToCart ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2" size={20} />}
                    {product.status === 'EXPIRED' ? 'Item Expired' : (product.inventoryCount <= 0 ? 'Out of Stock' : 'Add to Basket')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-neutral-100 pt-16">
          <h3 className="text-2xl font-black text-neutral-900 mb-8 uppercase tracking-tighter">System Specifications & Content</h3>

          <div className="space-y-12">
            {product.contentSections && product.contentSections.length > 0 ? (
              product.contentSections.map((section, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-neutral-900 rounded-full"></div>
                    <h4 className="text-lg font-black text-neutral-900 uppercase tracking-tight">{section.heading}</h4>
                  </div>

                  {section.sectionType === 'PARAGRAPH' ? (
                    <div className="prose prose-neutral max-w-none">
                      <p className="text-neutral-500 leading-relaxed font-medium whitespace-pre-wrap">
                        {section.content}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 rounded-3xl p-8 border border-neutral-100">
                      {section.specs?.map((spec, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-4 py-2.5 group border-b border-neutral-100/50 last:border-0 border-dashed">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500 transition-all shrink-0" />
                          <span className="text-[11px] font-black uppercase tracking-widest text-neutral-400 min-w-[160px]">{spec.label}</span>
                          <span className="text-neutral-300 font-black">:</span>
                          <span className="text-sm font-black text-neutral-800 group-hover:text-emerald-600 transition-all uppercase tracking-tight">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="prose prose-neutral max-w-none text-neutral-500">
                <p className="font-medium leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 border-t border-neutral-100 pt-16">
          <h3 className="text-2xl font-black text-neutral-900 mb-10">Ratings & Reviews</h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4 space-y-8">
              <div className="bg-neutral-50 rounded-[32px] p-8 text-center">
                <div className="text-6xl font-black text-neutral-900 mb-2">{reviewStats.averageRating}</div>
                <div className="flex justify-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={20} fill={i < Math.round(reviewStats.averageRating) ? "currentColor" : "none"} className={i < Math.round(reviewStats.averageRating) ? "text-amber-500" : "text-neutral-300"} />
                  ))}
                </div>
                <p className="text-sm font-bold text-neutral-500">{reviewStats.totalReviews} Verified Review{reviewStats.totalReviews !== 1 && 's'}</p>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewStats.ratingDistribution?.[star] || 0;
                  const percent = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-12 cursor-default">
                        <span className="text-sm font-bold text-neutral-900">{star}</span>
                        <Star size={12} className="text-neutral-300" />
                      </div>
                      <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-xs font-bold text-neutral-400 w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            <div className="md:col-span-8 space-y-8">
              {reviews.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
                  <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500 font-bold">No reviews yet. Be the first to review!</p>
                  <Button variant="outline" className="mt-4">Write a Review</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-6 bg-neutral-50 rounded-3xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-500">
                            {review.user?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-neutral-900">{review.user?.firstName} {review.user?.lastName}</h4>
                            <div className="flex gap-0.5 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-amber-500" : "text-neutral-300"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-neutral-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-neutral-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}

                  {hasMoreReviews && (
                    <div className="pt-4 text-center">
                      <Button
                        onClick={handleLoadMoreReviews}
                        disabled={loadingReviews}
                        variant="outline"
                        className="rounded-xl px-8"
                      >
                        {loadingReviews ? <Loader2 className="animate-spin" /> : "Read More Reviews"}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-24 border-t border-neutral-100 pt-16">
          <h3 className="text-2xl font-black text-neutral-900 mb-10">Similar Professional Products</h3>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-neutral-500">No related products found.</p>
          )}
        </div>

      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Skeleton className="h-[500px] w-full rounded-[40px]" />
        <div className="space-y-6">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, navigate }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6">
      <h2 className="text-2xl font-bold">{error}</h2>
      <Button onClick={() => navigate('/')}>Back to Shop</Button>
    </div>
  )
}

