import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/addresses
// @desc    Get user's addresses
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/addresses
// @desc    Add new address
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const newAddress = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip,
            isDefault: req.body.isDefault || false
        };

        if (newAddress.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        } else if (user.addresses.length === 0) {
            newAddress.isDefault = true;
        }

        user.addresses.push(newAddress);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/addresses/:id
// @desc    Delete an address
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        await user.save();
        res.json(user.addresses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;
