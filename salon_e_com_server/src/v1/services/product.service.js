// src/v1/services/product.service.js
import Product from '../models/Product.js';

export const listProducts = async (filters = {}) => {
    // New: Check for expired products before listing
    try {
        await checkAndNotifyExpiredProducts();
    } catch (err) {
        console.error('Error auto-checking expiry:', err);
    }

    const query = {};

    // Exclude Filter (for related products)
    if (filters.exclude) {
        query._id = { $ne: filters.exclude };
    }

    // 1. Status and Expiry Filter
    if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
    } else if (!filters.status) {
        // Default for public homepage
        query.status = 'ACTIVE';
    }

    // New: Hide expired products from users by default (unless specifically requested/all view/admin view)
    const showingExpired = filters.showExpired === 'true' || filters.status === 'all' || filters.status === 'EXPIRED';

    if (!showingExpired) {
        const now = new Date();
        query.$or = [
            { expiryDate: { $gt: now } },
            { expiryDate: { $exists: false } },
            { expiryDate: null }
        ];
    }

    // Featured Filter
    if (filters.featured) {
        query.featured = filters.featured === 'true';
    }

    // 2. Category Filter
    if (filters.category && filters.category !== 'all') {
        const categories = filters.category.split(','); // Allow multiple categories
        if (categories.length > 1) {
            query.category = { $in: categories.map(c => new RegExp(`^${c}$`, 'i')) };
        } else {
            query.category = new RegExp(`^${filters.category}$`, 'i');
        }
    }
    // Subcategory Filter
    if (filters.subcategory && filters.subcategory !== 'all') {
        const subcategories = filters.subcategory.split(',');
        if (subcategories.length > 1) {
            query.subcategory = { $in: subcategories.map(s => new RegExp(`^${s}$`, 'i')) };
        } else {
            query.subcategory = new RegExp(`^${filters.subcategory}$`, 'i');
        }
    }

    // 3. Search Filter
    if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        query.$or = [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { tags: { $in: [searchRegex] } }
        ];
    }

    // 4. Price Filter
    if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
    }

    // 5. Stock Status Filter
    if (filters.stockStatus && filters.stockStatus !== 'all') {
        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        switch (filters.stockStatus) {
            case 'low_stock':
                query.inventoryCount = { $gt: 0, $lt: 10 };
                break;
            case 'out_of_stock':
                query.inventoryCount = 0;
                break;
            case 'close_to_expiry':
                query.expiryDate = { $gte: now, $lte: thirtyDaysFromNow };
                break;
            case 'expired':
                query.expiryDate = { $lt: now };
                break;
        }
    }

    // 5. Sorting
    let sort = { createdAt: -1 }; // Default: Newest first
    if (filters.sort) {
        switch (filters.sort) {
            case 'price_asc':
                sort = { price: 1 };
                break;
            case 'price_desc':
                sort = { price: -1 };
                break;
            case 'name_asc':
                sort = { name: 1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            default:
                sort = { createdAt: -1 };
        }
    }

    const page = parseInt(filters.page, 10) || 1;
    const limit = parseInt(filters.limit, 10) || 20;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit);

    return { products, count: total, page, limit };
};

export const createProduct = async (productData) => {
    // Ensure required fields and types
    if (!productData.name) throw new Error('Product name is required');

    // Generate slug from name if not provided
    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^a-z0-9\-]/g, '')    // Remove all non-alphanumeric chars except -
            .replace(/-+/g, '-')             // Replace multiple - with single -
            .replace(/^-+|-+$/g, '');        // Trim - from start/end
    };

    if (!productData.slug || productData.slug.trim() === '') {
        productData.slug = slugify(productData.name);
    }

    // Default category when not provided
    if (!productData.category || productData.category.trim() === '') {
        productData.category = 'Uncategorized';
    }

    // Coerce numeric fields (they may come as strings via FormData)
    ['price', 'originalPrice', 'costPerItem', 'inventoryCount'].forEach(key => {
        if (productData[key] !== undefined && productData[key] !== null && productData[key] !== '') {
            const n = Number(productData[key]);
            if (!Number.isNaN(n)) productData[key] = n;
        }
    });

    // Ensure unique slug (append suffix if exists)
    let baseSlug = productData.slug;
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug: uniqueSlug })) {
        uniqueSlug = `${baseSlug}-${counter++}`;
    }
    productData.slug = uniqueSlug;

    const product = await Product.create(productData);
    return product;
};

export const updateProduct = async (id, updateData) => {
    const product = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });

    if (!product) {
        throw new Error('Product not found');
    }

    return product;
};

export const getProductById = async (id) => {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
};

export const deleteProduct = async (id) => {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
        throw new Error('Product not found');
    }
    return { product };
};

/**
 * Checks for expired products and notifies admins.
 */
export const checkAndNotifyExpiredProducts = async () => {
    const now = new Date();
    const expiredProducts = await Product.find({
        expiryDate: { $lte: now },
        isExpiryNotified: false,
        status: { $ne: 'ARCHIVED' }
    });

    if (expiredProducts.length === 0) return 0;

    const notificationService = await import('./notification.service.js');
    for (const product of expiredProducts) {
        await notificationService.notifyAdmins({
            title: 'Product Expired',
            description: `The product "${product.name}" has expired on ${product.expiryDate.toLocaleDateString()}. It is now hidden from customers.`,
            type: 'SYSTEM',
            priority: 'HIGH',
            metadata: { productId: product._id }
        });

        product.isExpiryNotified = true;
        product.status = 'EXPIRED';
        await product.save();
    }

    return expiredProducts.length;
};
