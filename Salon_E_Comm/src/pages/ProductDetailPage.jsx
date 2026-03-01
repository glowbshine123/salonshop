import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productAPI, categoryAPI } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLoading } from "../context/LoadingContext";
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
  const { startLoading, finishLoading } = useLoading();
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
        finishLoading();
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
    <div className="bg-white min-h-screen pb-24 font-body">
      {/* Breadcrumbs - Premium */}
      <div className="bg-bg-secondary/50 border-b border-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            <Link to="/" className="hover:text-primary transition-colors">House</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-primary transition-colors">Collections</Link>
            <ChevronRight size={12} />
            <span className="text-neutral-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* Gallery Section */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-6 h-fit">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:max-h-[600px] scrollbar-hide order-2 md:order-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative shrink-0 w-20 h-20 md:w-28 md:h-28 rounded-3xl overflow-hidden border-2 transition-all duration-500 ${selectedImage === idx ? 'border-primary shadow-xl shadow-primary/10' : 'border-transparent hover:border-primary-light'}`}
                >
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 relative aspect-[4/5] bg-bg-secondary rounded-[40px] overflow-hidden border border-primary/5 shadow-2xl shadow-primary/5 z-0 order-1 md:order-2">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={0}
                slidesPerView={1}
                pagination={{ clickable: true, dynamicBullets: true }}
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

              <button className="absolute top-6 right-6 z-10 p-3.5 bg-white/90 backdrop-blur-md rounded-full text-neutral-300 hover:text-primary transition-all shadow-xl">
                <Heart size={22} />
              </button>
            </div>
          </div>

          {/* Info Section */}
          <div className="lg:col-span-5 flex flex-col space-y-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary text-white text-[9px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                    {product.brand || 'Premium Ritual'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={12} className={i <= 4 ? "fill-accent-color text-accent-color" : "text-neutral-200"} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">({reviewStats.totalReviews} Reviews)</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-neutral-900 leading-[0.9] tracking-tighter">
                  {product.name}
                </h1>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-[0.3em]">
                  {product.subcategory} <span className="mx-2 text-neutral-200">|</span> {product.weight || 'Standard Size'}
                </p>
              </div>

              <p className="text-neutral-500 font-medium text-base md:text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-end gap-4">
                <span className="text-5xl font-black text-neutral-900 tracking-tighter">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-2xl text-neutral-300 line-through mb-1.5 font-medium">₹{product.originalPrice.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <div className="px-3 py-1 bg-accent-color/10 text-accent-color text-[10px] font-black rounded-full mb-3 uppercase tracking-widest">
                    Save {discount}%
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-bg-secondary rounded-full p-1.5 border border-primary/5 h-14">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-primary transition-all active:scale-95"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="w-12 text-center font-black text-neutral-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-11 h-11 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-primary transition-all active:scale-95"
                    >
                      <Plus size={18} />
                    </button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.inventoryCount <= 0 || product.status === 'EXPIRED'}
                    className={cn(
                      "flex-1 h-14 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm uppercase tracking-widest transition-all shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95",
                      (product.inventoryCount <= 0 || product.status === 'EXPIRED') && "bg-neutral-100 text-neutral-400 shadow-none hover:scale-100"
                    )}
                  >
                    {addingToCart ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2" size={18} />}
                    {product.status === 'EXPIRED' ? 'Ritual Closed' : (product.inventoryCount <= 0 ? 'Out of Stock' : 'Add to Bag')}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-primary/5">
                  {[
                    { icon: ShieldCheck, label: 'Pure Quality' },
                    { icon: Truck, label: 'Fast Shipping' },
                    { icon: RefreshCcw, label: '7 Day Return' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 text-center group">
                      <div className="w-10 h-10 rounded-2xl bg-bg-secondary flex items-center justify-center text-primary group-hover:bg-primary-light transition-colors">
                        <item.icon size={20} />
                      </div>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-32">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
            {/* Specifications & Content */}
            <div className="flex-1 space-y-12">
              <div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-8">The Experience</h3>
                <div className="space-y-10">
                  {product.contentSections && product.contentSections.length > 0 ? (
                    product.contentSections.map((section, idx) => (
                      <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                        <h4 className="text-2xl font-display font-black text-neutral-900 tracking-tight capitalize mb-4">
                          {section.heading}
                        </h4>

                        {section.sectionType === 'PARAGRAPH' ? (
                          <p className="text-neutral-500 leading-relaxed font-medium whitespace-pre-wrap text-base">
                            {section.content}
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {section.specs?.map((spec, sIdx) => (
                              <div key={sIdx} className="p-4 bg-bg-secondary rounded-2xl border border-primary/5 group hover:bg-primary-light transition-colors">
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">{spec.label}</p>
                                <p className="text-sm font-bold text-neutral-900 capitalize">{spec.value}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-500 font-medium leading-relaxed">{product.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Ratings & Reviews Sidebar */}
            <div className="w-full md:w-80 lg:w-96 space-y-10">
              <div>
                <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-8">Ritual Feedback</h3>
                <div className="p-8 bg-bg-secondary rounded-[40px] border border-primary/5 text-center relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="text-7xl font-display font-black text-neutral-900 tracking-tighter mb-2">{reviewStats.averageRating}</div>
                    <div className="flex justify-center gap-1 text-accent-color mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={i < Math.round(reviewStats.averageRating) ? "fill-accent-color" : "text-neutral-200"} />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{reviewStats.totalReviews} Verified Souls</p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
                    <Heart size={100} className="text-primary fill-primary" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewStats.ratingDistribution?.[star] || 0;
                  const percent = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-10">
                        <span className="text-xs font-bold text-neutral-900">{star}</span>
                        <Star size={10} className="fill-accent-color text-accent-color" />
                      </div>
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-neutral-400 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List - Luxury Feed */}
        <div className="mt-24">
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review._id} className="p-8 bg-white border border-primary/5 rounded-[32px] shadow-xl shadow-primary/5 group hover:-translate-y-2 transition-all duration-500">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-light text-primary rounded-2xl flex items-center justify-center font-black text-lg">
                        {review.user?.firstName?.[0] || 'G'}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-neutral-900">{review.user?.firstName} {review.user?.lastName}</h4>
                        <div className="flex gap-0.5 text-accent-color">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={10} className={i < review.rating ? "fill-accent-color" : "text-neutral-200"} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-neutral-500 text-sm font-medium leading-relaxed mb-6 italic">"{review.comment}"</p>
                  <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </div>
              ))}
            </div>
          )}

          {hasMoreReviews && (
            <div className="mt-12 text-center">
              <Button onClick={handleLoadMoreReviews} disabled={loadingReviews} variant="ghost" className="text-xs font-bold text-neutral-400 hover:text-primary uppercase tracking-widest px-8">
                {loadingReviews ? 'Unveiling...' : 'See More Feedbacks'}
              </Button>
            </div>
          )}
        </div>

        {/* Related Products - Curated Collection */}
        <div className="mt-32 border-t border-primary/5 pt-20">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-3xl md:text-4xl font-display font-black text-neutral-900 tracking-tighter">Complimentary Rituals.</h3>
            <Button onClick={() => navigate('/products')} variant="ghost" className="text-xs font-bold text-primary uppercase tracking-widest">Explore Collection</Button>
          </div>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-bg-secondary rounded-[40px] border border-dashed border-primary/10">
              <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">No complimentary rituals found.</p>
            </div>
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

