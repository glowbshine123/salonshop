import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { productAPI } from '../services/apiService';
import { useLoading } from '../context/LoadingContext';
import { Button } from '../components/ui/button';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Heart, TrendingUp, Star, Search, Truck, Coins, Lock } from 'lucide-react';
import ProductCardSkeleton from '../components/common/ProductCardSkeleton';
import DotGrid from '../components/ui/dot-grid';

const SectionHeader = ({ icon: Icon, iconColor, label, title, actionText, onAction, actionIconColor = "text-primary" }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8 mb-8 md:mb-12">
    <div className="space-y-2">
      <div className={`flex items-center gap-2 ${iconColor} mb-2`}>
        <div className="p-2 bg-primary-light rounded-lg">
          <Icon size={16} className="fill-primary" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-body text-neutral-400">{label}</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-display font-black text-neutral-900 tracking-tighter">{title}</h2>
    </div>
    <Button
      onClick={onAction}
      variant="ghost"
      className="group flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-primary transition-all self-start md:self-end uppercase tracking-widest px-0 hover:bg-transparent"
    >
      {actionText}
      <div className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
        <ArrowRight size={14} className={`group-hover:translate-x-0.5 transition-transform ${actionIconColor} group-hover:text-white`} />
      </div>
    </Button>
  </div>
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

      {/* Hero Section - Glow B Shine Premium */}
      <section className="relative w-full h-[500px] md:h-[600px] bg-bg-secondary border-b border-primary/5 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-[5%] w-48 h-48 bg-accent-color/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-12 items-center">

            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-primary rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-sm border border-primary/5">
                  <Sparkles size={14} className="animate-pulse" />
                  Natural & Salon Quality
                </div>
                <h1 className="text-6xl lg:text-8xl font-display font-black text-neutral-900 leading-[0.9] tracking-tighter">
                  PREMIUM <br />
                  <span className="text-primary italic">BEAUTY</span> <br />
                  PRODUCTS
                </h1>
                <p className="text-neutral-500 text-sm md:text-lg font-medium max-w-sm leading-relaxed">
                  Discover our curated collection of professional rituals for your daily glow.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate('/products')}
                  className="h-14 px-10 rounded-full bg-primary hover:bg-primary-dark text-white font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  Shop Now
                </Button>
                <div className="flex -space-x-3 items-center">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-neutral-100 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                    </div>
                  ))}
                  <div className="pl-6">
                    <p className="text-[11px] font-bold text-neutral-900 uppercase tracking-tighter">12K+ Happy Souls</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className="fill-accent-color text-accent-color" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden md:flex justify-center items-center">
              <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in duration-1000 delay-300">
                <img
                  src="https://orchidlifesciences.com/wp-content/uploads/2024/06/01-14-01-1024x704.jpg"
                  alt="Premium Products"
                  className="w-full h-auto rounded-[40px] shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-transform duration-700"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-[24px] shadow-2xl border border-neutral-100 animate-bounce duration-[3000ms]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                      <Heart size={20} className="text-primary fill-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-neutral-900 uppercase tracking-tighter">Purest Quality</p>
                      <p className="text-[10px] text-neutral-400 font-bold">Verified Professional</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories - Glow B Shine Style */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-8 md:gap-16 pb-4 justify-between">
            {[
              { name: 'Scrubs', icon: 'https://img.icons8.com/ios/100/FF1B6B/cosmetic-brush.png' },
              { name: 'Face Creams', icon: 'https://img.icons8.com/ios/100/FF1B6B/cream-tube.png' },
              { name: 'Cleansers', icon: 'https://img.icons8.com/ios/100/FF1B6B/soap.png' },
              { name: 'Hair Care', icon: 'https://img.icons8.com/ios/100/FF1B6B/shampoo.png' },
              { name: 'Facial Kits', icon: 'https://img.icons8.com/ios/100/FF1B6B/cosmetic-face-mask.png' },
              { name: 'Body Lotions', icon: 'https://img.icons8.com/ios/100/FF1B6B/bottle-of-liquid-soap.png' }
            ].map((cat, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-4 cursor-pointer group flex-shrink-0"
                onClick={() => navigate(`/products?category=${cat.name}`)}
              >
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-bg-secondary border border-primary/5 flex items-center justify-center transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:-translate-y-2 group-hover:bg-primary-light">
                  <img src={cat.icon} alt={cat.name} className="w-10 h-10 md:w-14 md:h-14 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-[11px] md:text-xs font-bold text-neutral-500 group-hover:text-primary transition-colors uppercase tracking-widest">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Section - Pure White Cards on Neutral-50 */}
      <section className="py-8 md:py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={TrendingUp}
            iconColor="text-primary"
            label="Trending Now"
            title="Bestselling Products."
            actionText="View All Products"
            onAction={() => navigate('/products')}
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
              <Button onClick={fetchProducts} variant="outline" className="rounded-2xl px-10 h-14 border-2">Try Again</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-x-8 sm:gap-y-16">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* If we have more than 4 products, they already list in rows because of the grid */}
              {products.length === 0 && (
                <div className="text-center py-20 bg-white rounded-[40px] border border-neutral-100">
                  <p className="text-neutral-400 font-bold">No professional products available at the moment.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Editor's Choice Section */}
      <section className="py-12 md:py-24 relative bg-bg-secondary overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5">
          <Sparkles size={300} className="text-primary" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader
            icon={Star}
            iconColor="text-primary"
            label="Editor's Choice"
            title="House Pick Collection."
            actionText="View All Featured"
            onAction={() => navigate('/products?featured=true')}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Arrivals Section */}
      <section className="py-12 md:py-24 relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={Zap}
            iconColor="text-primary"
            label="New Drops"
            title="The Latest Rituals."
            actionText="View All New"
            onAction={() => navigate('/products?sort=newest')}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-8">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              latestProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-2 tracking-tight">Why Choose SalonE-Comm?</h2>
            <p className="text-lg text-neutral-500 font-medium leading-relaxed">Premium products, smart commission tracking, and fast delivery — all in one platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-[40px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
              <div className="p-10 bg-white rounded-[40px] border border-neutral-100 h-full hover:border-emerald-100 transition-colors">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <Truck size={32} />
                </div>
                <h3 className="text-3xl font-black mb-3 -tracking-tight text-neutral-900">Fast Delivery</h3>
                <p className="text-neutral-500 text-base leading-relaxed font-medium">
                  We guarantee 24-hour dispatch for all professional salon orders.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-[40px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
              <div className="p-10 bg-white rounded-[40px] border border-neutral-100 h-full hover:border-emerald-100 transition-colors">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <Lock size={32} />
                </div>
                <h3 className="text-3xl font-black mb-3 -tracking-tight text-neutral-900">Secure Payments</h3>
                <p className="text-neutral-500 text-base leading-relaxed font-medium">
                  Pay safely with trusted and encrypted payment methods.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-emerald-50 rounded-[40px] translate-x-3 translate-y-3 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform -z-10" />
              <div className="p-10 bg-white rounded-[40px] border border-neutral-100 h-full hover:border-emerald-100 transition-colors">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-3xl font-black mb-3 -tracking-tight text-neutral-900">Trusted Quality</h3>
                <p className="text-neutral-500 text-base leading-relaxed font-medium">
                  Quality-tested products from verified brands you can trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-24 border-y border-neutral-100 bg-white relative overflow-hidden">
        <DotGrid
          baseColor="#D4D4D4" // slightly darker for visibility on white
          gap={20}
          dotSize={2}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 text-center divide-x divide-emerald-500/10">
            <div className="space-y-2">
              <h3 className="text-5xl md:text-6xl font-black text-emerald-600 tracking-tighter">500+</h3>
              <p className="text-neutral-900 font-bold uppercase tracking-widest text-sm">Products</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-5xl md:text-6xl font-black text-emerald-600 tracking-tighter">300+</h3>
              <p className="text-neutral-900 font-bold uppercase tracking-widest text-sm">Agents</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-5xl md:text-6xl font-black text-emerald-600 tracking-tighter">1200+</h3>
              <p className="text-neutral-900 font-bold uppercase tracking-widest text-sm">Salons</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-5xl md:text-6xl font-black text-emerald-600 tracking-tighter">₹10L+</h3>
              <p className="text-neutral-900 font-bold uppercase tracking-widest text-sm">Monthly Orders</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {/* <section className="py-32 bg-emerald-500/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-10">
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tight leading-[0.9]">Start Earning With <br /> <span className="text-green-950">SalonE-Comm</span> Today.</h2>
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/agent/register')}
              variant="outline"
              className="h-16 px-12 rounded-none border border-neutral-600 bg-white hover:bg-white/90 text-neutral-900 text-lg font-bold tracking-widest uppercase transition-all duration-300"
            >
              Become an Agent
            </Button>
          </div>
        </div>
      </section> */}
    </div>
  );
}
