import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
import { Button } from '../ui/button';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/auth/signin');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product._id || product.id, 1);
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Add to cart error:', err);
      toast.error(`Failed to add to cart: ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  const imgPlaceholder = "https://placehold.co/600x400/f3f4f6/999999?text=Image+Unavailable";

  return (
    <div className="group bg-white rounded-3xl border border-neutral-100 p-3 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 overflow-hidden relative flex flex-col h-full">
      {/* Image Wrapper */}
      <div
        className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-bg-secondary cursor-pointer"
        onClick={() => navigate(`/products/${product._id || product.id}`)}
      >
        <img
          src={product.images?.[0] || product.image || imgPlaceholder}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ease-out ${(product.inventoryCount <= 0 || product.status === 'EXPIRED') ? 'grayscale opacity-60' : ''}`}
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {(product.status === 'NEW' || product.isFeatured) && (
            <span className="bg-primary text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
              {product.status === 'NEW' ? 'New Ritual' : 'Editor\'s Choice'}
            </span>
          )}
          {product.status === 'EXPIRED' ? (
            <span className="bg-neutral-900 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
              Sold Out
            </span>
          ) : product.inventoryCount <= 0 && (
            <span className="bg-neutral-400 text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
              Refilling
            </span>
          )}
        </div>

        <button
          className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-neutral-300 hover:text-primary transition-all shadow-sm opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart size={18} />
        </button>
      </div>

      {/* Info */}
      <div className="mt-5 px-1 pb-2 flex-grow flex flex-col">
        <div className='flex items-center justify-between mb-2'>
          <span className="text-[10px] font-bold text-accent-color uppercase tracking-[0.2em] font-body">
            {product.brand || 'Premium Quality'}
          </span>
          <div className="flex items-center gap-1">
            <Star size={10} className="fill-accent-color text-accent-color" />
            <span className="text-[10px] text-neutral-900 font-black">4.9</span>
          </div>
        </div>

        <h3
          className="text-base font-display font-black text-neutral-900 line-clamp-2 cursor-pointer hover:text-primary transition-colors tracking-tight leading-tight mb-2"
          onClick={() => navigate(`/products/${product._id || product.id}`)}
        >
          {product.name}
        </h3>

        <p className="text-xs text-neutral-400 font-medium line-clamp-1 mb-4">
          {product.subcategory || 'Beauty Ritual'}
        </p>

        <div className="flex items-center gap-2 mb-5">
          <span className="text-xl font-black text-neutral-900 tracking-tighter">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-xs text-neutral-300 line-through font-medium">₹{product.originalPrice.toLocaleString()}</span>
          )}
        </div>

        {/* Add to Cart Button - Matches Reference */}
        <Button
          onClick={handleAddCart}
          disabled={isAdding || product.inventoryCount <= 0}
          className={`w-full h-11 rounded-full font-bold text-[11px] uppercase tracking-widest transition-all ${product.inventoryCount <= 0
            ? 'bg-neutral-100 text-neutral-400'
            : 'bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 active:scale-95'
            }`}
        >
          {isAdding ? 'Preparing...' : product.inventoryCount <= 0 ? 'Out of Ritual' : 'Add to Bag'}
        </Button>
      </div>
    </div>
  );
}
