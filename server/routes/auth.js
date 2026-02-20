import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        console.log('Registration attempt:', { email, name });

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).send({ error: 'Email already in use' });
        }

        const user = new User({ email, password, name });
        await user.save();
        console.log('User registered successfully:', user._id);

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).send({ user, token });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).send({ error: error.message || error });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send({ error: 'Invalid login credentials' });
        }

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

// Google Auth
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
    try {
        const { idToken } = req.body;
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { email, name, sub: googleId, picture } = ticket.getPayload();

        let user = await User.findOne({
            $or: [
                { googleId },
                { email }
            ]
        });

        let isNew = false;
        if (user) {
            // Update googleId and picture if it's a legacy email user or if picture changed
            let updated = false;
            if (!user.googleId) {
                user.googleId = googleId;
                updated = true;
            }
            if (picture && user.picture !== picture) {
                user.picture = picture;
                updated = true;
            }
            if (updated) await user.save();
        } else {
            // Create new user
            isNew = true;
            user = new User({
                email,
                name,
                googleId,
                picture,
                role: 'customer' // Default to customer for Google sign-ups
            });
            await user.save();
        }

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.send({ user, token, isNew });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(400).send({ error: 'Google authentication failed' });
    }
});

// Update role
router.put('/role', auth, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['customer', 'seller'].includes(role)) {
            return res.status(400).send({ error: 'Invalid role' });
        }
        req.user.role = role;
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

export default router;
