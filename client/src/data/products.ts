export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: string;
  seller?: any;
}

export const categories = [
  "All",
  "Bags",
  "Accessories",
  "Clothing",
  "Shoes",
  "Home",
];

export const products: Product[] = [
  {
    _id: "1",
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
  },
  {
    _id: "2",
    title: "Cashmere Wool Scarf",
    description: "Ultra-soft cashmere blend scarf in a versatile neutral tone. Perfect for layering in any season.",
    price: 95,
    category: "Accessories",
    images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80"],
    rating: 4.9,
    reviewCount: 89,
    stock: 25,
  },
  {
    _id: "3",
    title: "Linen Relaxed Blazer",
    description: "Breathable linen blazer with a relaxed silhouette. Effortlessly polished for warm-weather styling.",
    price: 225,
    category: "Clothing",
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&q=80"],
    rating: 4.6,
    reviewCount: 67,
    stock: 8,
    badge: "New",
  },
  {
    _id: "4",
    title: "Ceramic Pour-Over Set",
    description: "Handmade ceramic pour-over coffee set. Each piece is unique, glazed in warm earth tones.",
    price: 68,
    category: "Home",
    images: ["https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80"],
    rating: 4.7,
    reviewCount: 203,
    stock: 30,
  },
  {
    _id: "5",
    title: "Suede Chelsea Boots",
    description: "Premium suede Chelsea boots with cushioned insole and durable rubber sole. A wardrobe essential.",
    price: 275,
    category: "Shoes",
    images: ["https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=600&q=80"],
    rating: 4.5,
    reviewCount: 156,
    stock: 6,
    badge: "Low Stock",
  },
  {
    _id: "6",
    title: "Woven Tote Bag",
    description: "Sustainably crafted woven tote in natural fibers. Spacious interior with leather handles.",
    price: 120,
    category: "Bags",
    images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80"],
    rating: 4.4,
    reviewCount: 95,
    stock: 18,
  },
  {
    _id: "7",
    title: "Brass & Marble Candle Holder",
    description: "Elegant candle holder combining brushed brass with white marble. A sculptural accent piece.",
    price: 45,
    category: "Home",
    images: ["https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&q=80"],
    rating: 4.8,
    reviewCount: 72,
    stock: 40,
  },
  {
    _id: "8",
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
  },
];
