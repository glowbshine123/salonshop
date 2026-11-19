import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import SectionHeader from './SectionHeader';

const CategoriesSection = ({ categories, loading, onAction }) => {
    const navigate = useNavigate();

    if (loading && categories.length === 0) {
        return (
            <section className="py-6 border-b border-neutral-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8 md:mb-12">
                        <div className="space-y-3">
                            <div className="h-4 w-32 bg-neutral-100 animate-pulse rounded-full" />
                            <div className="h-10 w-64 bg-neutral-100 animate-pulse rounded-lg" />
                        </div>
                        <div className="h-10 w-24 bg-neutral-100 animate-pulse rounded-lg hidden md:block" />
                    </div>
                    <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="shrink-0 w-[140px] md:w-[180px] aspect-square bg-neutral-50 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0 && !loading) return null;

    return (
        <section className="py-6 border-b border-neutral-100 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SectionHeader
                    icon={Sparkles}
                    iconColor="text-emerald-500"
                    label="Professional Grade"
                    title="Shop by Category"
                    actionText="View All"
                    onAction={onAction}
                />

                <div className="flex items-start gap-2 md:gap-6 overflow-x-auto scrollbar-hide">
                    {categories.map((cat, i) => (
                        <button
                            key={i}
                            onClick={() => cat.onSelect()}
                            className="shrink-0 w-[100px] md:w-[120px] group"
                        >
                            <div className="relative aspect-square rounded-md md:rounded-lg overflow-hidden mb-1 bg-neutral-50 border border-neutral-100 group-hover:border-primary/20 transition-all duration-300">
                                <img
                                    src={cat.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=60'}
                                    alt={cat.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform duration-300">Explore</span>
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-neutral-900 group-hover:text-primary transition-colors text-center capitalize tracking-tight px-1 line-clamp-2">{cat.name}</h3>
                        </button>
                    ))}
                    <div
                        className="shrink-0 w-[100px] md:w-[120px] group"
                    >
                        <div className="relative aspect-square flex items-center justify-center">
                            <button
                                onClick={() => navigate(`/products`)}
                                className="shrink-0 w-12 h-12 rounded-full bg-white border border-neutral-100 flex items-center justify-center text-primary shadow-sm hover:bg-primary hover:text-white transition-all duration-300"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategoriesSection;
