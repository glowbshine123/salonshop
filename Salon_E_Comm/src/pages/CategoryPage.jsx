import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { productAPI } from '../services/apiService';
import { useLoading } from '../context/LoadingContext';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import ProductCardSkeleton from '../components/common/ProductCardSkeleton';
import { Button } from '../components/ui/button';

export default function CategoryPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const { startLoading, finishLoading } = useLoading();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      setError('');
      try {
        // Backend handles category filtering
        const res = await productAPI.getAll({ category: category, status: 'ACTIVE' });
        setProducts(res.data?.products || []);
      } catch (err) {
        console.error('Failed to load category products', err);
        setError('Failed to load products for this category.');
      } finally {
        setLoading(false);
        finishLoading();
      }
    };

    fetchCategoryProducts();
  }, [category]);

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-20">
      {/* Category Header - Luxury Style */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-8 p-0 h-auto hover:bg-transparent text-neutral-400 hover:text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 group transition-all"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-emerald-600 mb-2">
                <LayoutGrid size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Collections</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-neutral-900 tracking-tighter capitalize">{category}</h1>
              <p className="text-neutral-500 font-semibold">{products.length} Professional products curated for you</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-32 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
            <p className="text-red-500 font-black mb-6 uppercase tracking-widest">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl px-10 h-14 border-2">Retry</Button>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map(product => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
            <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutGrid size={32} className="text-neutral-300" />
            </div>
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">No Products Found</h2>
            <p className="text-neutral-500 font-medium">We haven't listed any professional gear in <span className="text-emerald-600">{category}</span> yet.</p>
            <Button
              onClick={() => navigate('/')}
              className="mt-8 bg-neutral-900 hover:bg-emerald-600 text-white font-black rounded-2xl h-14 px-8"
            >
              Continue Shopping
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
