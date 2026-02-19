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
        res.status(400).json({ error: error.message });
    }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.send(orders);
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
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
        res.status(500).json({ msg: 'Server Error' });
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
        res.status(500).json({ error: 'Server Error' });
    }
});

// @route   PATCH /api/orders/:orderId/item/:productId/status
// @desc    Update status of a specific item in an order
// @access  Private/Seller
router.patch('/:orderId/item/:productId/status', auth, authorize('seller'), async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        const item = order.items.find(
            i => i.productId === req.params.productId && i.sellerId.toString() === req.user._id.toString()
        );

        if (!item) {
            return res.status(404).json({ msg: 'Item not found or unauthorized' });
        }

        item.status = status;

        // Recalculate top-level order status
        const itemStatuses = order.items.map(i => i.status || 'pending');

        if (itemStatuses.every(s => s === 'delivered')) {
            order.status = 'delivered';
        } else if (itemStatuses.every(s => s === 'cancelled')) {
            order.status = 'cancelled';
        } else if (itemStatuses.some(s => s === 'pending')) {
            order.status = 'pending';
        } else if (itemStatuses.some(s => s === 'processing')) {
            order.status = 'processing';
        } else if (itemStatuses.some(s => s === 'shipped')) {
            order.status = 'shipped';
        }

        await order.save();

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

export default router;
