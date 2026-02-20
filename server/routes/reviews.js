import express from 'express';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

import natural from 'natural';

const router = express.Router();
// Use try-catch or check properties to avoid crashes on initialization
let analyzer, tokenizer;
try {
    analyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn");
    tokenizer = new natural.WordTokenizer();
} catch (error) {
    console.error("Failed to initialize natural library:", error);
}

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

        // Sentiment Analysis
        let sentiment = 'neutral';
        if (analyzer && tokenizer) {
            try {
                const tokens = tokenizer.tokenize(comment);
                const score = analyzer.getSentiment(tokens);

                if (score > 0.2) sentiment = 'positive';
                else if (score < -0.2) sentiment = 'negative';
            } catch (err) {
                console.error("Sentiment analysis error:", err);
            }
        }

        const newReview = new Review({
            user: req.user._id,
            product: productId,
            rating,
            comment,
            sentiment
        });

        await newReview.save();

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
