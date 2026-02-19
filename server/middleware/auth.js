import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

export const maybeAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findOne({ _id: decoded._id });
            if (user) {
                req.token = token;
                req.user = user;
            }
        }
        next();
    } catch (e) {
        // If token is invalid, just proceed as guest
        next();
    }
};

export const authorize = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.status(403).send({ error: 'Access denied.' });
        }
        next();
    };
};

export default auth;
