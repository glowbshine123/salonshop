import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import SectionHeader from './SectionHeader';
import HorizontalProductCard from '../product/HorizontalProductCard';

const FeaturedHorizontalSection = ({ products, loading, onAction }) => {
    if (loading && products.length === 0) {
        return (
            <section className="py-6 bg-neutral-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded mb-6" />
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="shrink-0 w-[300px] md:w-[350px] aspect-video bg-neutral-100 animate-pulse rounded-xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0 && !loading) return null;

    return (
        <section className="py-6 bg-neutral-50/50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    icon={Sparkles}
                    iconColor="text-primary"
                    label="Featured"
                    title="Featured Products"
                    actionText="View All"
                    onAction={onAction}
                />

                <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                    {products.slice(0, 4).map((product, index) => (
                        <HorizontalProductCard key={product._id} product={product} index={index} />
                    ))}
                    {products.length > 4 && (
                        <button
                            onClick={onAction}
                            className="shrink-0 w-12 h-12 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all duration-300"
                        >
                            <ArrowRight size={20} />
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FeaturedHorizontalSection;
