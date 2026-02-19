import express from 'express';
import Order from '../models/Order.js';
import auth, { authorize } from '../middleware/auth.js';

const router = express.Router();

// Create new order
router.post('/', auth, async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress } = req.body;

        const order = new Order({
            userId: req.user._id,
            items,
            totalAmount,
            shippingAddress
        });

        await order.save();
        res.status(201).send(order);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.send(orders);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user._id });
        if (!order) {
            return res.status(404).send();
        }
        res.send(order);
    } catch (error) {
        res.status(500).send(error);
    }
});

// @route   GET /api/orders/seller
// @desc    Get orders containing seller's products
// @access  Private/Seller
router.get('/seller', auth, authorize('seller'), async (req, res) => {
    try {
        // Find orders that contain at least one item belonging to this seller
        const orders = await Order.find({
            'items.sellerId': req.user._id
        }).sort({ createdAt: -1 });

        // Optionally, we could filter the items in each order to only show those belonging to the seller
        // but for now, showing the full order is probably more useful for context.

        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
