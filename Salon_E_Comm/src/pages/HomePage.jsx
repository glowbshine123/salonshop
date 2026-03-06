import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { productAPI } from '../services/apiService';
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

const SectionHeader = ({ icon: Icon, iconColor, label, title, actionText, onAction, actionIconColor = "text-emerald-600" }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-2 md:gap-6 mb-2 md:mb-8">
    <div className="space-y-1 max-w-2xl">
      <div className={`flex items-center gap-2 ${iconColor} mb-2`}>
        <Icon size={18} fill="currentColor" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{label}</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-black text-neutral-900 leading-[0.9] tracking-tighter">{title}</h2>
    </div>
    <Button onClick={onAction} variant="ghost" className="group flex items-center gap-1 text-sm font-bold text-neutral-500 hover:text-neutral-900 duration-100 transition-colors self-end">
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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { startLoading, finishLoading } = useLoading();

  const fetchProducts = async () => {
    // startLoading(); // Triggered on initial mount in useEffect
    setLoading(true);
    setError('');
    try {
      const trendingRes = await productAPI.getAll({ status: 'ACTIVE', limit: 5, sort: 'price_desc' });
      setProducts(trendingRes.data?.products || []);

      const featuredRes = await productAPI.getAll({ status: 'ACTIVE', limit: 5, featured: 'true' });
      setFeaturedProducts(featuredRes.data?.products || []);

      const latestRes = await productAPI.getAll({ status: 'ACTIVE', limit: 5, sort: 'newest' });
      setLatestProducts(latestRes.data?.products || []);

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
