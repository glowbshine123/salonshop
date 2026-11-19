import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart, Eye, Heart, Star } from 'lucide-react';
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

  const imgPlaceholder = "/bg/b1.png";

  return (
    <div className="group bg-white rounded-md shadow-md border border-neutral-100 overflow-hidden relative">
      {/* Image Wrapper */}
      <div
        className="relative aspect-square overflow-hidden bg-primary-muted cursor-pointer"
        onClick={() => navigate(`/products/${product._id || product.id}`)}
      >
        <img
          src={product.images?.[0] || product.image || imgPlaceholder}
          alt={product.name}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out`}
        />

        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.status === 'NEW' && (
            <span className="bg-success text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
              NEW
            </span>
          )}
          {/* {product.status === 'EXPIRED' ? (
            <span className="bg-destructive text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
              EXPIRED
            </span>
          ) : product.inventoryCount <= 0 && (
            <span className="bg-destructive-foreground text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
              OUT OF STOCK
            </span>
          )} */}
        </div>

        {/* <button
          className="hidden group-hover:block absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full text-neutral-400 hover:text-red-500 transition-colors shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart size={18} />
        </button> */}
      </div>

      {/* Info */}
      <div className="px-2 md:px-3 py-1">


        <div className='flex items-center justify-between'>
          <div className="flex items-center justify-between text-xs font-semibold text-foreground-muted tracking-wide">
            {product.brand}
          </div>
          {/* <div className="flex items-center gap-1 text-amber-500">
            <Star size={10} fill="currentColor" />
            <span className="text-neutral-900 font-semibold">4.8</span>
          </div> */}
        </div>

        <h3
          className="text-sm md:text-base font-bold text-foreground line-clamp-2 cursor-pointer tracking-wide"
          onClick={() => navigate(`/products/${product._id || product.id}`)}
        >
          {product.name}
        </h3>

        <div className="flex items-center justify-between text-xs font-semibold text-foreground-muted tracking-wide">
          <span>{product.subcategory}</span>
          {product.weight && (
            <span className="text-[10px] font-bold text-success-foreground bg-success-bg px-2 py-0.5 rounded-full uppercase tracking-wider">
              {product.weight}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between py-2">
          <div className="flex items-center gap-2">
            <span className="text-base md:text-xl font-bold text-primary tracking-tight">₹ {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-[10px] md:text-xs text-foreground-muted line-through">₹{product.originalPrice.toLocaleString()}</span>
            )}
            {discount > 0 && (
              <span className="text-foreground text-xs font-bold">
                {discount}% Off
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
