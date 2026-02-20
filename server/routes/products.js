import express from 'express';
import Product from '../models/Product.js';
import auth, { authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, search and sort
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, sort } = req.query;
        let query = {};

        // Search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Category filter
        if (category && category !== 'All') {
            query.category = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        let productsQuery = Product.find(query).populate('seller', 'name email');

        // Sorting
        if (sort) {
            switch (sort) {
                case 'price-low':
                    productsQuery = productsQuery.sort({ price: 1 });
                    break;
                case 'price-high':
                    productsQuery = productsQuery.sort({ price: -1 });
                    break;
                case 'rating':
                    productsQuery = productsQuery.sort({ rating: -1 });
                    break;
                case 'newest':
                    productsQuery = productsQuery.sort({ createdAt: -1 });
                    break;
                default:
                    // Default sorting (featured/default)
                    break;
            }
        }

        const products = await productsQuery;
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET /api/products/seller
// @desc    Get products for the logged in seller
// @access  Private/Seller
router.get('/seller', auth, authorize('seller'), async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id });
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'name email');

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST /api/products
// @desc    Create a product
// @access  Private/Seller
router.post('/', auth, authorize('seller'), async (req, res) => {
    try {
        const { title, description, price, originalPrice, category, images, stock, badge } = req.body;

        const newProduct = new Product({
            title,
            description,
            price,
            originalPrice,
            category,
            images,
            stock,
            badge,
            seller: req.user._id
        });

        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Seller
router.put('/:id', auth, authorize('seller'), async (req, res) => {
    try {
        const { title, description, price, originalPrice, category, images, stock, badge } = req.body;

        let product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Make sure user owns product
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        product = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: { title, description, price, originalPrice, category, images, stock, badge } },
            { new: true }
        );

        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Seller
router.delete('/:id', auth, authorize('seller'), async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Make sure user owns product
        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;
