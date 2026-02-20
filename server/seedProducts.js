import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const SELLER_ID = '6997657bc4bf33d3288c03dc'; // Existing seller ID from DB

const products = [
    // Original 8
    {
        title: "Artisan Leather Crossbody",
        description: "Hand-stitched Italian leather crossbody bag with brass hardware. A timeless piece crafted for everyday elegance.",
        price: 189,
        originalPrice: 245,
        category: "Bags",
        images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"],
        rating: 4.8,
        reviewCount: 124,
        stock: 12,
        badge: "Sale",
        seller: SELLER_ID
    },
    {
        title: "Cashmere Wool Scarf",
        description: "Ultra-soft cashmere blend scarf in a versatile neutral tone. Perfect for layering in any season.",
        price: 95,
        category: "Accessories",
        images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80"],
        rating: 4.9,
        reviewCount: 89,
        stock: 25,
        seller: SELLER_ID
    },
    {
        title: "Linen Relaxed Blazer",
        description: "Breathable linen blazer with a relaxed silhouette. Effortlessly polished for warm-weather styling.",
        price: 225,
        category: "Clothing",
        images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"],
        rating: 4.6,
        reviewCount: 67,
        stock: 8,
        badge: "New",
        seller: SELLER_ID
    },
    {
        title: "Ceramic Pour-Over Set",
        description: "Handmade ceramic pour-over coffee set. Each piece is unique, glazed in warm earth tones.",
        price: 68,
        category: "Home",
        images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80"],
        rating: 4.7,
        reviewCount: 203,
        stock: 30,
        seller: SELLER_ID
    },
    {
        title: "Suede Chelsea Boots",
        description: "Premium suede Chelsea boots with cushioned insole and durable rubber sole. A wardrobe essential.",
        price: 275,
        category: "Shoes",
        images: ["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80"],
        rating: 4.5,
        reviewCount: 156,
        stock: 6,
        badge: "Low Stock",
        seller: SELLER_ID
    },
    {
        title: "Woven Tote Bag",
        description: "Sustainably crafted woven tote in natural fibers. Spacious interior with leather handles.",
        price: 120,
        category: "Bags",
        images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80"],
        rating: 4.4,
        reviewCount: 95,
        stock: 18,
        seller: SELLER_ID
    },
    {
        title: "Brass & Marble Candle Holder",
        description: "Elegant candle holder combining brushed brass with white marble. A sculptural accent piece.",
        price: 45,
        category: "Home",
        images: ["https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&q=80"],
        rating: 4.8,
        reviewCount: 72,
        stock: 40,
        seller: SELLER_ID
    },
    {
        title: "Organic Cotton Crew Tee",
        description: "Essential crew neck tee in heavyweight organic cotton. Relaxed fit, garment-dyed for a lived-in feel.",
        price: 48,
        originalPrice: 65,
        category: "Clothing",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80"],
        rating: 4.3,
        reviewCount: 312,
        stock: 50,
        badge: "Sale",
        seller: SELLER_ID
    },
    // 12 New Products
    {
        title: "Minimalist Canvas Backpack",
        description: "Durable water-resistant canvas backpack with leather accents. Features a padded laptop sleeve.",
        price: 85,
        category: "Bags",
        images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"],
        rating: 4.7,
        reviewCount: 45,
        stock: 15,
        seller: SELLER_ID
    },
    {
        title: "Golden Link Necklace",
        description: "14k gold-plated link necklace. A sophisticated statement piece for any outfit.",
        price: 55,
        category: "Accessories",
        images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80"],
        rating: 4.9,
        reviewCount: 32,
        stock: 20,
        badge: "Fair Price",
        seller: SELLER_ID
    },
    {
        title: "Merino Wool Sweater",
        description: "Extra fine merino wool sweater. Lightweight yet exceptionally warm and soft.",
        price: 110,
        category: "Clothing",
        images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80"],
        rating: 4.8,
        reviewCount: 56,
        stock: 22,
        seller: SELLER_ID
    },
    {
        title: "Classic White Sneakers",
        description: "Versatile white leather sneakers with a clean, minimalist design. Comfortable for all-day wear.",
        price: 135,
        category: "Shoes",
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80"],
        rating: 4.6,
        reviewCount: 128,
        stock: 40,
        badge: "Bestseller",
        seller: SELLER_ID
    },
    {
        title: "Scandi Glass Vase",
        description: "Hand-blown recycled glass vase in a soft amber hue. Minimalist Scandinavian design.",
        price: 42,
        category: "Home",
        images: ["https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&q=80"],
        rating: 4.7,
        reviewCount: 18,
        stock: 12,
        seller: SELLER_ID
    },
    {
        title: "Leather Travel Wallet",
        description: "Slim leather wallet designed for travelers. Holds passport, cards, and multiple currencies.",
        price: 75,
        category: "Accessories",
        images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80"],
        rating: 4.5,
        reviewCount: 24,
        stock: 10,
        seller: SELLER_ID
    },
    {
        title: "Silk Slip Dress",
        description: "Elegant mulberry silk slip dress with adjustable straps. A versatile piece for day-to-night styling.",
        price: 165,
        category: "Clothing",
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80"],
        rating: 4.9,
        reviewCount: 42,
        stock: 7,
        badge: "Limited Edition",
        seller: SELLER_ID
    },
    {
        title: "Velvet Throw Pillow",
        description: "Plush cotton velvet throw pillow in a deep forest green. Comes with a premium down insert.",
        price: 58,
        category: "Home",
        images: ["https://images.unsplash.com/photo-1584132905271-892745fa1bd6?w=600&q=80"],
        rating: 4.8,
        reviewCount: 63,
        stock: 35,
        seller: SELLER_ID
    },
    {
        title: "Canvas Weekend Bag",
        description: "Spacious heavy-duty canvas bag with reinforced leather bottom. Ideal for short trips.",
        price: 145,
        category: "Bags",
        images: ["https://images.unsplash.com/photo-1544816153-12ad5d713312?w=600&q=80"],
        rating: 4.7,
        reviewCount: 88,
        stock: 14,
        seller: SELLER_ID
    },
    {
        title: "Denim Chore Jacket",
        description: "Traditional chore jacket in raw Japanese denim. Durable construction that ages beautifully with time.",
        price: 195,
        category: "Clothing",
        images: ["https://images.unsplash.com/photo-1551537482-f20300fe4be1?w=600&q=80"],
        rating: 4.6,
        reviewCount: 29,
        stock: 9,
        badge: "Sustainable",
        seller: SELLER_ID
    },
    {
        title: "Suede Loafers",
        description: "Elegant suede loafers with a soft leather lining. Handcrafted for maximum comfort and style.",
        price: 215,
        category: "Shoes",
        images: ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&q=80"],
        rating: 4.5,
        reviewCount: 47,
        stock: 12,
        seller: SELLER_ID
    },
    {
        title: "Bamboo Picnic Basket",
        description: "Hand-woven bamboo picnic basket with a linen lining. Includes a set of ceramic plates.",
        price: 89,
        category: "Home",
        images: ["https://images.unsplash.com/photo-1591084728795-1149f32d9866?w=600&q=80"],
        rating: 4.4,
        reviewCount: 15,
        stock: 8,
        seller: SELLER_ID
    },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        await Product.deleteMany({});
        console.log('Cleared existing products');

        await Product.insertMany(products);
        console.log('Seeded 20 sample products successfully!');

        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
