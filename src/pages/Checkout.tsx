import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import { ArrowLeft } from "lucide-react";

const Checkout = () => {
  const { items, totalPrice } = useCart();

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
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground mb-8">Checkout</h1>

            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-foreground mb-4">Contact</h2>
                <input placeholder="Email address" className="w-full bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-foreground mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="First name" className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                  <input placeholder="Last name" className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                </div>
                <input placeholder="Address" className="w-full bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground mt-3" />
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <input placeholder="City" className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                  <input placeholder="State" className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                  <input placeholder="ZIP" className="bg-muted text-foreground text-sm px-4 py-3 rounded-sm border-0 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground" />
                </div>
              </div>

              <button className="w-full bg-primary text-primary-foreground py-3 rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors mt-4">
                Place Order — ${totalPrice.toFixed(2)}
              </button>
              <p className="text-xs text-muted-foreground text-center">Payment integration requires Lovable Cloud</p>
            </div>
          </div>

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
