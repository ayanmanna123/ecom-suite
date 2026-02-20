import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import auth, { authorize, maybeAuth } from '../middleware/auth.js';

const router = express.Router();

// Create new order
// Create new order
router.post('/', maybeAuth, async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress } = req.body;

        // Extract user from optional auth (if using middleware or custom check)
        // For simplicity, we'll check if req.user exists (set by auth middleware if token provided)
        const userId = req.user ? req.user._id : null;

        const order = new Order({
            userId,
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

// @route   GET /api/orders/analytics
// @desc    Get aggregated analytics for seller
// @access  Private/Seller
router.get('/analytics', auth, authorize('seller'), async (req, res) => {
    try {
        const sellerId = req.user._id;

        // 1. Sales over time (Daily Revenue for last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesOverTime = await Order.aggregate([
            {
                $match: {
                    'items.sellerId': sellerId,
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            { $unwind: '$items' },
            { $match: { 'items.sellerId': sellerId, 'items.status': { $ne: 'cancelled' } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: { $multiply: ["$items.priceAtPurchase", "$items.quantity"] } }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 2. Category Breakdown
        const categoryBreakdown = await Order.aggregate([
            { $match: { 'items.sellerId': sellerId, 'items.status': { $ne: 'cancelled' } } },
            { $unwind: '$items' },
            { $match: { 'items.sellerId': sellerId } },
            { $addFields: { productIdObj: { $toObjectId: "$items.productId" } } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productIdObj',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $group: {
                    _id: '$productDetails.category',
                    sales: { $sum: { $multiply: ["$items.priceAtPurchase", "$items.quantity"] } }
                }
            }
        ]);

        // 3. Low Stock Items
        const lowStockItems = await Product.find({
            seller: sellerId,
            stock: { $lte: 5 }
        }).select('title stock').limit(5);

        // 4. Summary metrics
        const summary = await Order.aggregate([
            { $match: { 'items.sellerId': sellerId } },
            { $unwind: '$items' },
            { $match: { 'items.sellerId': sellerId } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: { $cond: [{ $ne: ["$items.status", "cancelled"] }, { $multiply: ["$items.priceAtPurchase", "$items.quantity"] }, 0] } },
                    totalOrders: { $addToSet: "$_id" },
                    activeOrders: { $sum: { $cond: [{ $in: ["$items.status", ["pending", "processing", "shipped"]] }, 1, 0] } }
                }
            },
            {
                $project: {
                    totalRevenue: 1,
                    totalOrders: { $size: "$totalOrders" },
                    activeOrders: 1
                }
            }
        ]);

        res.json({
            salesOverTime,
            categoryBreakdown,
            lowStockItems,
            summary: summary[0] || { totalRevenue: 0, totalOrders: 0, activeOrders: 0 }
        });

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
