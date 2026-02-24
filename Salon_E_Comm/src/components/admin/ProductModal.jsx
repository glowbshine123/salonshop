import React, { useState, useEffect } from 'react';
import { X, Upload, Package, AlertCircle, CheckCircle2, Loader2, IndianRupee, Plus, Trash2, AlignLeft, Table as TableIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { productAPI } from '../../services/apiService';
import { cn } from '@/lib/utils';

export default function ProductModal({ isOpen, onClose, product, categories, onSuccess }) {
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
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [keptExistingImages, setKeptExistingImages] = useState([]);

    useEffect(() => {
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
        } else {
            setFormData({
                name: '',
                sku: '',
                category: categories?.[0]?.name || '',
                subcategory: '',
                brand: '',
                price: '',
                originalPrice: '',
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
            setImagePreviews([]);
        }
        setImageFiles([]);
        setError('');
    }, [product, isOpen, categories]);

    if (!isOpen) return null;

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

        // Remove from previews
        setImagePreviews(prev => prev.filter((_, i) => i !== index));

        if (targetSrc.startsWith('blob:')) {
            // It's a newly uploaded file
            // Count how many blob images were before this one to find index in imageFiles
            const blobsBefore = imagePreviews.slice(0, index).filter(src => src.startsWith('blob:')).length;
            setImageFiles(prev => prev.filter((_, i) => i !== blobsBefore));
        } else {
            // It's an existing image
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
            // We need to append them as 'images' or handle explicitly in backend.
            // Backend Controller Logic:
            // if (imagePaths.length > 0) {
            //     const existingImages = updateData.images ? ... : [];
            //     updateData.images = [...existingImages, ...imagePaths];
            // }
            // So we need to put keptExistingImages into formData or data.
            // But FormData 'images' usually expects files.
            // The backend controller looks for `req.body.images` for existing ones (strings) and `req.files` for new ones.
            // So we append `images` to formData for each kept string.

            keptExistingImages.forEach(img => {
                data.append('images', img);
            });

            if (imageFiles.length > 0) {
                imageFiles.forEach(file => {
                    data.append('images', file);
                });
            }

            if (product) {
                await productAPI.update(product._id, data);
            } else {
                await productAPI.create(data);
            }

            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Failed to save product:', err);
            setError(err.response?.data?.message || 'Failed to save product. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white w-full max-w-7xl rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row max-h-[92vh] border border-neutral-100/50">
                {/* Left: Image Upload Zone */}
                <div className="w-full md:w-1/5 bg-neutral-50/50 p-6 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-neutral-100 overflow-y-auto custom-scrollbar min-w-0">
                    <div className="w-full aspect-4/5 rounded-lg border-2 border-dashed border-neutral-200 bg-white relative group overflow-hidden flex flex-col items-center justify-center text-center p-5 mb-4 transition-all hover:border-emerald-500/50 hover:bg-emerald-50/10">
                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center z-10">
                            <div className="w-16 h-16 bg-neutral-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-500">
                                <Upload className="w-8 h-8 text-neutral-400 group-hover:text-emerald-500" />
                            </div>
                            <h4 className="text-sm font-bold text-neutral-900 mb-0.5">Visual Assets</h4>
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest px-2">Drag & Drop or Click</p>
                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" multiple />
                        </label>
                    </div>

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 gap-3 w-full">
                            {imagePreviews.map((src, index) => (
                                <div key={index} className="aspect-square rounded-xl overflow-hidden relative group border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
                                    <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="p-1.5 bg-white text-rose-600 rounded-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:bg-rose-600 hover:text-white shadow-lg"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Center: Main Form Section */}
                <div className="w-full md:w-2/5 p-6 overflow-y-auto custom-scrollbar bg-white border-r border-neutral-100 min-w-0">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                <h2 className="text-xl font-black text-neutral-900 tracking-tighter uppercase">{product ? 'Update Asset' : 'Register Asset'}</h2>
                            </div>
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-4">{product ? 'Inventory modification' : 'Nnew inventory integration'}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-all active:scale-90"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 text-left">
                        {error && (
                            <div className="p-3 bg-rose-50 border border-rose-100 rounded-md flex items-center gap-3 text-rose-600 animate-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">{error}</span>
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* General Data */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Product Designation</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter product title..."
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-bold text-sm shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Brand Identity</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        placeholder="Manufacturer / Brand"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-bold text-sm shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Serial (SKU)</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={formData.sku}
                                        onChange={handleChange}
                                        placeholder="SKU code"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-bold text-sm shadow-sm placeholder:text-neutral-300"
                                    />
                                </div>
                            </div>

                            {/* Specifications Data */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">HSN Code</label>
                                    <input
                                        type="text"
                                        name="hsnCode"
                                        value={formData.hsnCode}
                                        onChange={handleChange}
                                        placeholder="HSN Code"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-bold text-sm shadow-sm placeholder:text-neutral-300"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Weight (gm/ml)</label>
                                    <input
                                        type="text"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        placeholder="e.g. 500ml"
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-bold text-sm shadow-sm placeholder:text-neutral-300"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-bold text-sm shadow-sm text-neutral-600"
                                    />
                                </div>
                            </div>

                            {/* Logistics Data */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-neutral-50/50 rounded-lg border border-neutral-100">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Primary Classification</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-bold text-sm cursor-pointer shadow-sm appearance-none"
                                        required
                                    >
                                        <option value="">Select Domain</option>
                                        {categories.filter(c => !c.parent).map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Status</label>
                                    <div className="flex items-center gap-5 h-[46px] bg-white px-4 rounded-md border border-neutral-100 shadow-sm">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="ACTIVE"
                                                checked={formData.status === 'ACTIVE' || !formData.status}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <div className={cn(
                                                "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all",
                                                (formData.status === 'ACTIVE' || !formData.status) ? "border-emerald-500 bg-emerald-500" : "border-neutral-200"
                                            )}>
                                                {(formData.status === 'ACTIVE' || !formData.status) && <div className="w-1 h-1 bg-white rounded-full" />}
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                (formData.status === 'ACTIVE' || !formData.status) ? "text-neutral-900" : "text-neutral-400"
                                            )}>Active</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="DRAFT"
                                                checked={formData.status === 'DRAFT'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <div className={cn(
                                                "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all",
                                                formData.status === 'DRAFT' ? "border-sky-500 bg-sky-500" : "border-neutral-200"
                                            )}>
                                                {formData.status === 'DRAFT' && <div className="w-1 h-1 bg-white rounded-full" />}
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                formData.status === 'DRAFT' ? "text-neutral-900" : "text-neutral-400"
                                            )}>Draft</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="EXPIRED"
                                                checked={formData.status === 'EXPIRED'}
                                                onChange={handleChange}
                                                className="hidden"
                                            />
                                            <div className={cn(
                                                "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all",
                                                formData.status === 'EXPIRED' ? "border-amber-500 bg-amber-500" : "border-neutral-200"
                                            )}>
                                                {formData.status === 'EXPIRED' && <div className="w-1 h-1 bg-white rounded-full" />}
                                            </div>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                formData.status === 'EXPIRED' ? "text-neutral-900" : "text-neutral-400"
                                            )}>Expired</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Secondary Classification</label>
                                    <select
                                        name="subcategory"
                                        value={formData.subcategory}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-bold text-sm cursor-pointer shadow-sm appearance-none"
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

                            {/* Financial Data */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50/20 p-5 rounded-lg border border-emerald-100/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-3 opacity-5">
                                    <IndianRupee size={60} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-800/60 ml-1">Original Price (MRP)</label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-800/40 text-sm font-bold">₹</div>
                                        <input
                                            type="number"
                                            name="originalPrice"
                                            value={formData.originalPrice}
                                            onChange={handleChange}
                                            placeholder="MRP"
                                            className="w-full pl-8 pr-4 py-3 bg-white border border-emerald-100 rounded-md focus:border-emerald-500 outline-none transition-all font-black text-sm tracking-tight shadow-sm text-neutral-400"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-emerald-600 ml-1">Selling Price</label>
                                    <div className="relative">
                                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-bold">₹</div>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            placeholder="Selling Price"
                                            className="w-full pl-8 pr-4 py-3 bg-white border border-emerald-200 rounded-md focus:border-emerald-500 outline-none transition-all font-black text-sm tracking-tight shadow-md shadow-emerald-500/5"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Inventory Integrity (Count)</label>
                                    <div className="relative">
                                        <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-300" size={16} />
                                        <input
                                            type="number"
                                            name="inventoryCount"
                                            value={formData.inventoryCount}
                                            onChange={handleChange}
                                            placeholder="Global Stock Count"
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-black text-sm shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 p-5 bg-neutral-50/50 rounded-lg border border-neutral-100">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative w-8 h-5">
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={formData.featured}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-5 bg-neutral-200 rounded-full peer-checked:bg-emerald-500 transition-all duration-300"></div>
                                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:left-3.5"></div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Featured</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative w-8 h-5">
                                        <input
                                            type="checkbox"
                                            name="returnable"
                                            checked={formData.returnable}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-8 h-5 bg-neutral-200 rounded-full peer-checked:bg-emerald-500 transition-all duration-300"></div>
                                        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-300 peer-checked:left-3.5"></div>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Returnable</span>
                                </label>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Short Summary (Optional)</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief overview..."
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-md focus:border-emerald-500 outline-none transition-all font-bold text-sm min-h-[80px] resize-none shadow-sm placeholder:text-neutral-300"
                                />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Right: Dynamic Content Sections */}
                <div className="w-full md:w-2/5 p-6 overflow-y-auto custom-scrollbar bg-neutral-50/30 flex flex-col min-w-0">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                                    <h2 className="text-lg font-black text-neutral-900 tracking-tighter uppercase">Content Blocks</h2>
                                </div>
                                <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest ml-4">Detailed specs & descriptions</p>
                            </div>
                            <button
                                type="button"
                                onClick={addSection}
                                className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-600 transition-all shadow-lg shadow-neutral-900/10 active:scale-95"
                            >
                                <Plus size={14} /> Add Block
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.contentSections.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-neutral-200 rounded-2xl bg-white/50">
                                    <Package className="mx-auto text-neutral-200 mb-3" size={32} />
                                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-10">No content blocks added yet. Use structured sections for better presentation.</p>
                                </div>
                            ) : (
                                formData.contentSections.map((section, sIndex) => (
                                    <div key={sIndex} className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all animate-in slide-in-from-right-4">
                                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-50">
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col gap-1">
                                                    <button type="button" onClick={() => moveSection(sIndex, -1)} className="text-neutral-300 hover:text-neutral-900 transition-colors disabled:opacity-0" disabled={sIndex === 0}><ChevronUp size={14} /></button>
                                                    <button type="button" onClick={() => moveSection(sIndex, 1)} className="text-neutral-300 hover:text-neutral-900 transition-colors disabled:opacity-0" disabled={sIndex === formData.contentSections.length - 1}><ChevronDown size={14} /></button>
                                                </div>
                                                <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 font-black text-xs">
                                                    {sIndex + 1}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateSection(sIndex, { sectionType: 'PARAGRAPH' })}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                                        section.sectionType === 'PARAGRAPH' ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                                                    )}
                                                >
                                                    <AlignLeft size={12} className="inline mr-1" /> Para
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateSection(sIndex, { sectionType: 'TABLE' })}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                                        section.sectionType === 'TABLE' ? "bg-neutral-900 text-white" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100"
                                                    )}
                                                >
                                                    <TableIcon size={12} className="inline mr-1" /> Specs
                                                </button>
                                                <div className="w-px h-6 bg-neutral-100 mx-1" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSection(sIndex)}
                                                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Section Heading</label>
                                                <input
                                                    type="text"
                                                    value={section.heading}
                                                    onChange={(e) => updateSection(sIndex, { heading: e.target.value })}
                                                    placeholder="e.g. Overview, Key Features, Specs..."
                                                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-lg focus:border-emerald-500 outline-none transition-all font-bold text-sm"
                                                />
                                            </div>

                                            {section.sectionType === 'PARAGRAPH' ? (
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-1">Para Content</label>
                                                    <textarea
                                                        value={section.content}
                                                        onChange={(e) => updateSection(sIndex, { content: e.target.value })}
                                                        placeholder="Enter descriptive content..."
                                                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-lg focus:border-emerald-500 outline-none transition-all font-bold text-sm min-h-[120px] resize-none"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between ml-1">
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Specification Pairs</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => addSpec(sIndex)}
                                                            className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                                                        >
                                                            + Add Row
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {section.specs.map((spec, spIndex) => (
                                                            <div key={spIndex} className="flex gap-2 items-center group/spec">
                                                                <input
                                                                    type="text"
                                                                    value={spec.label}
                                                                    onChange={(e) => updateSpec(sIndex, spIndex, { label: e.target.value })}
                                                                    placeholder="Label"
                                                                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-lg focus:border-emerald-500 outline-none transition-all font-bold text-[11px]"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={spec.value}
                                                                    onChange={(e) => updateSpec(sIndex, spIndex, { value: e.target.value })}
                                                                    placeholder="Value"
                                                                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-100 rounded-lg focus:border-emerald-500 outline-none transition-all font-bold text-[11px]"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeSpec(sIndex, spIndex)}
                                                                    className="p-1.5 text-neutral-300 hover:text-rose-500 transition-colors opacity-0 group-hover/spec:opacity-100"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        {section.specs.length === 0 && (
                                                            <p className="text-[9px] font-bold text-neutral-300 italic text-center py-4 bg-neutral-50/50 rounded-lg border border-dashed">No specs added yet</p>
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

                    <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-white border border-neutral-200 text-neutral-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm hover:bg-neutral-50"
                        >
                            Abort
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-2 py-4 bg-neutral-900 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl shadow-neutral-900/10 transition-all flex items-center justify-center gap-2 group active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                            {product ? 'Update Inventory' : 'Finalize Registry'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
