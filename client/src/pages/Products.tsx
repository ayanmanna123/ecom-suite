import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { Product, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { Slider } from "@/components/ui/slider";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || "All";
  const searchParam = searchParams.get("search") || "";
  const sortParam = searchParams.get("sort") || "featured";
  
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (sortBy !== "featured") params.append("sort", sortBy);
      if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString());
      if (priceRange[1] < 1000) params.append("maxPrice", priceRange[1].toString());

      const response = await fetch(`${import.meta.env.VITE_API_URL}/products?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setProductsList(data.products || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy, priceRange]);

  // Handle debounced search/price changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Sync URL params to State (Immediate)
  useEffect(() => {
    if (categoryParam !== selectedCategory) setSelectedCategory(categoryParam);
    if (searchParam !== searchQuery) setSearchQuery(searchParam);
    if (sortParam !== sortBy) setSortBy(sortParam);
  }, [categoryParam, searchParam, sortParam]);

  // Sync State to URL (Debounced to avoid jitter)
  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      let changed = false;

      if (selectedCategory === "All") {
        if (params.has("category")) { params.delete("category"); changed = true; }
      } else if (params.get("category") !== selectedCategory) {
        params.set("category", selectedCategory);
        changed = true;
      }

      if (!searchQuery) {
        if (params.has("search")) { params.delete("search"); changed = true; }
      } else if (params.get("search") !== searchQuery) {
        params.set("search", searchQuery);
        changed = true;
      }

      if (sortBy === "featured") {
        if (params.has("sort")) { params.delete("sort"); changed = true; }
      } else if (params.get("sort") !== sortBy) {
        params.set("sort", sortBy);
        changed = true;
      }

      if (changed) {
        setSearchParams(params, { replace: true });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [selectedCategory, searchQuery, sortBy, setSearchParams]);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="container mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground mb-2">Shop</h1>
          <p className="text-muted-foreground text-sm">
            {productsList.length} product{productsList.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          {/* Sidebar Filters */}
          <aside className={`w-full lg:w-64 space-y-8 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Search */}
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Search</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted text-foreground text-sm pl-9 pr-4 py-2.5 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Categories</h3>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`text-left text-sm py-1 transition-colors ${
                      selectedCategory === cat
                        ? "text-foreground font-semibold underline underline-offset-4"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider">Price Range</h3>
                <span className="text-xs text-muted-foreground">${priceRange[0]} - ${priceRange[1]}</span>
              </div>
              <Slider
                defaultValue={[0, 1000]}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={(val) => setPriceRange(val as [number, number])}
                className="py-4"
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Toggle & Sort */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex lg:hidden items-center gap-2 px-4 py-2 bg-muted text-sm text-foreground rounded-sm hover:bg-accent transition-colors"
              >
                <SlidersHorizontal size={14} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground hidden sm:block">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-foreground text-sm px-2 py-1 rounded-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest Arrival</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-primary" size={40} />
              </div>
            ) : productsList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-8">
                {productsList.map((product, i) => (
                  <ProductCard key={product._id} product={product} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">No products found matching your criteria.</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setPriceRange([0, 1000]); }}
                  className="mt-3 text-sm text-primary underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Products;
