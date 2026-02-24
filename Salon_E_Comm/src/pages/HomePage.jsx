import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { productAPI } from '../services/apiService';
import { Button } from '../components/ui/button';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Heart, TrendingUp, Star, Search, Truck, Coins, Lock } from 'lucide-react';
import ProductCardSkeleton from '../components/common/ProductCardSkeleton';
import DotGrid from '../components/ui/dot-grid';

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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

    } catch (err) {
      console.error('[HomePage] Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50/50">

      <section className="relative w-full h-[350px] bg-green-950 border-b border-neutral-800 overflow-hidden">
        {/* Mobile Dark Overlay - Full cover with opacity for readability */}
        <div className="absolute inset-0 bg-neutral-900/70 z-10 md:hidden" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8 items-center">

            <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700 relative z-20 text-center md:text-left flex flex-col items-center md:items-start">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900/30 text-emerald-400 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 border border-emerald-900/50 backdrop-blur-sm">
                  <Sparkles size={12} />
                  Professional Grade
                </div>
                <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
                  Purest Quality. <br />
                  <span className="text-emerald-400">Direct Prices.</span>
                </h1>
                <p className="text-neutral-200 md:text-neutral-400 text-sm md:text-base font-medium max-w-md mt-2 drop-shadow-sm mx-auto md:mx-0">
                  Verified chemicals and equipment for salon professionals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 max-w-md w-full">
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    className="w-full h-10 rounded-xl pl-4 pr-12 bg-white/10 border border-white/10 text-white placeholder:text-neutral-300 focus:outline-none focus:bg-white/20 focus:border-emerald-500/50 transition-all font-medium backdrop-blur-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        navigate(`/products?search=${e.target.value}`);
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Search inventory..."]');
                      if (input) navigate(`/products?search=${input.value}`);
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-neutral-800/80 rounded-lg text-emerald-400 hover:text-white transition-colors"
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 md:left-auto md:right-8 md:w-1/2 overflow-hidden z-0">
              <div className="hidden md:block absolute inset-0 bg-linear-to-r from-green-950 via-green-950/20 to-transparent z-10" />
              <img
                src="https://orchidlifesciences.com/wp-content/uploads/2024/06/01-14-01-1024x704.jpg"
                alt="Professional Salon Supplies"
                className="w-full h-full object-cover object-center opacity-60 md:opacity-100"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Featured Section - Pure White Cards on Neutral-50 */}
      <section className="py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={TrendingUp}
            iconColor="text-blue-600"
            label="Trending Now"
            title="Our Collection."
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

      {/* Featured Products Section */}
      <section className="py-8 relative bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={Star}
            iconColor="text-amber-500"
            label="Editor's Choice"
            title="Featured Collection."
            actionText="View All Featured"
            onAction={() => navigate('/products?featured=true')}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-x-8 sm:gap-y-16">
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
      <section className="py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            icon={Zap}
            iconColor="text-blue-600"
            label="New Drops"
            title="Latest Arrivals."
            actionText="View All New"
            onAction={() => navigate('/products?sort=newest')}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-x-8 sm:gap-y-16">
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
