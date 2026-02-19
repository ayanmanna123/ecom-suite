import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/wishlist/:id
// @desc    Toggle product in wishlist
// @access  Private
router.post('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const productId = req.params.id;

        const index = user.wishlist.indexOf(productId);
        if (index === -1) {
            // Add to wishlist
            user.wishlist.push(productId);
            await user.save();
            res.json({ msg: 'Product added to wishlist', isWishlisted: true });
        } else {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
            await user.save();
            res.json({ msg: 'Product removed from wishlist', isWishlisted: false });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/wishlist
// @desc    Get user's wishlist products
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('wishlist');
        res.json(user.wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
