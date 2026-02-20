import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, ShoppingBag, Heart, Menu, X, User, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Get search from URL
  const searchParams = new URLSearchParams(location.search);
  const searchFromUrl = searchParams.get("search") || "";
  
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [suggestions, setSuggestions] = useState<{ title: string; category: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state with URL when it changes
  useEffect(() => {
    setSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${baseUrl}/products/suggestions?q=${searchQuery}`);
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 -ml-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="MAISON" className="h-14 w-auto object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Shop
          </Link>
          <Link to="/products?category=Clothing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Clothing
          </Link>
          <Link to="/products?category=Accessories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Accessories
          </Link>
          <Link to="/products?category=Home" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home Decor
          </Link>
          {user?.role === 'seller' && (
            <>
              <Link to="/seller" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                Seller Hub
              </Link>
              <Link to="/seller/orders" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                Orders
              </Link>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                className="w-48 lg:w-64 h-9 bg-muted/50 border border-transparent focus:border-primary/20 focus:bg-background transition-all rounded-full px-4 pr-10 text-sm focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 left-0 w-full bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="py-2">
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(item.title);
                        setShowSuggestions(false);
                        navigate(`/products?category=${item.category}&search=${item.title}`);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex flex-col"
                    >
                      <span className="text-sm font-medium">{item.title}</span>
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link to="/products" className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
            <Search size={18} />
          </Link>
          <Link to="/wishlist" className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Wishlist">
            <Heart size={18} />
          </Link>
          <button
            className="p-2 text-muted-foreground hover:text-foreground transition-colors relative"
            onClick={() => setIsOpen(true)}
            aria-label="Cart"
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
          
          <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block"></div>

          {user ? (
            <Link to="/profile" className="flex items-center gap-2 p-1 hover:bg-muted rounded-full transition-colors" aria-label="Profile">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name || 'User'} 
                  className="w-8 h-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                  <User size={18} className="text-muted-foreground" />
                </div>
              )}
            </Link>
          ) : (
            <Link 
              to="/auth" 
              className="text-sm font-medium text-foreground hover:text-primary transition-colors ml-2"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm lg:hidden" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          
          {/* Drawer */}
          <div className="fixed left-0 top-0 z-50 h-full w-[280px] bg-background border-r border-border animate-slide-in-left flex flex-col lg:hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <img src="/logo.png" alt="MAISON" className="h-10 w-auto object-contain" />
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Categories</p>
                <nav className="flex flex-col gap-4">
                  <Link to="/" className="text-base font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                  <Link to="/products" className="text-base font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
                  <Link to="/products?category=Clothing" className="text-base font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Clothing</Link>
                  <Link to="/products?category=Accessories" className="text-base font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Accessories</Link>
                  <Link to="/products?category=Home" className="text-base font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Home Decor</Link>
                </nav>
              </div>

              {user?.role === 'seller' && (
                <div className="pt-6 border-t border-border space-y-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Seller Hub</p>
                  <nav className="flex flex-col gap-4">
                    <Link to="/seller" className="text-base font-semibold text-primary" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                    <Link to="/seller/orders" className="text-base font-semibold text-primary" onClick={() => setMobileMenuOpen(false)}>Manage Orders</Link>
                  </nav>
                </div>
              )}
              
              <div className="pt-6 border-t border-border space-y-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Account</p>
                <nav className="flex flex-col gap-4">
                  {user ? (
                    <>
                      <Link to="/profile" className="text-base font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                      <Link to="/orders" className="text-base font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                      <Link to="/wishlist" className="text-base font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
                    </>
                  ) : (
                    <Link to="/auth" className="text-base font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Sign In / Register</Link>
                  )}
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
