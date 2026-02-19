import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/reviews
// @desc    Submit a review
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { product: productId, rating, comment } = req.body;

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({ user: req.user._id, product: productId });
        if (existingReview) {
            return res.status(400).json({ msg: 'You have already reviewed this product' });
        }

        const newReview = new Review({
            user: req.user._id,
            product: productId,
            rating,
            comment
        });

        await newReview.save();

        // Update Product rating and reviewCount
        const product = await Product.findById(productId);
        if (product) {
            const reviews = await Review.find({ product: productId });
            const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
            product.rating = totalRating / reviews.length;
            product.reviewCount = reviews.length;
            await product.save();
        }

        res.status(201).json(newReview);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET /api/reviews/product/:id
// @desc    Get all reviews for a product
// @access  Public
router.get('/product/:id', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;
