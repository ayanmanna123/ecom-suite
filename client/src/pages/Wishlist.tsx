import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Heart, Loader2, ShoppingBag } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/products";

const Wishlist = () => {
  const { token } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setWishlistProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-2 mb-12 text-center md:text-left">
            <h1 className="text-4xl font-display font-semibold">Your Wishlist</h1>
            <p className="text-muted-foreground">Products you've saved for later.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : !token ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-sm">
                <Heart size={48} className="text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground mb-2">Sign in to view wishlist</h3>
                <p className="text-muted-foreground text-sm max-w-xs text-center mb-6">
                    You need to be logged in to save and view your favorite products.
                </p>
                <Link to="/auth">
                    <button className="bg-primary text-primary-foreground px-6 py-2 rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors">
                        Sign In
                    </button>
                </Link>
          </div>
        ) : wishlistProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {wishlistProducts.map((product, i) => (
              <ProductCard key={product._id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-sm">
            <Heart size={48} className="text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground text-sm max-w-xs text-center mb-6">
              Looks like you haven't saved any products yet.
            </p>
            <Link to="/products">
                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <ShoppingBag size={16} />
                    Explore Products
                </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
