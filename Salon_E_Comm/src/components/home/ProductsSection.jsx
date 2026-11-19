import React from 'react';
import ProductCard from '../product/ProductCard';
import ProductCardSkeleton from '../product/ProductCardSkeleton';
import { Button } from '../ui/button';
import SectionHeader from './SectionHeader';

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
    <section className="py-6 relative">
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

export default ProductsSection;
