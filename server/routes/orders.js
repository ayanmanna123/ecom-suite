import express from 'express';
import Order from '../models/Order.js';
import auth from '../middleware/auth.js';

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

export default router;
