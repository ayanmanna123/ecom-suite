import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const API_URL = 'http://localhost:5000/api';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      toast({
        title: "Please sign in",
        description: "You must be logged in to place an order.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          title: item.product.title,
          quantity: item.quantity,
          priceAtPurchase: item.product.price,
          image: item.product.images[0]
        })),
        totalAmount: totalPrice,
        shippingAddress: {
          fullName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip
        }
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      toast({
        title: "Order Placed!",
        description: "Your order has been successfully processed.",
      });
      clearCart();
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty.</p>
          <Link to="/products" className="text-sm text-primary underline underline-offset-4">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Continue Shopping
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <form onSubmit={handlePlaceOrder}>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-8">Checkout</h1>

            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-4">Contact</h2>
                <input 
                  name="email"
                  placeholder="Email address" 
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" 
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-foreground mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    name="firstName"
                    placeholder="First name" 
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" 
                  />
                  <input 
                    name="lastName"
                    placeholder="Last name" 
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" 
                  />
                </div>
                <input 
                  name="address"
                  placeholder="Address" 
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground mt-3" 
                />
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <input 
                    name="city"
                    placeholder="City" 
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" 
                  />
                  <input 
                    name="state"
                    placeholder="State" 
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" 
                  />
                  <input 
                    name="zip"
                    placeholder="ZIP" 
                    value={formData.zip}
                    onChange={handleChange}
                    required
                    className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground py-3 rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors mt-4 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                Place Order — ${totalPrice.toFixed(2)}
              </button>
              <p className="text-xs text-muted-foreground text-center">Managed by your custom MERN backend</p>
            </div>
          </form>

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-sm p-6 h-fit">
            <h2 className="text-sm font-semibold text-foreground mb-6">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-3">
                  <img src={item.product.images[0]} alt={item.product.title} className="w-14 h-16 object-cover rounded-sm bg-muted" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.product.title}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium text-foreground">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border"><span>Total</span><span className="font-display text-lg">${totalPrice.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
