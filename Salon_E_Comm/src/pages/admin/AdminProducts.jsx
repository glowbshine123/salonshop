import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Package,
    AlertCircle,
    TrendingUp,
    Briefcase,
    IndianRupee,
    Loader2,
    ArrowUpRight,
    Trophy,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { cn } from '@/lib/utils';
import { productAPI, categoryAPI } from '../../services/apiService';
import { useLoading } from '../../context/LoadingContext';
import ProductModal from '../../components/admin/ProductModal';
import StatCard from '../../components/admin/StatCard';
import { toast } from 'react-hot-toast';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const { startLoading, finishLoading } = useLoading();

    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
                category: selectedCategory === 'All' ? undefined : selectedCategory,
                status: statusFilter,
                stockStatus: stockFilter,
                sort: sortOrder
            };

            const [prodRes, catRes] = await Promise.all([
                productAPI.getAll(params),
                categoryAPI.getAll()
            ]);

            // Safe access to data
            const productsList = prodRes?.data?.products || [];
            const count = prodRes?.data?.count || 0;
            const catsList = catRes?.data || [];

            setProducts(productsList);
            setTotalResults(count);
            setTotalPages(Math.ceil(count / 10) || 1);
            setCategories(catsList);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Inventory synchronization failed');
            setProducts([]); // Fallback to empty to prevent map crashes
        } finally {
            setLoading(false);
            finishLoading();
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchTerm, selectedCategory, statusFilter, stockFilter, sortOrder]);

    // Reset to page 1 when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, statusFilter, stockFilter, sortOrder]);

    const handleStatusUpdate = async (productId, newStatus) => {
        if (!productId) return;
        try {
            setUpdatingStatusId(productId);
            await productAPI.update(productId, { status: newStatus });
            toast.success(`Product status updated to ${newStatus}`);
            // Update local state
            setProducts(prev => prev.map(p => p._id === productId ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error('Failed to update product status:', err);
            toast.error('Status sync failed');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleAdd = () => {
        setCurrentProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productAPI.delete(id);
                toast.success('Product deleted successfully');
                fetchData();
            } catch (err) {
                toast.error('Failed to delete asset');
            }
        }
    };

    // Safe stats calculation
    const currentProducts = Array.isArray(products) ? products : [];
    const stats = {
        totalAssets: totalResults,
        lowStock: currentProducts.filter(p => (p.inventoryCount || 0) < 10).length,
        totalValue: currentProducts.reduce((sum, p) => sum + ((p.price || 0) * (p.inventoryCount || 0)), 0)
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Products</h1>
                    <p className="text-sm font-medium text-neutral-500 mt-1">Manage your product inventory</p>
                </div>
                <Button onClick={handleAdd}>
                    <Plus size={18} />
                    Add New Product
                </Button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title="Total Value"
                    value={`₹${stats.totalValue.toLocaleString()}`}
                    icon={IndianRupee}
                    color="emerald"
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalAssets}
                    icon={Package}
                    color="neutral"
                />
                <StatCard
                    title="Low Stock"
                    value={stats.lowStock}
                    icon={AlertCircle}
                    color={stats.lowStock > 0 ? 'rose' : 'emerald'}
                    trend={stats.lowStock > 0 ? 'down' : 'up'}
                />
            </div>


            {/* Consolidated Product Database Header */}
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-neutral-50 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-neutral-50/20">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Inventory Assets</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative group min-w-[200px] flex-1 sm:flex-none">
                            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 h-9 bg-white border border-neutral-200 rounded-lg text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm focus:border-emerald-500 transition-all placeholder:text-neutral-300"
                            />
                        </div>

                        {/* Category Filter */}
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-[140px] h-9 bg-white border-neutral-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                                <SelectValue placeholder="CATEGORY" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
                                <SelectItem value="All" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">ALL CATS</SelectItem>
                                {Array.isArray(categories) && categories.map(cat => (
                                    <SelectItem key={cat._id} value={cat.name} className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">
                                        {cat.name.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[110px] h-9 bg-white border-neutral-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                                <SelectValue placeholder="STATUS" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
                                <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">ALL STATUS</SelectItem>
                                <SelectItem value="ACTIVE" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">ACTIVE</SelectItem>
                                <SelectItem value="DEACTIVE" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">DEACTIVE</SelectItem>
                                <SelectItem value="EXPIRED" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">EXPIRED</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Stock Filter */}
                        <Select value={stockFilter} onValueChange={setStockFilter}>
                            <SelectTrigger className="w-[130px] h-9 bg-white border-neutral-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                                <SelectValue placeholder="Stock" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
                                <SelectItem value="all" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">ALL STOCK</SelectItem>
                                <SelectItem value="low_stock" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-amber-600">LOW STOCK</SelectItem>
                                <SelectItem value="out_of_stock" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-red-600">OUT OF STOCK</SelectItem>
                                <SelectItem value="close_to_expiry" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-orange-600">EXPIRING SOON</SelectItem>
                                <SelectItem value="expired" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-red-800">EXPIRED</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort Order */}
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="w-[140px] h-9 bg-white border-neutral-200 rounded-lg text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={12} className="text-neutral-400" />
                                    <SelectValue placeholder="SORT" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
                                <SelectItem value="newest" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">NEWEST FIRST</SelectItem>
                                <SelectItem value="price_asc" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">PRICE: LOW-HIGH</SelectItem>
                                <SelectItem value="price_desc" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">PRICE: HIGH-LOW</SelectItem>
                                <SelectItem value="name_asc" className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">NAME: A-Z</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neutral-50/30">
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Product</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Weight</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Expiry</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">stock</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">price</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-50 text-right">actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="7" className="px-6 py-4"><Skeleton className="h-12 w-full rounded-xl" /></td>
                                    </tr>
                                ))
                            ) : currentProducts.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-24 text-center">
                                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <ShieldCheck size={32} className="text-neutral-200" />
                                        </div>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No assets matching parameters.</p>
                                    </td>
                                </tr>
                            ) : (
                                currentProducts.map((p) => (
                                    <tr key={p._id || Math.random()} className="hover:bg-neutral-50/30 transition-all duration-200 group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                                                    {p.images?.[0] ? (
                                                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-6 h-6 text-neutral-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-neutral-900 leading-tight truncate max-w-[200px] uppercase tracking-tight">{p.name}</span>
                                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                                                        {p.hsnCode ? `HSN: ${p.hsnCode}` : `SKU: ${p.sku || p._id?.slice(-6).toUpperCase()}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider">
                                                {p.weight || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-[11px] font-bold uppercase tracking-wider",
                                                    p.expiryDate && new Date(p.expiryDate) < new Date() ? "text-rose-600" : "text-neutral-600"
                                                )}>
                                                    {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
                                                </span>
                                                {p.expiryDate && new Date(p.expiryDate) < new Date() && (
                                                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Expired</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100/50 w-fit">
                                                    {p.category || 'GENERAL'}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-sm font-black tracking-tighter",
                                                        (p.inventoryCount || 0) < 10 ? "text-rose-600" : "text-neutral-900"
                                                    )}>
                                                        {p.inventoryCount || 0} in stock
                                                    </span>
                                                    {(p.inventoryCount || 0) < 10 && (
                                                        <AlertCircle size={10} className="text-rose-500 animate-pulse" />
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1 text-neutral-900">
                                                    <IndianRupee size={12} className="text-neutral-400" />
                                                    <span className="text-base font-black tracking-tighter">{(p.price || 0).toLocaleString()}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Asset Valuation</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Select
                                                disabled={updatingStatusId === p._id}
                                                value={p.status || 'ACTIVE'}
                                                onValueChange={(val) => handleStatusUpdate(p._id, val)}
                                            >
                                                <SelectTrigger className={cn(
                                                    "w-28 h-8 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ring-1 ring-inset",
                                                    (p.status || 'ACTIVE') === 'ACTIVE'
                                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                                                        : (p.status === 'EXPIRED' ? "bg-amber-50 text-amber-700 ring-amber-600/20" : "bg-rose-50 text-rose-700 ring-rose-600/20")
                                                )}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white border-neutral-100 rounded-xl shadow-xl">
                                                    <SelectItem value="ACTIVE" className="text-[9px] font-black uppercase tracking-widest cursor-pointer">ACTIVE</SelectItem>
                                                    <SelectItem value="DEACTIVE" className="text-[9px] font-black uppercase tracking-widest cursor-pointer">DEACTIVE</SelectItem>
                                                    <SelectItem value="EXPIRED" className="text-[9px] font-black uppercase tracking-widest cursor-pointer">EXPIRED</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(p)}
                                                    className="p-2.5 bg-neutral-50 hover:bg-white border border-neutral-100 hover:border-neutral-200 text-neutral-400 hover:text-neutral-900 rounded-lg transition-all active:scale-95 group"
                                                >
                                                    <Edit size={14} className="group-hover:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="p-2.5 bg-neutral-50 hover:bg-rose-50 border border-neutral-100 hover:border-rose-200 text-neutral-400 hover:text-rose-600 rounded-lg transition-all active:scale-95 group"
                                                >
                                                    <Trash2 size={14} className="group-hover:rotate-12 transition-transform" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-neutral-50 flex items-center justify-between bg-neutral-50/10">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                            Page {currentPage} of {totalPages} — {totalResults} Assets Recorded
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 bg-white border border-neutral-100 rounded-lg text-neutral-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:hover:text-neutral-400 disabled:hover:border-neutral-100 transition-all active:scale-95"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={cn(
                                            "w-8 h-8 rounded-lg text-[10px] font-black transition-all active:scale-95",
                                            currentPage === i + 1
                                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                                                : "bg-white border border-neutral-100 text-neutral-400 hover:border-emerald-200 hover:text-emerald-600"
                                        )}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 bg-white border border-neutral-100 rounded-lg text-neutral-400 hover:text-emerald-600 hover:border-emerald-200 disabled:opacity-30 disabled:hover:text-neutral-400 disabled:hover:border-neutral-100 transition-all active:scale-95"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>


            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={currentProduct}
                categories={categories}
                onSuccess={fetchData}
            />
        </div>
    );
}
