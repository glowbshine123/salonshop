import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useLoading } from '../context/LoadingContext';
import { productAPI, categoryAPI } from '../utils/apiClient';
import ProductCard from '../components/common/ProductCard';
import { Search, Filter, X, ChevronDown, SlidersHorizontal, ChevronRight } from 'lucide-react';
import ProductCardSkeleton from '../components/common/ProductCardSkeleton';
import { Button } from "../components/ui/button";

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
                className="w-full h-10 px-4 bg-white border-0 rounded-xl text-[13px] font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-300"
            />
            <span className="text-neutral-300">/</span>
            <input
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="w-full h-10 px-4 bg-white border-0 rounded-xl text-[13px] font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-neutral-300"
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
            <div className="space-y-10">
                <div>
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">By Category</h3>
                    <div className="space-y-2">
                        <div
                            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${!currentCategory || currentCategory === 'all' ? 'bg-primary-light text-primary font-black shadow-sm' : 'hover:bg-bg-secondary text-neutral-500'}`}
                            onClick={() => {
                                updateFilters({ category: '', subcategory: '' });
                            }}
                        >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${!currentCategory ? 'border-primary' : 'border-neutral-200'}`}>
                                {!currentCategory && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                            <span className="text-sm">All Rituals</span>
                        </div>

                        {categories.filter(c => !c.parent).map((parent) => {
                            const isActiveParent = currentCategory === parent.name;
                            const children = categories.filter(c => c.parent === parent._id);
                            const isExpanded = expandedParents.includes(parent._id);

                            return (
                                <div key={parent._id} className="space-y-1">
                                    <div
                                        className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${isActiveParent ? 'bg-primary-light text-primary font-black shadow-sm' : 'hover:bg-bg-secondary text-neutral-500'}`}
                                        onClick={() => toggleParent(parent._id)}
                                    >
                                        <div className="flex items-center gap-3" onClick={(e) => {
                                            e.stopPropagation();
                                            updateFilters({ category: parent.name, subcategory: '' });
                                        }}>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isActiveParent && !currentSubcategory ? 'border-primary' : 'border-neutral-200'}`}>
                                                {isActiveParent && !currentSubcategory && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                            <span className="text-sm capitalize">{parent.name}</span>
                                        </div>
                                        {children.length > 0 && (
                                            <ChevronDown size={14} className={`text-neutral-300 transition-transform ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                                        )}
                                    </div>

                                    {isExpanded && children.length > 0 && (
                                        <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                            {children.map(child => {
                                                const isActiveChild = currentSubcategory === child.name;
                                                return (
                                                    <div
                                                        key={child._id}
                                                        className={`py-2.5 px-3 rounded-xl text-[13px] cursor-pointer transition-all capitalize ${isActiveChild ? 'text-primary font-black bg-white shadow-sm ring-1 ring-primary/5' : 'text-neutral-400 hover:text-primary hover:bg-neutral-50'}`}
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
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">Price Point</h3>
                    <div className="p-1.5 bg-bg-secondary rounded-2xl border border-primary/5">
                        <PriceRangeFilter min={minPrice} max={maxPrice} onChange={updateFilters} />
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-6">Sort Collection</h3>
                    <div className="relative group">
                        <select
                            value={currentSort}
                            onChange={(e) => updateFilters('sort', e.target.value)}
                            className="w-full h-12 px-4 bg-bg-secondary border border-primary/5 rounded-2xl text-[13px] font-bold text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 appearance-none cursor-pointer"
                        >
                            <option value="newest">Newest Rituals</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name_asc">Alphabetical</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none" />
                    </div>
                </div>

                <div className="pt-6 border-t border-primary/5">
                    <Button
                        onClick={clearFilters}
                        variant="ghost"
                        className="w-full text-[10px] font-bold text-neutral-400 hover:text-primary uppercase tracking-widest hover:bg-primary-light rounded-2xl h-12"
                    >
                        Reset All Filters
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Breadcrumbs - Premium */}
            <div className="bg-bg-secondary/50 border-b border-primary/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        <Link to="/" className="hover:text-primary transition-colors">House</Link>
                        <ChevronRight size={12} />
                        <span className="text-neutral-900">Collections</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary mb-2">
                            <div className="p-2 bg-primary-light rounded-lg">
                                <Search size={16} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-body text-neutral-400">Search Products</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-display font-black text-neutral-900 tracking-tighter">
                            The Collections.
                        </h1>
                        <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">
                            Showing {products.length} of {total} House Rituals
                            {currentSearch && <span> for "<span className="text-primary">{currentSearch}</span>"</span>}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="flex items-center relative w-full md:w-80 group">
                            <Search className="absolute left-4 text-neutral-300 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Find a ritual..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && updateFilters('search', searchTerm)}
                                className="w-full h-12 pl-12 pr-4 bg-bg-secondary border border-primary/5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/30 transition-all text-sm font-medium placeholder:text-neutral-300"
                            />
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-3.5 bg-bg-secondary border border-primary/5 rounded-full text-neutral-500 hover:text-primary transition-all hover:shadow-lg active:scale-95"
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    {/* Filters Sidebar */}
                    <div className={`lg:col-span-3 ${showFilters ? 'fixed inset-0 z-[60] bg-white p-8 overflow-y-auto animate-in slide-in-from-bottom duration-300' : 'hidden lg:block'} space-y-10`}>
                        <div className="flex items-center justify-between lg:hidden mb-10">
                            <h3 className="text-2xl font-display font-black text-neutral-900">Filters</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 bg-bg-secondary rounded-full text-neutral-400">
                                <X size={20} />
                            </button>
                        </div>
                        <FilterSection />
                    </div>
                    {/* Product Grid */}
                    <div className="col-span-1 lg:col-span-9">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-20 bg-white rounded-[24px] border border-neutral-100">
                                <p className="text-red-500 font-bold mb-4">{error}</p>
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
                                    <div className="flex justify-center mt-12 gap-2">
                                        <Button
                                            variant="outline"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                            className="border-neutral-200 hover:bg-emerald-50 hover:border-emerald-200"
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center px-4 font-bold text-neutral-900 bg-white border border-neutral-200 rounded-lg">
                                            Page {page} of {Math.ceil(total / limit)}
                                        </div>
                                        <Button
                                            variant="outline"
                                            disabled={page * limit >= total}
                                            onClick={() => setPage(page + 1)}
                                            className="border-neutral-200 hover:bg-emerald-50 hover:border-emerald-200"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-32 bg-white rounded-[24px] border border-neutral-100">
                                <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search size={24} className="text-neutral-400" />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900 mb-2">No Products Found</h3>
                                <p className="text-neutral-500 max-w-xs mx-auto mb-6">Try adjusting your filters or search query.</p>
                                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
