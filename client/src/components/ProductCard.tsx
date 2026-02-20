import { Star, Heart, Loader2 } from "lucide-react";
import { Product } from "@/data/products";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { addItem } = useCart();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please log in to add products to your wishlist.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoadingWishlist(true);
    try {
      const response = await fetch(`http://localhost:5000/api/wishlist/${product._id}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setIsWishlisted(data.isWishlisted);
        toast({
          title: data.isWishlisted ? "Added to wishlist" : "Removed from wishlist",
        });
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    } finally {
      setLoadingWishlist(false);
    }
  };

  return (
    <div
      className="group opacity-0 animate-fade-in"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-muted mb-3">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
              {product.badge}
            </span>
          )}
          <button
            onClick={handleWishlistToggle}
            disabled={loadingWishlist}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 text-muted-foreground hover:text-primary transition-colors backdrop-blur-sm"
          >
            {loadingWishlist ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Heart size={16} className={isWishlisted ? "fill-primary text-primary" : ""} />
            )}
          </button>
          <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product);
              }}
              className="w-full bg-foreground/90 text-background text-xs font-medium py-2.5 rounded-sm backdrop-blur-sm hover:bg-foreground transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
      <Link to={`/product/${product._id}`}>
        <h3 className="text-sm font-medium text-foreground mb-1">{product.title}</h3>
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.floor(product.rating) ? "fill-star text-star" : "text-muted-foreground/30"}
              />
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">${product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
