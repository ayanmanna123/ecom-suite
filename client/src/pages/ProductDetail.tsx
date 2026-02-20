import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Minus, Plus, ShoppingBag, Heart, Loader2 } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
import ReviewForm from "@/components/ReviewForm";

const ProductDetail = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
      const data = await response.json();
      if (response.ok) {
        setProduct(data);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${id}`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        setLoading(true);
        // Fetch specific product
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setProduct(data);
          
          // Fetch reviews
          fetchReviews();
          
          // Fetch related products (same category) using the new optimized endpoint
          const similarResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${id}/similar`);
          const similarData = await similarResponse.json();
          if (similarResponse.ok) {
            setRelated(similarData);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  const handleReviewSubmitted = () => {
    fetchReviews();
    fetchProduct(); // Refresh product to get new rating/count
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Product not found.</p>
          <Link to="/products" className="mt-4 inline-block text-primary underline underline-offset-4 text-sm">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} />
          Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted">
            <img
              src={product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center py-4">
            {product.badge && (
              <span className="inline-block w-fit bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm mb-4">
                {product.badge}
              </span>
            )}

            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{product.category}</p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.floor(product.rating) ? "fill-star text-star" : "text-muted-foreground/30"}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-display font-semibold text-foreground">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

            {/* Stock */}
            <p className="text-sm text-muted-foreground mb-6">
              {product.stock > 10 ? (
                <span className="text-success">In Stock</span>
              ) : product.stock > 0 ? (
                <span className="text-primary">Only {product.stock} left</span>
              ) : (
                <span className="text-destructive">Out of Stock</span>
              )}
            </p>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center border border-border rounded-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ShoppingBag size={16} />
                Add to Cart
              </button>

              <button className="p-3 border border-border rounded-sm text-muted-foreground hover:text-foreground transition-colors">
                <Heart size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl font-semibold text-foreground mb-8">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {related.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <section className="mt-20 border-t border-border pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-1">
              <ReviewForm productId={product._id} onReviewSubmitted={handleReviewSubmitted} />
            </div>
            <div className="lg:col-span-2">
              <ReviewSection product={product} reviews={reviews} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetail;
