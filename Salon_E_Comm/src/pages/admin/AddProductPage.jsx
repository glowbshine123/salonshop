import React, { useState, useEffect } from 'react';
import {
    X,
    Upload,
    Package,
    AlertCircle,
    CheckCircle2,
    Loader2,
    IndianRupee,
    Plus,
    Trash2,
    AlignLeft,
    Table as TableIcon,
    ChevronUp,
    ChevronDown,
    ArrowLeft,
    Image as ImageIcon
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI } from '../../services/apiService';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function AddProductPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const productId = searchParams.get('id');
    const isEdit = !!productId;

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        subcategory: '',
        brand: '',
        originalPrice: '',
        price: '',
        inventoryCount: '',
        description: '',
        status: 'ACTIVE',
        featured: false,
        returnable: true,
        hsnCode: '',
        expiryDate: '',
        weight: '',
        contentSections: []
    });
    const [categories, setCategories] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [keptExistingImages, setKeptExistingImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const init = async () => {
            try {
                // Fetch categories first
                const catRes = await categoryAPI.getAll();
                const fetchedCats = catRes.data || [];
                setCategories(fetchedCats);

                // If editing, fetch product data
                if (productId) {
                    const prodRes = await productAPI.getById(productId);
                    const product = prodRes.data;
                    if (product) {
                        setFormData({
                            name: product.name || '',
                            sku: product.sku || '',
                            category: product.category || '',
                            subcategory: product.subcategory || '',
                            brand: product.brand || '',
                            price: product.price || '',
                            originalPrice: product.originalPrice || '',
                            inventoryCount: product.inventoryCount || '',
                            description: product.description || '',
                            status: product.status || 'ACTIVE',
                            featured: product.featured || false,
                            returnable: product.returnable !== undefined ? product.returnable : true,
                            hsnCode: product.hsnCode || '',
                            expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
                            weight: product.weight || '',
                            contentSections: product.contentSections || []
                        });

                        // Handle existing images
                        const existing = product.images && product.images.length > 0 ? product.images :
                            (product.imageUrl || product.image ? [product.imageUrl || product.image] : []);
                        setImagePreviews(existing);
                        setKeptExistingImages(existing);
                    }
                }
            } catch (err) {
                console.error('Initialization failed:', err);
                toast.error(isEdit ? 'Failed to load product data' : 'Failed to load categories');
            } finally {
                setInitialLoading(false);
            }
        };
        init();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const totalImages = imagePreviews.length + files.length;

        if (totalImages > 5) {
            setError('You can upload a maximum of 5 images per product.');
            toast.error('Limit exceeded: Max 5 images allowed');
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        const invalidFiles = files.filter(file => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            setError('Invalid file format. Only JPG, PNG, WEBP, and AVIF are allowed.');
            return;
        }

        if (files.length > 0) {
            setImageFiles(prev => [...prev, ...files]);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
            setError('');
        }
    };

    const handleRemoveImage = (index) => {
        const targetSrc = imagePreviews[index];
        setImagePreviews(prev => prev.filter((_, i) => i !== index));

        if (targetSrc.startsWith('blob:')) {
            // Calculate which index in imageFiles this corresponds to
            const blobsBefore = imagePreviews.slice(0, index).filter(src => typeof src === 'string' && src.startsWith('blob:')).length;
            setImageFiles(prev => prev.filter((_, i) => i !== blobsBefore));
        } else {
            // Existing image URL
            setKeptExistingImages(prev => prev.filter(img => img !== targetSrc));
        }
    };

    const addSection = () => {
        setFormData(prev => ({
            ...prev,
            contentSections: [
                ...prev.contentSections,
                { heading: '', sectionType: 'PARAGRAPH', content: '', specs: [] }
            ]
        }));
    };

    const removeSection = (index) => {
        setFormData(prev => ({
            ...prev,
            contentSections: prev.contentSections.filter((_, i) => i !== index)
        }));
    };

    const updateSection = (index, updates) => {
        setFormData(prev => ({
            ...prev,
            contentSections: prev.contentSections.map((s, i) => i === index ? { ...s, ...updates } : s)
        }));
    };

    const addSpec = (sectionIndex) => {
        const sections = [...formData.contentSections];
        sections[sectionIndex].specs = [...(sections[sectionIndex].specs || []), { label: '', value: '' }];
        setFormData(prev => ({ ...prev, contentSections: sections }));
    };

    const updateSpec = (sectionIndex, specIndex, updates) => {
        const sections = [...formData.contentSections];
        sections[sectionIndex].specs[specIndex] = { ...sections[sectionIndex].specs[specIndex], ...updates };
        setFormData(prev => ({ ...prev, contentSections: sections }));
    };

    const removeSpec = (sectionIndex, specIndex) => {
        const sections = [...formData.contentSections];
        sections[sectionIndex].specs = sections[sectionIndex].specs.filter((_, i) => i !== specIndex);
        setFormData(prev => ({ ...prev, contentSections: sections }));
    };

    const moveSection = (index, direction) => {
        if ((direction === -1 && index === 0) || (direction === 1 && index === formData.contentSections.length - 1)) return;
        const sections = [...formData.contentSections];
        const temp = sections[index];
        sections[index] = sections[index + direction];
        sections[index + direction] = temp;
        setFormData(prev => ({ ...prev, contentSections: sections }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'contentSections') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Send kept existing images
            keptExistingImages.forEach(img => {
                data.append('images', img);
            });

            if (imageFiles.length > 0) {
                imageFiles.forEach(file => {
                    data.append('images', file);
                });
            }

            if (isEdit) {
                await productAPI.update(productId, data);
                toast.success('Product updated successfully!');
            } else {
                await productAPI.create(data);
                toast.success('Product created successfully!');
            }
            navigate('/admin/products');
        } catch (err) {
            console.error('Failed to save product:', err);
            setError(err.response?.data?.message || 'Failed to save product. Please try again.');
            toast.error(isEdit ? 'Failed to update product' : 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto p-6 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-neutral-100">
                <div>
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors mb-2 text-xs font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={14} /> Back to Products
                    </button>
                    <h1 className="text-4xl font-black text-neutral-900 tracking-tighter uppercase">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
                    <p className="text-sm font-medium text-neutral-500 mt-1 uppercase tracking-wider">{isEdit ? 'Update existing product details' : 'Create a new product listing'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="px-6 py-3 bg-white border border-neutral-200 text-neutral-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm hover:bg-neutral-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-3 bg-neutral-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-neutral-900/10 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                        Save Product
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Column: Visual Assets */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            <h2 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">Product Images</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="w-full aspect-square rounded-[24px] border-2 border-dashed border-neutral-200 bg-neutral-50/50 relative group overflow-hidden flex flex-col items-center justify-center text-center p-8 transition-all hover:border-emerald-500/50 hover:bg-emerald-50/10 shadow-inner">
                                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center z-10">
                                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-500">
                                        <Upload className="w-10 h-10 text-neutral-400 group-hover:text-emerald-500" />
                                    </div>
                                    <h4 className="text-lg font-black text-neutral-900 mb-1 uppercase tracking-tight">Upload Product Images</h4>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-4">Standard Aspect Ratio Recommended. JPG, PNG, WEBP.</p>
                                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" multiple />
                                </label>
                            </div>

                            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-4">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <div className="space-y-1">
                                    <h5 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Important Notes</h5>
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider leading-relaxed">
                                        - Maximum 5 images allowed per asset<br />
                                        - First image will be considered as primary thumbnail<br />
                                        - Quality compression is handled automatically
                                    </p>
                                </div>
                            </div>

                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="aspect-square rounded-2xl overflow-hidden relative group border border-neutral-100 bg-white shadow-sm hover:shadow-xl transition-all duration-500">
                                            <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="p-3 bg-white text-rose-600 rounded-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all hover:bg-rose-600 hover:text-white shadow-2xl"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            {index === 0 && (
                                                <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md shadow-lg">Primary</div>
                                            )}
                                        </div>
                                    ))}
                                    {imagePreviews.length < 5 && Array.from({ length: 5 - imagePreviews.length }).map((_, i) => (
                                        <div key={`empty-${i}`} className="aspect-square rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/30 flex items-center justify-center">
                                            <ImageIcon className="text-neutral-200" size={24} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Form */}
                <div className="xl:col-span-8 space-y-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                            </div>
                        )}

                        {/* Group 1: Identity */}
                        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter product name..."
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Brand Identity</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        placeholder="Manufacturer / Brand"
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">SKU</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        placeholder="Unique Product Code"
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">HSN Code</label>
                                    <input
                                        type="text"
                                        name="hsnCode"
                                        value={formData.hsnCode}
                                        onChange={handleChange}
                                        placeholder="Tax Code (HSN)"
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Group 2: Taxonomy */}
                        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">Category & Subcategory</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Primary Domain (Category)</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm cursor-pointer shadow-sm appearance-none"
                                        required
                                    >
                                        <option value="">Select Domain</option>
                                        {categories.filter(c => !c.parent).map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Sub-Domain (Sub Category)</label>
                                    <select
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm cursor-pointer shadow-sm appearance-none"
                                    >
                                        <option value="">Select Sub-Domain</option>
                                        {categories
                                            .filter(c => c.parent === categories.find(cat => cat.name === formData.category)?._id)
                                            .map(cat => (
                                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Group 3: Logistics */}
                        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">Stock & Inventory</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Expiry Chronology</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Stock Quantity</label>
                                    <div className="relative">
                                        <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
                                        <input
                                            type="number"
                                            name="inventoryCount"
                                            value={formData.inventoryCount}
                                            onChange={handleChange}
                                            placeholder="Available stock..."
                                            className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-black text-sm shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Group 4: Fiscal */}
                        <div className="bg-emerald-50/20 rounded-[32px] border border-emerald-100/50 shadow-sm p-8 space-y-6 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 opacity-5">
                                <IndianRupee size={200} />
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-black tracking-tighter uppercase text-emerald-900">Fiscal Valuation</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800/60 ml-1">Original Valuation (MRP)</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-800/40 text-sm font-bold">₹</div>
                                        <input
                                            type="number"
                                            name="originalPrice"
                                            value={formData.originalPrice}
                                            onChange={handleChange}
                                            placeholder="00.00"
                                            className="w-full pl-10 pr-6 py-4 bg-white border border-emerald-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-black text-lg tracking-tight shadow-sm text-neutral-400"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Selling Price</label>
                                    <div className="relative">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-bold">₹</div>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="00.00"
                                            className="w-full pl-10 pr-6 py-4 bg-white border border-emerald-200 rounded-2xl focus:border-emerald-500 outline-none transition-all font-black text-lg tracking-tight shadow-lg shadow-emerald-500/5"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Group 5: Protocol Attributes */}
                        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">Status & Settings</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Registry Status</label>
                                    <div className="flex flex-col gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                                        {['ACTIVE', 'DRAFT', 'EXPIRED'].map((status) => (
                                            <label key={status} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="status"
                                                    value={status}
                                                    checked={formData.status === status}
                                                    onChange={handleChange}
                                                    className="sr-only peer"
                                                />
                                                <div className={cn(
                                                    "w-10 h-6 bg-neutral-200 rounded-full transition-all duration-300 relative",
                                                    formData.status === status ? (status === 'ACTIVE' ? "bg-emerald-500" : status === 'DRAFT' ? "bg-sky-500" : "bg-amber-500") : ""
                                                )}>
                                                    <div className={cn(
                                                        "absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                                                        formData.status === status ? "left-5" : ""
                                                    )}></div>
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase tracking-widest",
                                                    formData.status === status ? "text-neutral-900" : "text-neutral-400"
                                                )}>{status}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6 p-6 bg-neutral-50 rounded-2xl border border-neutral-100 h-full flex flex-col justify-center">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Featured Placement</span>
                                        <div className="relative w-12 h-6">
                                            <input
                                                type="checkbox"
                                                name="featured"
                                                checked={formData.featured}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-12 h-6 bg-neutral-200 rounded-full peer-checked:bg-emerald-500 transition-all duration-300"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:left-7"></div>
                                        </div>
                                    </label>

                                    <div className="h-px bg-neutral-200 w-full opacity-50"></div>

                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-neutral-600">Returnable Protocol</span>
                                        <div className="relative w-12 h-6">
                                            <input
                                                type="checkbox"
                                                name="returnable"
                                                checked={formData.returnable}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-12 h-6 bg-neutral-200 rounded-full peer-checked:bg-emerald-500 transition-all duration-300"></div>
                                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:left-7"></div>
                                        </div>
                                    </label>
                                </div>

                                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                    <CheckCircle2 className="text-emerald-500 mb-3" size={32} />
                                    <h6 className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Protocol Alignment</h6>
                                    <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-tight mt-1">Ensure all attributes comply with marketplace standards</p>
                                </div>
                            </div>
                        </div>

                        {/* Group 6: Summary */}
                        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">Short Description</h2>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Short Narrative (Marketplace Summary)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter a brief description of the product..."
                                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 focus:bg-white outline-none transition-all font-bold text-sm min-h-[120px] resize-none shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Group 7: Content Blocks */}
                        <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                    <h2 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">Product Details</h2>
                                </div>
                                <button
                                    type="button"
                                    onClick={addSection}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-xl shadow-neutral-900/10 active:scale-95"
                                >
                                    <Plus size={16} /> Add Section
                                </button>
                            </div>

                            <div className="space-y-6">
                                {formData.contentSections.length === 0 ? (
                                    <div className="py-24 text-center border-2 border-dashed border-neutral-100 rounded-[28px] bg-neutral-50/30">
                                        <Package className="mx-auto text-neutral-200 mb-4" size={48} />
                                        <p className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] px-10">No extra details added. Add sections for a more informative product page.</p>
                                    </div>
                                ) : (
                                    formData.contentSections.map((section, sIndex) => (
                                        <div key={sIndex} className="bg-white border border-neutral-100 rounded-[28px] p-8 shadow-sm hover:shadow-xl transition-all animate-in slide-in-from-right-8 group/block">
                                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-50">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col gap-1">
                                                        <button type="button" onClick={() => moveSection(sIndex, -1)} className="text-neutral-300 hover:text-neutral-900 transition-colors disabled:opacity-0" disabled={sIndex === 0}><ChevronUp size={18} /></button>
                                                        <button type="button" onClick={() => moveSection(sIndex, 1)} className="text-neutral-300 hover:text-neutral-900 transition-colors disabled:opacity-0" disabled={sIndex === formData.contentSections.length - 1}><ChevronDown size={18} /></button>
                                                    </div>
                                                    <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center text-neutral-900 font-black text-lg shadow-inner">
                                                        {sIndex + 1}
                                                    </div>
                                                    <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">Protocol Block</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateSection(sIndex, { sectionType: 'PARAGRAPH' })}
                                                        className={cn(
                                                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                                            section.sectionType === 'PARAGRAPH' ? "bg-neutral-900 text-white shadow-lg" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                                                        )}
                                                    >
                                                        <AlignLeft size={14} /> Paragraph
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateSection(sIndex, { sectionType: 'TABLE' })}
                                                        className={cn(
                                                            "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                                            section.sectionType === 'TABLE' ? "bg-neutral-900 text-white shadow-lg" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                                                        )}
                                                    >
                                                        <TableIcon size={14} /> Specifications
                                                    </button>
                                                    <div className="w-px h-8 bg-neutral-100 mx-2" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSection(sIndex)}
                                                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all hover:scale-110"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Block Designation (Heading)</label>
                                                    <input
                                                        type="text"
                                                        value={section.heading}
                                                        onChange={(e) => updateSection(sIndex, { heading: e.target.value })}
                                                        placeholder="e.g. Overview, Features, Specs..."
                                                        className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-sm"
                                                    />
                                                </div>

                                                {section.sectionType === 'PARAGRAPH' ? (
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 ml-1">Narrative Content</label>
                                                        <textarea
                                                            value={section.content}
                                                            onChange={(e) => updateSection(sIndex, { content: e.target.value })}
                                                            placeholder="Integrate detailed descriptive textual data..."
                                                            className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:border-emerald-500 outline-none transition-all font-bold text-sm min-h-[160px] resize-none"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between ml-1">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Specification Pairs</label>
                                                            <button
                                                                type="button"
                                                                onClick={() => addSpec(sIndex)}
                                                                className="text-[10px] font-black text-emerald-600 uppercase tracking-[.2em] hover:text-emerald-700 transition-colors"
                                                            >
                                                                + Add Row
                                                            </button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {section.specs.map((spec, spIndex) => (
                                                                <div key={spIndex} className="flex gap-4 items-center group/spec animate-in fade-in slide-in-from-left-4">
                                                                    <div className="flex-1 relative">
                                                                        <input
                                                                            type="text"
                                                                            value={spec.label}
                                                                            onChange={(e) => updateSpec(sIndex, spIndex, { label: e.target.value })}
                                                                            placeholder="Key / Label"
                                                                            className="w-full px-6 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:border-emerald-500 outline-none transition-all font-black text-xs uppercase tracking-tight"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 relative">
                                                                        <input
                                                                            type="text"
                                                                            value={spec.value}
                                                                            onChange={(e) => updateSpec(sIndex, spIndex, { value: e.target.value })}
                                                                            placeholder="Data Value"
                                                                            className="w-full px-6 py-3 bg-neutral-50 border border-neutral-100 rounded-xl focus:border-emerald-500 outline-none transition-all font-bold text-xs"
                                                                        />
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeSpec(sIndex, spIndex)}
                                                                        className="p-2 text-neutral-300 hover:text-rose-500 transition-colors opacity-0 group-hover/spec:opacity-100"
                                                                    >
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {section.specs.length === 0 && (
                                                                <div className="py-12 border border-dashed border-neutral-100 rounded-2xl bg-neutral-50/20 text-center">
                                                                    <p className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest italic">No specs added for this section</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Sticky Footer for Page */}
                        <div className="flex items-center justify-end gap-4 p-8 bg-neutral-900 rounded-[32px] shadow-2xl shadow-neutral-900/40">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="px-8 py-4 text-white/60 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-12 py-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-900 font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div >
    );
}
