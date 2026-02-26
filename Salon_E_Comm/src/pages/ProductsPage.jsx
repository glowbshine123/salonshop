import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { useLoading } from '../context/LoadingContext';
import { productAPI, categoryAPI } from '../utils/apiClient';
import ProductCard from '../components/common/ProductCard';
import { Search, Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
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
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
            />
            <span className="text-neutral-400">-</span>
            <input
                type="number"
                placeholder="Max"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
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
                    <h3 className="font-bold text-neutral-900 mb-4">Categories</h3>
                    <div className="space-y-2">
                        <div
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${!currentCategory || currentCategory === 'all' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-neutral-50 text-neutral-600'}`}
                            onClick={() => {
                                updateFilters({ category: '', subcategory: '' });
                            }}
                        >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!currentCategory ? 'border-emerald-600' : 'border-neutral-300'}`}>
                                {!currentCategory && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
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
                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isActiveParent ? 'bg-emerald-50 text-emerald-700 font-medium' : 'hover:bg-neutral-50 text-neutral-600'}`}
                                        onClick={() => toggleParent(parent._id)}
                                    >
                                        <div className="flex items-center gap-2" onClick={(e) => {
                                            e.stopPropagation();
                                            updateFilters({ category: parent.name, subcategory: '' });
                                        }}>
                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isActiveParent && !currentSubcategory ? 'border-emerald-600' : 'border-neutral-300'}`}>
                                                {isActiveParent && !currentSubcategory && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
                                            </div>
                                            <span className="text-sm capitalize">{parent.name}</span>
                                        </div>
                                        {children.length > 0 && (
                                            <ChevronDown size={16} className={`text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        )}
                                    </div>

                                    {isExpanded && children.length > 0 && (
                                        <div className="pl-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                            {children.map(child => {
                                                const isActiveChild = currentSubcategory === child.name;
                                                return (
                                                    <div
                                                        key={child._id}
                                                        className={`p-2 rounded-lg text-sm cursor-pointer transition-colors capitalize ${isActiveChild ? 'text-emerald-600 font-medium bg-emerald-50/50' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
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
                    <h3 className="font-bold text-neutral-900 mb-4">Price Range</h3>
                    <PriceRangeFilter min={minPrice} max={maxPrice} onChange={updateFilters} />
                </div>

                <div>
                    <h3 className="font-bold text-neutral-900 mb-4">Sort By</h3>
                    <select
                        value={currentSort}
                        onChange={(e) => updateFilters('sort', e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                        <option value="newest">Newest Arrivals</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="name_asc">Name: A to Z</option>
                    </select>
                </div>

                {/* Clear Filters */}
                <Button onClick={clearFilters} variant="outline" className="w-full border-neutral-200 hover:bg-neutral-50 hover:text-red-500">
                    Clear All Filters
                </Button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-20 pt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-start justify-between w-full md:w-auto">
                        <div>
                            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Product Inventory</h1>
                            <p className="text-neutral-500 text-sm mt-1">
                                Showing {products.length} of {total} results
                                {currentSearch && <span> for "<span className="text-emerald-600 font-bold">{currentSearch}</span>"</span>}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden p-2 bg-neutral-100 rounded-xl text-neutral-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        >
                            <Filter size={20} />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="flex items-center relative max-w-md w-full">
                        <Search className="absolute left-2 text-neutral-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search within results..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && updateFilters('search', searchTerm)}
                            className="w-full pl-8 pr-2 py-2 bg-white rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm font-semibold shadow-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                    <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'} space-y-6 bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm lg:shadow-none lg:border-none lg:bg-transparent lg:p-0`}>
                        <div className="flex items-center justify-between lg:hidden mb-4">
                            <h3 className="text-lg font-black text-neutral-900">Filters</h3>
                            <button onClick={() => setShowFilters(false)} className="text-neutral-400 hover:text-neutral-900">
                                <X size={20} />
                            </button>
                        </div>
                        <FilterSection />
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
