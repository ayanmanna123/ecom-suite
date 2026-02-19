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
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, pct: number} | null>(null);

  const discountedTotal = totalPrice - (totalPrice * (discount / 100));


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

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) return;
    setCouponLoading(true);
    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Invalid coupon');
      
      setDiscount(data.discountPercentage);
      setAppliedCoupon({ code: data.code, pct: data.discountPercentage });
      toast({ title: "Coupon Applied!", description: `${data.discountPercentage}% discount added.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create Razorpay Order on Backend
      const payResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: discountedTotal,
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      });

      const rzpOrder = await payResponse.json();
      if (!payResponse.ok) throw new Error('Payment initialization failed');

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: 'rzp_test_placeholder', // Should come from .env/config
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: 'Ecom-Suite',
        description: 'Order Payment',
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          // 3. Verify Payment and Place Order
          try {
            const verifyResponse = await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyResponse.ok) throw new Error('Payment verification failed');

            // 4. Save Order to Database
            const orderData = {
              items: items.map(item => ({
                productId: item.product._id,
                sellerId: item.product.seller?._id || item.product.seller,
                title: item.product.title,
                quantity: item.quantity,
                priceAtPurchase: item.product.price,
                image: item.product.images[0]
              })),
              totalAmount: discountedTotal,
              shippingAddress: {
                fullName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip
              }
            };

            const orderResponse = await fetch(`${API_URL}/orders`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              },
              body: JSON.stringify(orderData)
            });

            if (!orderResponse.ok) throw new Error('Order creation failed');

            toast({ title: "Order Success!", description: "Your order has been placed successfully." });
            clearCart();
            navigate(user ? "/profile" : "/");
          } catch (err: any) {
            toast({ title: "Payment Error", description: err.message, variant: "destructive" });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        },
        theme: { color: '#000000' }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
                Place Order — ${discountedTotal.toFixed(2)}
              </button>
              <p className="text-xs text-muted-foreground text-center">Managed by your custom MERN backend</p>
            </div>
          </form>

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-sm p-6 h-fit">
            <h2 className="text-sm font-semibold text-foreground mb-6">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product._id} className="flex gap-3">
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
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600"><span className="font-medium">Discount ({discount}%)</span><span>-${(totalPrice * (discount / 100)).toFixed(2)}</span></div>
              )}
              <div className="pt-4 border-t border-border">
                <div className="flex gap-2">
                  <input 
                    placeholder="Promo code" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 bg-background text-foreground text-sm px-3 py-2 rounded-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button 
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !promoCode}
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-sm text-xs font-medium hover:bg-secondary/80 disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
                {appliedCoupon && (
                  <p className="text-[10px] text-green-600 mt-1.5 flex justify-between items-center">
                    <span>Applied: {appliedCoupon.code}</span>
                    <button onClick={() => { setDiscount(0); setAppliedCoupon(null); setPromoCode(""); }} className="underline">Remove</button>
                  </p>
                )}
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border"><span>Total</span><span className="font-display text-lg">${discountedTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
