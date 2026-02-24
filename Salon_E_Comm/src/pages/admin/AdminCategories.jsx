import React, { useState, useEffect } from 'react';
import {
    Plus,
    Trash2,
    Layers,
    AlertCircle,
    Loader2,
    CheckCircle2,
    FolderOpen,
    ShieldCheck,
    Archive,
    Zap,
    TrendingUp
} from 'lucide-react';
import { categoryAPI } from '../../services/apiService';
import { toast } from 'react-hot-toast';
import AdminCardSkeleton from '../../components/common/AdminCardSkeleton';
import { cn } from '@/lib/utils';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCatName, setNewCatName] = useState('');
    const [parentCategory, setParentCategory] = useState('');
    const [adding, setAdding] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await categoryAPI.getAll({ status: 'all' });
            setCategories(res.data || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            toast.error('Classification registry sync failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        setAdding(true);
        try {
            await categoryAPI.create({
                name: newCatName,
                parent: parentCategory || null
            });
            setNewCatName('');
            setParentCategory('');
            toast.success('Asset classification committed');
            fetchCategories();
        } catch (err) {
            console.error('Failed to add category:', err);
            toast.error(err.response?.data?.message || 'Failed to commit category');
        } finally {
            setAdding(false);
        }
    };

    const handleStatusToggle = async (cat) => {
        const newStatus = cat.status === 'ACTIVE' ? 'DEACTIVE' : 'ACTIVE';
        try {
            await categoryAPI.update(cat._id, { status: newStatus });
            toast.success(`${cat.name} and its children are now ${newStatus}`);
            fetchCategories();
        } catch (err) {
            console.error('Failed to update status:', err);
            toast.error('Status sync failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Confirm permanent deletion of this classification tier? Assets may be affected.')) {
            try {
                await categoryAPI.delete(id);
                toast.success('Classification Tier purged');
                fetchCategories();
            } catch (err) {
                console.error('Delete failed:', err);
                toast.error(err.response?.data?.message || 'Failed to purge category');
            }
        }
    };


    const rootCategories = categories.filter(c => !c.parent);
    const getSubcategories = (parentId) => categories.filter(c => c.parent === parentId);

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">

            <div>
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter uppercase">Categories</h1>
                    <p className="text-sm font-medium text-neutral-500 mt-1">Manage your product categories and subcategories.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white rounded-xl flex items-center gap-3 border border-neutral-200 shadow-sm">
                        <TrendingUp size={14} className="text-emerald-600" />
                        <span className="text-xs font-bold text-neutral-700 uppercase tracking-widest leading-none">
                            {categories.length} Total Categories
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-[32px] border border-neutral-200 shadow-xl shadow-neutral-200/50 space-y-6 sticky top-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">Add Category</h3>
                                <p className="text-xs text-neutral-500">Create a new category or subcategory</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddCategory} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wide ml-1">Category Name</label>
                                <input
                                    type="text"
                                    value={newCatName}
                                    onChange={(e) => setNewCatName(e.target.value)}
                                    placeholder="e.g. Hair Care"
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wide ml-1">Parent Category</label>
                                <select
                                    value={parentCategory}
                                    onChange={(e) => setParentCategory(e.target.value)}
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-sm cursor-pointer"
                                >
                                    <option value="">None (Top Level Category)</option>
                                    {categories.filter(c => !c.parent).map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-neutral-400 font-medium px-1">
                                    Select a parent only if you are creating a subcategory (e.g., select 'Hair Care' if creating 'Shampoo'). Leave as "None" for main categories.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={adding || !newCatName.trim()}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 size={18} />}
                                Save Category
                            </button>
                        </form>
                    </div>
                </div>


                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <AdminCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[32px] border border-neutral-100 text-center">
                            <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300">
                                <FolderOpen size={32} />
                            </div>
                            <p className="text-neutral-500 font-medium">No categories found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {rootCategories.map((cat) => (
                                <div key={cat._id} className="bg-white rounded-[24px] border border-neutral-200 overflow-hidden shadow-sm">

                                    <div className="p-6 flex items-center justify-between group hover:bg-neutral-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                                <Layers size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-lg font-bold text-neutral-900">{cat.name}</h4>
                                                    <span className={cn(
                                                        "text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border",
                                                        cat.status === 'ACTIVE'
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                            : "bg-neutral-100 text-neutral-400 border-neutral-200"
                                                    )}>
                                                        {cat.status || 'ACTIVE'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-neutral-500 font-medium">{getSubcategories(cat._id).length} Subcategories</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleStatusToggle(cat)}
                                                className={cn(
                                                    "relative w-10 h-5 rounded-full transition-all duration-300 flex items-center px-1",
                                                    cat.status === 'ACTIVE' ? "bg-emerald-500" : "bg-neutral-200"
                                                )}
                                                title={cat.status === 'ACTIVE' ? "Deactivate" : "Activate"}
                                            >
                                                <div className={cn(
                                                    "w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300",
                                                    cat.status === 'ACTIVE' ? "translate-x-5" : "translate-x-0"
                                                )} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat._id)}
                                                className="p-2 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Delete Category"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>


                                    {getSubcategories(cat._id).length > 0 && (
                                        <div className="bg-neutral-50/50 border-t border-neutral-100 p-4 pl-[88px] grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {getSubcategories(cat._id).map(sub => (
                                                <div key={sub._id} className="flex items-center justify-between p-3 bg-white border border-neutral-100 rounded-xl group hover:border-emerald-200 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            sub.status === 'ACTIVE' ? "bg-emerald-400" : "bg-neutral-300"
                                                        )} />
                                                        <span className={cn(
                                                            "text-sm font-semibold transition-colors",
                                                            sub.status === 'ACTIVE' ? "text-neutral-700" : "text-neutral-400"
                                                        )}>{sub.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleStatusToggle(sub)}
                                                            className={cn(
                                                                "relative w-8 h-4 rounded-full transition-all duration-300 flex items-center px-0.5",
                                                                sub.status === 'ACTIVE' ? "bg-emerald-500" : "bg-neutral-200"
                                                            )}
                                                            title={sub.status === 'ACTIVE' ? "Deactivate" : "Activate"}
                                                        >
                                                            <div className={cn(
                                                                "w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all duration-300",
                                                                sub.status === 'ACTIVE' ? "translate-x-4" : "translate-x-0"
                                                            )} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(sub._id)}
                                                            className="text-neutral-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Delete Subcategory"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
