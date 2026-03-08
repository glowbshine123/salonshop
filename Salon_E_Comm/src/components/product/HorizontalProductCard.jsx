import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';

const HorizontalProductCard = ({ product, index }) => {
    const navigate = useNavigate();
    const bgImage = `/bg/b${(index % 2) + 1}.png`;
    const discount = product.basePrice > product.price
        ? Math.round(((product.basePrice - product.price) / product.basePrice) * 100)
        : 0;

    return (
        <div
            onClick={() => navigate(`/products/${product._id}`)}
            style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            className="relative shrink-0 w-[300px] md:w-[350px] rounded-md border border-neutral-100 overflow-hidden flex cursor-pointer transition-shadow duration-300 group shadow-md mb-2"
        >
            {/* Background Overlay for better text readability */}
            <div className="absolute inset-0 bg-white/40 group-hover:bg-white/20 transition-colors duration-300 -z-10" />
            <div className="w-1/3 aspect-square relative overflow-hidden bg-neutral-50">
                <img
                    src={product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=60'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {discount}% OFF
                    </div>
                )}
            </div>
            <div className="w-2/3 p-2 px-3 flex flex-col justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-foreground-muted border border-neutral-100 w-fit rounded uppercase tracking-wider">
                        {product.category?.name || product.category || 'Professional'}
                    </p>
                    <h3 className="text-lg leading-tight font-bold text-neutral-900 line-clamp-2 min-h-[44px]">
                        {product.name}
                    </h3>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-primary">₹{product.price}</span>
                        {product.originalPrice > product.price && (
                            <span className="text-sm text-neutral-400 line-through font-medium">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                    </div>
                    <Button size="sm" className="h-8 px-3 text-[10px] font-bold">Add</Button>
                </div>
            </div>
        </div>
    );
};

export default HorizontalProductCard;
