import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

export const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;

        const query = { product: productId };
        const total = await Review.countDocuments(query);

        const reviews = await Review.find(query)
            .populate('user', 'firstName lastName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Calculate aggregate stats
        const stats = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId) } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    counts: {
                        $push: '$rating'
                    }
                }
            }
        ]);

        let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let averageRating = 0;
        let totalReviews = 0;

        if (stats.length > 0) {
            averageRating = parseFloat(stats[0].avgRating.toFixed(1));
            totalReviews = stats[0].totalReviews;
            stats[0].counts.forEach(r => {
                ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
            });
        }

        res.json({
            reviews,
            pagination: {
                current: page,
                pages: Math.ceil(total / limit),
                total
            },
            stats: {
                averageRating,
                totalReviews,
                ratingDistribution
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user._id });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        // 1. Check if user bought and received the product
        const hasPurchased = await Order.findOne({
            customerId: userId,
            "items.productId": productId,
            "items.productId": productId,
            status: { $in: ['DELIVERED', 'COMPLETED'] }
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: 'You can only review products from delivered orders.' });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if user already reviewed
        const existingReview = await Review.findOne({ product: productId, user: userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product' });
        }

        const review = await Review.create({
            product: productId,
            user: userId,
            rating,
            comment
        });

        const populatedReview = await Review.findById(review._id).populate('user', 'firstName lastName');

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
