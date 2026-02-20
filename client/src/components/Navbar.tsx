import { Link } from "react-router-dom";
import { Search, ShoppingBag, Heart, Menu, X, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { totalItems, setIsOpen } = useCart();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <img src="/logo.png" alt="MAISON" className="h-8 w-auto object-contain" />
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
            Home
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
          <Link to="/products" className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Search">
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
            <Link to="/profile" className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Profile">
              <User size={18} />
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

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <Link to="/" className="block text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link to="/products" className="block text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
          <Link to="/products?category=Clothing" className="block text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Clothing</Link>
          <Link to="/products?category=Accessories" className="block text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Accessories</Link>
          <Link to="/products?category=Home" className="block text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          {user?.role === 'seller' && (
            <Link to="/seller" className="block text-sm font-semibold text-primary" onClick={() => setMobileMenuOpen(false)}>Seller Hub</Link>
          )}
          
          <div className="pt-2 border-t border-border">
            {user ? (
              <Link to="/profile" className="block text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
            ) : (
              <Link to="/auth" className="block text-sm font-medium text-foreground" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
