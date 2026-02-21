import { useState, useEffect, useRef, useCallback } from "react";
import HeroSection from "@/components/HeroSection";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { Product } from "@/data/products";
import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

const Index = () => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const lastProductRef = useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loadingRecommended, setLoadingRecommended] = useState(false);

  const fetchRecommended = useCallback(async () => {
    const interestsJson = localStorage.getItem("user_interests");
    if (!interestsJson) return;

    try {
      const interests: string[] = JSON.parse(interestsJson);
      if (interests.length === 0) return;

      setLoadingRecommended(true);
      const categories = interests.join(",");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products?category=${categories}&limit=4`);
      const data = await response.json();
      if (response.ok) {
        setRecommendedProducts(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommended products:", error);
    } finally {
      setLoadingRecommended(false);
    }
  }, []);

  const fetchProducts = useCallback(async (pageNum: number) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products?page=${pageNum}&limit=8`);
      const data = await response.json();
      if (response.ok) {
        if (pageNum === 1) {
          setProductsList(data.products || []);
        } else {
          setProductsList(prev => [...prev, ...(data.products || [])]);
        }
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  useEffect(() => {
    fetchRecommended();
  }, [fetchRecommended]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <HeroSection />

      {/* Recommended for You Section */}
      {recommendedProducts.length > 0 && (
        <section className="container mx-auto px-4 lg:px-8 py-12 border-b border-border">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">Recommended for You</h2>
              <p className="text-muted-foreground text-sm mt-1">Based on your recent searches</p>
            </div>
            <Link
              to="/products"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              Explore More
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {recommendedProducts.map((product, i) => (
              <ProductCard key={`recommended-${product._id}`} product={product} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Products Grid with Infinite Scroll */}
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">Curated Picks</h2>
            <p className="text-muted-foreground text-sm mt-1">Handpicked essentials for the season</p>
          </div>
          <Link
            to="/products"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
              {productsList.map((product, i) => {
                if (productsList.length === i + 1) {
                  return (
                    <div ref={lastProductRef} key={product._id}>
                      <ProductCard product={product} index={i} />
                    </div>
                  );
                } else {
                  return <ProductCard key={product._id} product={product} index={i} />;
                }
              })}
            </div>

            {loadingMore && (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            )}
            
            {!hasMore && productsList.length > 0 && (
              <p className="text-center text-muted-foreground text-sm mt-12">
                You've seen all our current picks.
              </p>
            )}
          </>
        )}

        <Link
          to="/products"
          className="sm:hidden flex items-center justify-center gap-1.5 text-sm font-medium text-foreground mt-8 hover:text-primary transition-colors"
        >
          View All Products <ArrowRight size={14} />
        </Link>
      </section>

      {/* Banner */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 lg:px-8 py-16 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Our Promise</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Ethically sourced. Thoughtfully made.
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed text-sm">
            Every piece in our collection is crafted with intention — from responsibly sourced materials
            to artisan partnerships that honor traditional craftsmanship.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <img src="/logo.svg" alt="MAISON" className="h-16 w-auto object-contain mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                Curating beautiful objects for thoughtful living.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Shop</h4>
              <div className="space-y-2">
                <Link to="/products" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">All Products</Link>
                <Link to="/products?category=Clothing" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Clothing</Link>
                <Link to="/products?category=Accessories" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Accessories</Link>
                <Link to="/products?category=Home" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Company</h4>
              <div className="space-y-2">
                <span className="block text-sm text-muted-foreground">About</span>
                <span className="block text-sm text-muted-foreground">Sustainability</span>
                <span className="block text-sm text-muted-foreground">Careers</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">Support</h4>
              <div className="space-y-2">
                <span className="block text-sm text-muted-foreground">Contact</span>
                <span className="block text-sm text-muted-foreground">Shipping</span>
                <span className="block text-sm text-muted-foreground">Returns</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-6 text-center">
            <p className="text-xs text-muted-foreground">© 2026 MAISON. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
