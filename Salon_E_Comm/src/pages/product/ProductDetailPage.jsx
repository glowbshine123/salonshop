import React, { useState, useEffect } from "react";
import SEO from "../../components/common/SEO";
import { useParams, useNavigate, Link } from "react-router-dom";
import { productAPI, categoryAPI } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLoading } from "../../context/LoadingContext";
import { ShoppingCart, ShieldCheck, Truck, RefreshCcw, Star, ChevronRight, Plus, Minus, Heart, Share2, Loader2, ThumbsUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../../components/ui/button";
import ProductCard from "../../components/product/ProductCard";
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
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
      <SEO 
        title={product.name} 
        description={product.description.slice(0, 160)} 
        image={images[0]} 
        type="product" 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

          <div className="flex flex-col-reverse md:flex-row gap-4 h-fit">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto md:max-h-[600px] scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary ring-1 ring-primary' : 'border-transparent hover:border-border'}`}
                >
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 relative aspect-square bg-muted/30 rounded-lg overflow-hidden border border-border z-0">
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

          <div className="flex flex-col space-y-6">

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-300">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.round(reviewStats.averageRating) ? "currentColor" : "none"} className={i < Math.round(reviewStats.averageRating) ? "text-rating" : "text-border"} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-muted-foreground">({reviewStats.totalReviews} Reviews)</span>
                </div>

                <div className="flex gap-2">
                  {/* <button className="p-3 bg-muted/50 rounded-full hover:bg-muted transition-colors text-foreground">
                    <Heart size={20} />
                  </button> */}
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-background rounded-full transition-colors text-foreground "
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight capitalize">{product.name}</h1>

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider">
                <span className="px-3 py-1 bg-background-secondary text-muted-foreground rounded-lg">{product.category}</span>
                {product.subcategory && (
                  <span className="px-3 py-1 bg-background-secondary text-muted-foreground rounded-lg">{product.subcategory}</span>
                )}
                {product.weight && (
                  <span className="ml-auto px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">{product.weight}</span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed text-base line-clamp-3 font-medium">
              {product.description}
            </p>

            <div className="h-px bg-border/50" />

            <div className="space-y-6">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-primary">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                )}
                {discount > 0 && (
                  <div className="text-primary text-xs font-black tracking-wider mb-2">
                    -{discount}% OFF
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                {/* Expiry Info */}
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-4">
                  {/* Container for future info */}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex items-center gap-1 bg-neutral-50 rounded-lg p-1 border border-neutral-100 shadow-sm">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      disabled={quantity <= 1 || product.inventoryCount <= 0 || product.status === 'EXPIRED'}
                      className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-neutral-600 transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="w-12 text-center font-black text-lg text-primary tracking-tighter">
                      {quantity}
                    </div>
                    <button
                      onClick={() => setQuantity(prev => Math.min(product.inventoryCount, prev + 1))}
                      disabled={quantity >= product.inventoryCount || product.inventoryCount <= 0 || product.status === 'EXPIRED'}
                      className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-neutral-600 transition-all active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product.inventoryCount <= 0 || product.status === 'EXPIRED'}
                    className={cn(
                      "h-12 flex-1 px-12 rounded-lg bg-primary hover:bg-primary-hover text-background font-black text-sm uppercase tracking-[0.15em] transition-all shadow-xl shadow-primary/10",
                      (product.inventoryCount <= 0 || product.status === 'EXPIRED') && "bg-neutral-200 hover:bg-neutral-200 cursor-not-allowed shadow-none text-neutral-400"
                    )}
                  >
                    {addingToCart ? <Loader2 className="animate-spin mr-3" size={18} /> : <ShoppingCart className="mr-3" size={18} />}
                    {product.status === 'EXPIRED' ? 'Inactive Item' : (product.inventoryCount <= 0 ? 'Out of Stock' : 'Add to Salon Basket')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 border-t border-border/50 pt-16">
          <h3 className="text-2xl font-black text-foreground mb-8 uppercase tracking-tighter">Specifications & Content</h3>

          <div className="space-y-8 max-w-3xl">
            {product.contentSections && product.contentSections.length > 0 ? (
              product.contentSections.map((section, idx) => (
                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    <h4 className="text-lg font-black text-foreground uppercase tracking-tight">{section.heading}</h4>
                  </div>

                  {section.sectionType === 'PARAGRAPH' ? (
                    <div className="prose prose-neutral max-w-full">
                      <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap text-base">
                        {section.content}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {section.specs?.map((spec, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0 border-dashed">
                          <span className="text-sm font-bold capitalize tracking-wider text-muted-foreground min-w-[120px]">{spec.label}</span>
                          <span className="text-foreground font-bold capitalize tracking-wide">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="prose prose-neutral max-w-none text-muted-foreground">
                <p className="font-medium leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-20 border-t border-border/50 pt-16">
          <h3 className="text-2xl font-black text-foreground mb-10">Ratings & Reviews</h3>

          <div className={cn("grid grid-cols-1 gap-12", reviewStats.totalReviews > 0 ? "md:grid-cols-12" : "md:grid-cols-1")}>
            {reviewStats.totalReviews > 0 && (
              <div className="md:col-span-4 space-y-8">
                <div className="bg-muted/30 rounded-[32px] p-8 text-center ring-1 ring-border/50">
                  <div className="text-6xl font-black text-foreground mb-2">{reviewStats.averageRating}</div>
                  <div className="flex justify-center gap-1 text-rating mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} fill={i < Math.round(reviewStats.averageRating) ? "currentColor" : "none"} className={i < Math.round(reviewStats.averageRating) ? "text-rating" : "text-border"} />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">{reviewStats.totalReviews} Verified Review{reviewStats.totalReviews !== 1 && 's'}</p>
                </div>

                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviewStats.ratingDistribution?.[star] || 0;
                    const percent = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-4">
                        <div className="flex items-center gap-1 w-12 cursor-default">
                          <span className="text-sm font-bold text-foreground">{star}</span>
                          <Star size={12} className="text-border" />
                        </div>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews List */}
            <div className={cn(reviewStats.totalReviews > 0 ? "md:col-span-8" : "md:col-span-12", "space-y-8")}>
              {reviews.length === 0 ? (
                <div className="text-center py-6 bg-muted/20 rounded-lg border-2 border-dashed border-border/50">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold">No reviews yet. Be the first to review!</p>
                  <Button variant="outline" className="mt-6 border-border hover:bg-muted font-bold px-8">Purchase the order first to Write a Review</Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review._id} className="p-8 bg-muted/20 rounded-lg space-y-4 border border-border/30">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center font-bold text-primary">
                            {review.user?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{review.user?.firstName} {review.user?.lastName}</h4>
                            <div className="flex gap-0.5 text-rating">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "text-rating" : "text-border"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed font-medium">{review.comment}</p>
                    </div>
                  ))}

                  {hasMoreReviews && (
                    <div className="pt-4 text-center">
                      <Button
                        onClick={handleLoadMoreReviews}
                        disabled={loadingReviews}
                        variant="outline"
                        className="rounded-2xl px-12 py-6 border-border hover:bg-muted font-bold transition-all"
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
        <div className="mt-24 border-t border-border/50 pt-16">
          <h3 className="text-2xl font-black text-foreground mb-10 uppercase tracking-tighter">Similar Professional Products</h3>
          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
              {relatedProducts.map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground font-medium">No related products found at the moment.</p>
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

