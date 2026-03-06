import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { productAPI, categoryAPI } from '../services/apiService';
import { useLoading } from '../context/LoadingContext';
import { Button } from '../components/ui/button';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Heart, TrendingUp, Star, Truck, Coins, Lock } from 'lucide-react';
import ProductCardSkeleton from '../components/common/ProductCardSkeleton';
import DotGrid from '../components/ui/dot-grid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import 'swiper/css/effect-fade';

const SectionHeader = ({ icon: Icon, iconColor, label, title, actionText, onAction, actionIconColor = "text-primary" }) => (
  <div className="flex flex-row items-center justify-between gap-2 md:gap-6 mb-2">
    <h2 className="text-xl md:text-2xl font-bold tracking-wide text-foreground">{title}</h2>
    <Button onClick={onAction} variant="ghost" className="group flex items-center gap-1 text-sm font-bold text-neutral-500 hover:text-neutral-900 duration-100 transition-colors">
      {actionText}
      <ArrowRight size={16} className={`group-hover:translate-x-1 transition-transform ${actionIconColor}`} />
    </Button>
  </div>
);

const HeroSection = ({ navigate }) => (
  <section className="relative w-full pb-4 md:pb-0 md:h-[350px] overflow-hidden">
    <img src="/bg/b4.png" alt="bg" className='absolute w-full h-full object-cover' />

    <div className="max-w-7xl mx-auto lg:px-8 h-full flex items-center relative z-20">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-2 md:gap-8 items-center">

        <div className="px-4 sm:px-6 space-y-6 animate-in fade-in slide-in-from-left duration-700 relative z-20 text-center md:text-left flex flex-col items-center md:items-start order-2 md:order-1">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-foreground">
              Premium beauty{" "}
              <span className="text-primary">Products.</span>
            </h1>
            <p className="text-foreground-secondary text-sm md:text-lg capitalize font-medium max-w-md mt-2 drop-shadow-sm mx-auto md:mx-0">
              natural & Salon Quality.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-md w-full justify-center md:justify-start">
            <Button
              size="lg"
              className="rounded-md px-10 font-bold text-lg shadow-foreground-muted shadow-md bg-primary text-secondary transition-colors duration-300 hover:bg-primary-hover"
              onClick={() => navigate('/products')}
            >
              Shop Now
            </Button>
          </div>
        </div>

        <div className="overflow-hidden z-0 order-1 md:order-2 w-full  aspect-video md:aspect-auto md:h-[350px]">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            className="w-full h-full"
          >
            {[
              "https://orchidlifesciences.com/wp-content/uploads/2024/06/01-14-01-1024x704.jpg",
              "https://images.unsplash.com/photo-1625753783470-ec2ab4efeeec?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJlYXV0eSUyMHByb2R1Y3RzfGVufDB8fDB8fHww",
              "https://images.unsplash.com/photo-1631390179406-0bfe17e9f89d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGJlYXV0eSUyMHByb2R1Y3RzfGVufDB8fDB8fHww"
            ].map((img, idx) => (
              <SwiperSlide key={idx}>
                <img
                  src={img}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-cover object-center transition-opacity duration-1000"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </div>
  </section>
);

const ProductsSection = ({
  loading,
  error,
  products,
  title,
  label,
  icon,
  iconColor,
  actionText,
  onAction,
  onRetry
}) => (
  <section className="py-8 relative">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        icon={icon}
        iconColor={iconColor}
        label={label}
        title={title}
        actionText={actionText}
        onAction={onAction}
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-16">
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-32 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
          <p className="text-red-500 font-black mb-6 uppercase tracking-widest">{error}</p>
          <Button onClick={onRetry} variant="outline" className="rounded-2xl px-10 h-14 border-2">Try Again</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-x-8 sm:gap-y-16">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border border-neutral-100">
              <p className="text-neutral-400 font-bold">No professional products available at the moment.</p>
            </div>
          )}
        </>
      )}
    </div>
  </section>
);

