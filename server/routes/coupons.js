import express from 'express';
import Coupon from '../models/Coupon.js';

const router = express.Router();

// Validate coupon code
router.post('/validate', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Coupon code is required' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ error: 'Invalid or inactive coupon code' });
        }

        if (coupon.expirationDate < new Date()) {
            return res.status(400).json({ error: 'Coupon has expired' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }

        res.json({
            code: coupon.code,
            discountPercentage: coupon.discountPercentage
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

export default router;
