import React, { useState, useEffect } from 'react';
import SEO from '../components/common/SEO';
import { useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/apiService';
import { useLoading } from '../context/LoadingContext';
import { Zap } from 'lucide-react';

// Import refactored home components
import HeroSection from '../components/home/HeroSection';
import CategoriesSection from '../components/home/CategoriesSection';
import FeaturedHorizontalSection from '../components/home/FeaturedHorizontalSection';
import ProductsSection from '../components/home/ProductsSection';
import WhyChooseUsSection from '../components/home/WhyChooseUsSection';
import StatsSection from '../components/home/StatsSection';

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
      <SEO 
        title="Home" 
        description="Discover premium salon products, tools, and professional supplies at Salon E-Comm. Quality products for professional results."
      />
      <HeroSection navigate={navigate} />

      <CategoriesSection
        categories={categories}
        loading={loading}
        onAction={() => navigate('/products')}
      />

      <FeaturedHorizontalSection
        products={featuredProducts}
        loading={loading}
        onAction={() => navigate('/products?featured=true')}
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