const WhyChooseUsSection = () => (
  <section className="py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-2 tracking-tight">Why Choose SalonE-Comm?</h2>
        <p className="text-lg text-neutral-500 font-medium leading-relaxed">Premium products, smart commission tracking, and fast delivery — all in one platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          { icon: <Truck size={32} />, title: "Fast Delivery", description: "We guarantee 24-hour dispatch for all professional salon orders." },
          { icon: <Lock size={32} />, title: "Secure Payments", description: "Pay safely with trusted and encrypted payment methods." },
          { icon: <ShieldCheck size={32} />, title: "Trusted Quality", description: "Quality-tested products from verified brands you can trust." }
        ].map((feature, i) => (
          <div key={i} className="group relative">
            <div className="absolute inset-0 bg-emerald-50 rounded-[40px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
            <div className="p-10 bg-white rounded-[40px] border border-neutral-100 h-full hover:border-emerald-100 transition-colors">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                {feature.icon}
              </div>
              <h3 className="text-3xl font-black mb-3 -tracking-tight text-neutral-900">{feature.title}</h3>
              <p className="text-neutral-500 text-base leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const StatsSection = () => (
  <section className="py-24 border-y border-neutral-100 bg-white relative overflow-hidden">
    <DotGrid
      baseColor="#D4D4D4"
      gap={20}
      dotSize={2}
    />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 text-center divide-x divide-emerald-500/10">
        {[
          { value: "500+", label: "Products" },
          { value: "300+", label: "Agents" },
          { value: "1200+", label: "Salons" },
          { value: "₹10L+", label: "Monthly Orders" }
        ].map((stat, i) => (
          <div key={i} className="space-y-2">
            <h3 className="text-5xl md:text-6xl font-black text-emerald-600 tracking-tighter">{stat.value}</h3>
            <p className="text-neutral-900 font-bold uppercase tracking-widest text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CategoriesSection = ({ categories, loading, onAction }) => {
  const navigate = useNavigate();

  if (loading && categories.length === 0) {
    return (
      <section className="py-12 md:py-20 border-b border-neutral-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div className="space-y-3">
              <div className="h-4 w-32 bg-neutral-100 animate-pulse rounded-full" />
              <div className="h-10 w-64 bg-neutral-100 animate-pulse rounded-lg" />
            </div>
            <div className="h-10 w-24 bg-neutral-100 animate-pulse rounded-lg hidden md:block" />
          </div>
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="shrink-0 w-[140px] md:w-[180px] aspect-square bg-neutral-50 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0 && !loading) return null;

  return (
    <section className="py-6 md:py-10 border-b border-neutral-100 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          icon={Sparkles}
          iconColor="text-emerald-500"
          label="Professional Grade"
          title="Shop by Category"
          actionText="View All"
          onAction={onAction}
        />

        <div className="flex items-start gap-2 md:gap-6 overflow-x-auto scrollbar-hide">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => cat.onSelect()}
              className="shrink-0 w-[100px] md:w-[120px] group"
            >
              <div className="relative aspect-square rounded-md md:rounded-lg overflow-hidden mb-1 bg-neutral-50 border border-neutral-100 group-hover:border-primary/20 transition-all duration-300">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=60'}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform duration-300">Explore</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-primary transition-colors text-center capitalize tracking-tight px-1 line-clamp-2">{cat.name}</h3>
            </button>
          ))}
          <button
            onClick={() => navigate(`/products`)}
            className="shrink-0 w-[100px] md:w-[120px] group"
          >
            <div className="relative aspect-square rounded-md md:rounded-lg overflow-hidden mb-1 bg-primary-muted border border-neutral-100 group-hover:border-primary/20 transition-all duration-300 flex items-center justify-center">
              <div className='flex items-center justify-center p-4 rounded-full bg-primary text-white'>
                <ArrowRight size={32} />
              </div>
            </div>
            <h3 className="text-xs md:text-sm font-bold text-neutral-900 group-hover:text-primary transition-colors text-center capitalize tracking-tight px-1 line-clamp-2">View All</h3>
          </button>
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { startLoading, finishLoading } = useLoading();

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const trendingRes = await productAPI.getAll({ status: 'ACTIVE', limit: 5, sort: 'price_desc' });
      setProducts(trendingRes.data?.products || []);

      const featuredRes = await productAPI.getAll({ status: 'ACTIVE', limit: 5, featured: 'true' });
      setFeaturedProducts(featuredRes.data?.products || []);

      const latestRes = await productAPI.getAll({ status: 'ACTIVE', limit: 5, sort: 'newest' });
      setLatestProducts(latestRes.data?.products || []);

      // Fetch Categories
      const categoriesRes = await categoryAPI.getAll();
      const allCategories = categoriesRes.data || [];
      const parentCategories = allCategories.filter(cat => !cat.parent);

      // Fetch representative image for each category
      const categoriesWithImages = await Promise.all(parentCategories.map(async (cat) => {
        try {
          const prodRes = await productAPI.getAll({ category: cat.name, limit: 1 });
          const firstProduct = prodRes.data?.products?.[0];
          return {
            name: cat.name,
            image: firstProduct?.images?.[0] || firstProduct?.image || null,
            onSelect: () => navigate(`/products?category=${encodeURIComponent(cat.name)}`)
          };
        } catch (err) {
          console.error(`Failed to fetch image for category ${cat.name}`, err);
          return { name: cat.name, image: null, onSelect: () => navigate(`/products?category=${encodeURIComponent(cat.name)}`) };
        }
      }));

      setCategories(categoriesWithImages);

    } catch (err) {
      console.error('[HomePage] Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
      finishLoading();
    }
  };

  useEffect(() => {
    startLoading();
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <HeroSection navigate={navigate} />

      <CategoriesSection
        categories={categories}
        loading={loading}
        onAction={() => navigate('/products')}
      />

      <ProductsSection
        loading={loading}
        error={error}
        products={products}
        title="Our Collection."
        label="Trending Now"
        icon={TrendingUp}
        iconColor="text-blue-600"
        actionText="View All Products"
        onAction={() => navigate('/products')}
        onRetry={fetchProducts}
      />

      <ProductsSection
        loading={loading}
        error={error}
        products={featuredProducts}
        title="Featured Collection."
        label="Editor's Choice"
        icon={Star}
        iconColor="text-amber-500"
        actionText="View All Featured"
        onAction={() => navigate('/products?featured=true')}
        onRetry={fetchProducts}
      />

      <ProductsSection
        loading={loading}
        error={error}
        products={latestProducts}
        title="Latest Arrivals."
        label="New Drops"
        icon={Zap}
        iconColor="text-blue-600"
        actionText="View All New"
        onAction={() => navigate('/products?sort=newest')}
        onRetry={fetchProducts}
      />

      <WhyChooseUsSection />

      <StatsSection />
    </div>
  );
}
