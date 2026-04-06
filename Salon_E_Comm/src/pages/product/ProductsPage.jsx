import React, { useState, useEffect } from 'react';
import SEO from '../../components/common/SEO';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useLoading } from '../../context/LoadingContext';
import { productAPI, categoryAPI } from '../../utils/apiClient';
import ProductCard from '../../components/product/ProductCard';
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';
import { Button } from "../../components/ui/button";

const PriceRangeFilter = ({ min, max, onChange }) => {
    const [localMin, setLocalMin] = useState(min);
    const [localMax, setLocalMax] = useState(max);

    useEffect(() => {
        setLocalMin(min);
    }, [min]);

    useEffect(() => {
        setLocalMax(max);
    }, [max]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (localMin !== min) onChange('minPrice', localMin);
            if (localMax !== max) onChange('maxPrice', localMax);
        }, 1000);

        return () => clearTimeout(handler);
    }, [localMin, localMax, min, max, onChange]);

    return (
        <div className="flex items-center gap-2">
            <input
                type="number"
                placeholder="Min"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
            />
            <span className="text-muted-foreground font-medium">-</span>
            <input
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-all"
            />
        </div>
    );
};

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const currentSearch = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(currentSearch);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setSearchTerm(currentSearch);
    }, [currentSearch]);

    const [products, setProducts] = useState([]);
    const { startLoading, finishLoading } = useLoading();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    const currentCategory = searchParams.get('category') || '';
    const currentSubcategory = searchParams.get('subcategory') || '';
    const currentSort = searchParams.get('sort') || 'newest';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
        window.scrollTo(0, 0);
    }, [searchParams, page]);

    const fetchCategories = async () => {
        try {
            const res = await categoryAPI.getAll();
            setCategories(res || []);
        } catch (err) {
            console.error('Failed to fetch categories', err);
            setCategories([]);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page,
                limit,
                search: currentSearch,
                category: currentCategory === 'all' ? '' : currentCategory,
                sort: currentSort,
                status: 'ACTIVE',
                subcategory: currentSubcategory
            };
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;

            const res = await productAPI.getAll(params);
            setProducts(res.products || []);
            setTotal(res.count || 0);
        } catch (err) {
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
            finishLoading();
        }
    };

    const updateFilters = (keyOrUpdates, value) => {
        const newParams = new URLSearchParams(searchParams);

        if (typeof keyOrUpdates === 'object') {
            Object.entries(keyOrUpdates).forEach(([k, v]) => {
                if (v) newParams.set(k, v);
                else newParams.delete(k);
            });
        } else {
            if (value) {
                newParams.set(keyOrUpdates, value);
            } else {
                newParams.delete(keyOrUpdates);
            }
        }

        newParams.set('page', 1); // Reset to page 1 on filter change
        setPage(1);
        setSearchParams(newParams);
    };

    const clearFilters = () => {
        setSearchParams({});
        setPage(1);
    };

    const FilterSection = () => {
        const [expandedParents, setExpandedParents] = useState([]);

        useEffect(() => {
            if (currentCategory && categories.length > 0) {
                const parent = categories.find(c => c.name === currentCategory && !c.parent);
                if (parent && !expandedParents.includes(parent._id)) {
                    setExpandedParents(prev => [...prev, parent._id]);
                }
            }
        }, [currentCategory, categories]);

        const toggleParent = (id) => {
            setExpandedParents(prev =>
                prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
            );
        };

        return (
            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-foreground mb-4">Categories</h3>
                    <div className="space-y-2">
                        <div
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${!currentCategory || currentCategory === 'all' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-muted-foreground'}`}
                            onClick={() => {
                                updateFilters({ category: '', subcategory: '' });
                            }}
                        >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!currentCategory ? 'border-primary' : 'border-border'}`}>
                                {!currentCategory && <div className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <span className="text-sm">All Products</span>
                        </div>

                        {categories.filter(c => !c.parent).map((parent) => {
                            const isActiveParent = currentCategory === parent.name;
                            const children = categories.filter(c => c.parent === parent._id);
                            const isExpanded = expandedParents.includes(parent._id);
                            const hasActiveChild = children.some(child => currentSubcategory === child.name);

                            return (
                                <div key={parent._id} className="space-y-1">
                                    <div
                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isActiveParent ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted text-muted-foreground'}`}
                                        onClick={() => toggleParent(parent._id)}
                                    >
                                        <div className="flex items-center gap-2" onClick={(e) => {
                                            e.stopPropagation();
                                            updateFilters({ category: parent.name, subcategory: '' });
                                        }}>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isActiveParent && !currentSubcategory ? 'border-primary' : 'border-border'}`}>
                                                {isActiveParent && !currentSubcategory && <div className="w-2 h-2 rounded-full bg-primary" />}
                                            </div>
                                            <span className="text-sm capitalize">{parent.name}</span>
                                        </div>
                                        {children.length > 0 && (
                                            <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>

                                    {isExpanded && children.length > 0 && (
                                        <div className="pl-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                            {children.map(child => {
                                                const isActiveChild = currentSubcategory === child.name;
                                                return (
                                                    <div
                                                        key={child._id}
                                                        className={`p-2 rounded-lg text-sm cursor-pointer transition-colors capitalize ${isActiveChild ? 'text-primary font-bold bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                                        onClick={() => {
                                                            updateFilters({ category: parent.name, subcategory: child.name });
                                                        }}
                                                    >
                                                        {child.name}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-foreground mb-4">Price Range</h3>
                    <PriceRangeFilter min={minPrice} max={maxPrice} onChange={updateFilters} />
                </div>

                <div>
                    <h3 className="font-bold text-foreground mb-4">Sort By</h3>
                    <select
                        value={currentSort}
                        onChange={(e) => updateFilters('sort', e.target.value)}
                        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:border-primary cursor-pointer transition-all"
                    >
                        <option value="newest">Newest Arrivals</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A to Z</option>
                    </select>
                </div>

                {/* Clear Filters */}
                <Button onClick={clearFilters} variant="outline" className="w-full border-border hover:bg-muted hover:text-destructive">
                    Clear All Filters
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white pb-20 pt-4">
            <SEO
                title={currentCategory ? `${currentSearch ? `Search for "${currentSearch}" in ` : ''}${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}` : 'All Products'}
                description={`Browse our extensive collection of ${currentCategory || 'salon'} products. Find the best tools and supplies for your salon.`}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Mobile/Compact Layout: Search -> Filters/Sort */}
                <div className="flex flex-col gap-4 mb-6">
                    {/* Search Bar - Top priority on all screens */}
                    <div className="flex items-center relative w-full md:hidden ">
                        <Search className="absolute left-3 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateFilters('search', searchTerm)}
                            className="w-full pl-10 pr-4 py-1.5 bg-input border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base font-medium shadow-sm"
                        />
                    </div>

                    {/* Mobile Controls Row: Filter Toggle & Sort Dropdown */}
                    <div className="flex lg:hidden items-center gap-2 w-fit">
                        <button
                            onClick={() => setShowFilters(true)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 bg-background border border-border rounded-md text-foreground font-semibold text-sm hover:bg-muted/50 transition-colors shadow-sm w-fit"
                        >
                            <SlidersHorizontal size={18} className="text-primary" />
                            Filters
                        </button>
                        {/* <div className="flex-1 relative">
                            <select
                                value={currentSort}
                                onChange={(e) => updateFilters('sort', e.target.value)}
                                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-background border border-border rounded-xl text-foreground font-semibold text-sm focus:outline-none shadow-sm"
                            >
                                <option value="newest">Newest</option>
                                <option value="price_asc">Price: Low</option>
                                <option value="price_desc">Price: High</option>
                                <option value="name_asc">Name: A-Z</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div> */}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                    {/* Filter Sidebar (Desktop) / Modal (Mobile) */}
                    <div className={`
                        fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto
                        ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                        transition-transform duration-300 ease-in-out
                        lg:block lg:col-span-1
                    `}>
                        {/* Overlay for Mobile */}
                        <div
                            className={`absolute inset-0 bg-black/40 lg:hidden ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity`}
                            onClick={() => setShowFilters(false)}
                        />

                        <div className="relative h-full lg:h-auto bg-background lg:bg-transparent w-4/5 max-w-sm lg:w-full p-6 lg:p-0 overflow-y-auto space-y-6">
                            <div className="flex items-center justify-between lg:hidden pb-4 border-b border-border mb-4">
                                <h3 className="text-xl font-bold text-foreground">Filters</h3>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X size={24} className="text-muted-foreground" />
                                </button>
                            </div>
                            <FilterSection />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="col-span-1 lg:col-span-3">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-background rounded-3xl border border-border">
                                <p className="text-destructive font-bold mb-4">{error}</p>
                                <Button onClick={fetchProducts} variant="outline">Try Again</Button>
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                                    {products.map((product) => (
                                        <ProductCard key={product._id || product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {total > limit && (
                                    <div className="flex justify-center mt-12 gap-2 pb-10">
                                        <Button
                                            variant="outline"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                            className="border-border hover:bg-primary/5 hover:border-primary/20 text-foreground"
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center px-4 font-bold text-foreground bg-background border border-border rounded-xl">
                                            Page {page} of {Math.ceil(total / limit)}
                                        </div>
                                        <Button
                                            variant="outline"
                                            disabled={page * limit >= total}
                                            onClick={() => setPage(page + 1)}
                                            className="border-border hover:bg-primary/5 hover:border-primary/20 text-foreground"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-32 bg-background rounded-3xl border border-border">
                                <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search size={32} className="text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">No Products Found</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto mb-8">Try adjusting your filters or search query.</p>
                                <Button
                                    onClick={clearFilters}
                                    className="rounded-xl px-8 py-6 font-bold"
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
