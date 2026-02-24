import * as productService from '../services/product.service.js';
import * as notificationService from '../services/notification.service.js';
import { isCloudinaryConfigured } from '../../config/cloudinary.js';

export const getProducts = async (req, res) => {
    try {
        const filters = req.query;
        const result = await productService.listProducts(filters);
        res.json(result);
    } catch (error) {
        console.error('[getProducts] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const productData = { ...req.body };
        const warnings = [];

        ['price', 'originalPrice', 'costPerItem', 'inventoryCount'].forEach(k => {
            if (productData[k] !== undefined) {
                const n = Number(productData[k]);
                if (!Number.isNaN(n)) productData[k] = n;
            }
        });

        ['featured', 'returnable'].forEach(k => {
            if (productData[k] !== undefined) {
                productData[k] = productData[k] === 'true' || productData[k] === true;
            }
        });

        if (req.files && req.files.length > 0) {
            const imagePaths = [];
            for (const file of req.files) {
                if (isCloudinaryConfigured) {
                    if (file.path) imagePaths.push(file.path);
                } else {
                    if (file.filename) {
                        const protocol = req.protocol;
                        const host = req.get('host');
                        const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
                        imagePaths.push(fileUrl);
                    } else {
                        console.warn('[createProduct] File has no filename in local storage mode:', file);
                    }
                }
            }
            if (imagePaths.length > 0) {
                const existingImages = productData.images ? (Array.isArray(productData.images) ? productData.images : [productData.images]) : [];
                productData.images = [...existingImages, ...imagePaths];
            }
        }

        if (productData.contentSections && typeof productData.contentSections === 'string') {
            try {
                productData.contentSections = JSON.parse(productData.contentSections);
            } catch (error) {
                console.error('[createProduct] Error parsing contentSections:', error);
            }
        }

        const product = await productService.createProduct(productData);

        // Admin Notification for New Product
        await notificationService.notifyAdmins({
            title: 'New Product Added',
            description: `Product "${product.name}" has been added to the catalog.`,
            type: 'SYSTEM',
            priority: 'LOW',
            metadata: { productId: product._id }
        });

        const response = { product };
        if (warnings.length) response.warnings = warnings;
        res.status(201).json(response);
    } catch (error) {
        console.error('[createProduct] Error:', error);
        if (error.name === 'ValidationError') {
            const details = Object.values(error.errors).map(e => e.message || e.path + ' ' + e.kind);
            return res.status(400).json({ message: 'Validation failed', details });
        }
        res.status(400).json({ message: error.message || 'Failed to create product' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const updateData = { ...req.body };
        const warnings = [];

        ['price', 'originalPrice', 'costPerItem', 'inventoryCount'].forEach(k => {
            if (updateData[k] !== undefined) {
                const n = Number(updateData[k]);
                if (!Number.isNaN(n)) updateData[k] = n;
            }
        });

        ['featured', 'returnable'].forEach(k => {
            if (updateData[k] !== undefined) {
                updateData[k] = updateData[k] === 'true' || updateData[k] === true;
            }
        });

        if (req.files && req.files.length > 0) {
            const imagePaths = [];
            for (const file of req.files) {
                if (isCloudinaryConfigured) {
                    if (file.path) imagePaths.push(file.path);
                } else {
                    if (file.filename) {
                        const protocol = req.protocol;
                        const host = req.get('host');
                        const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;
                        imagePaths.push(fileUrl);
                    } else {
                        console.warn('[updateProduct] File has no filename in local storage mode:', file);
                    }
                }
            }
            if (imagePaths.length > 0) {
                const existingImages = updateData.images ? (Array.isArray(updateData.images) ? updateData.images : [updateData.images]) : [];
                updateData.images = [...existingImages, ...imagePaths];
            }
        }

        if (updateData.contentSections && typeof updateData.contentSections === 'string') {
            try {
                updateData.contentSections = JSON.parse(updateData.contentSections);
            } catch (error) {
                console.error('[updateProduct] Error parsing contentSections:', error);
            }
        }

        const product = await productService.updateProduct(req.params.id, updateData);
        const response = { product };
        if (warnings.length) response.warnings = warnings;
        res.json(response);
    } catch (error) {
        console.error('[updateProduct] Error:', error);
        if (error.name === 'ValidationError') {
            const details = Object.values(error.errors).map(e => e.message || e.path + ' ' + e.kind);
            return res.status(400).json({ message: 'Validation failed', details });
        }
        res.status(400).json({ message: error.message || 'Failed to update product' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await productService.deleteProduct(req.params.id);
        res.json({ message: 'Product deleted successfully', product });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
