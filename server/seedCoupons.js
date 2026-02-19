import mongoose from 'mongoose';
import Coupon from './models/Coupon.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Coupon.deleteMany({});

        const coupon = new Coupon({
            code: 'WELCOME10',
            discountPercentage: 10,
            expirationDate: new Date('2026-12-31'),
            isActive: true
        });

        await coupon.save();
        console.log('Test coupon WELCOME10 created!');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
