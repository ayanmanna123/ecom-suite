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
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      try {
        // Fetch specific product
        const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setProduct(data);
          
          // Fetch reviews
          const reviewsResponse = await fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${id}`);
          const reviewsData = await reviewsResponse.json();
          if (reviewsResponse.ok) {
            setReviews(reviewsData);
          }
          
          // Fetch related products (same category)
          const allResponse = await fetch(`${import.meta.env.VITE_API_URL}/products`);
          const allData = await allResponse.json();
          if (allResponse.ok) {
            const filteredRelated = allData.filter((p: Product) => 
              p.category === data.category && p._id !== data._id
            ).slice(0, 4);
            setRelated(filteredRelated);
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to leave a review.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          product: id,
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Review submitted",
          description: "Thank you for your feedback!"
        });
        setReviewComment("");
        // Refresh reviews
        const reviewsResponse = await fetch(`${import.meta.env.VITE_API_URL}/reviews/product/${id}`);
        const reviewsData = await reviewsResponse.json();
        if (reviewsResponse.ok) {
          setReviews(reviewsData);
        }
      } else {
        throw new Error(data.msg || "Failed to submit review");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setSubmittingReview(false);
    }
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div>
              <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Customer Reviews</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={i < Math.floor(product.rating) ? "fill-star text-star" : "text-muted-foreground/30"}
                    />
                  ))}
                </div>
                <span className="text-xl font-medium">{product.rating.toFixed(1)} out of 5</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8">Based on {product.reviewCount} reviews</p>

              {user ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4 bg-muted/30 p-6 rounded-sm">
                  <h3 className="font-medium">Write a Review</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="rating">Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            size={18}
                            className={star <= reviewRating ? "fill-star text-star" : "text-muted-foreground/30"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comment">Comment</Label>
                    <textarea
                      id="comment"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      placeholder="Share your thoughts about this product..."
                      className="w-full bg-background border border-border rounded-sm p-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring min-h-[100px]"
                    />
                  </div>
                  <Button type="submit" disabled={submittingReview} className="w-full rounded-sm">
                    {submittingReview ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Submit Review"}
                  </Button>
                </form>
              ) : (
                <div className="bg-muted/30 p-6 rounded-sm text-center">
                  <p className="text-sm text-muted-foreground mb-4">Please sign in to write a review.</p>
                  <Button variant="outline" className="rounded-sm" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-10">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review._id} className="border-b border-border pb-10 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary capitalize">
                          {review.user?.name?.charAt(0) || "U"}
                        </div>
                        <span className="font-medium text-sm">{review.user?.name || "Anonymous"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < review.rating ? "fill-star text-star" : "text-muted-foreground/30"}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 grayscale opacity-50">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Star size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No reviews yet for this product.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProductDetail;
