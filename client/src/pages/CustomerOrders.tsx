import { useNavigate, Navigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Package, ArrowLeft, Loader2, Calendar, CreditCard, ChevronRight, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DeliveryTimeline from "@/components/DeliveryTimeline";

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[];
  statusHistory?: any[];
  trackingInfo?: {
    carrier: string;
    trackingNumber: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CustomerOrders = () => {
  const { user, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetch(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(err => console.error('Failed to fetch orders:', err))
      .finally(() => setOrdersLoading(false));
    }
  }, [token]);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-display uppercase tracking-widest text-sm">MAISON</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/profile" 
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Account
          </Link>

          <header className="mb-12 border-b border-border pb-8">
            <h1 className="font-display text-3xl font-semibold flex items-center gap-3">
              <Package size={28} strokeWidth={1.5} />
              My Orders
            </h1>
            <p className="text-muted-foreground mt-2">View and track all your orders.</p>
          </header>

          <div className="space-y-6">
            {ordersLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="animate-spin text-muted-foreground" size={32} />
                <p className="text-sm text-muted-foreground italic">Fetching your order history...</p>
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border border-border rounded-sm p-5 md:p-8 bg-card/50 hover:bg-card transition-all duration-300 group">
                    <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] bg-muted px-2 py-1 rounded-sm border border-border">
                                {new Date(order.createdAt).getFullYear()}
                            </div>
                            <h2 className="text-sm font-mono font-medium text-foreground/70">#{order._id}</h2>
                        </div>
                        <div className="flex flex-wrap gap-8 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar size={14} />
                            <span>{new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-foreground font-medium">
                            <CreditCard size={14} className="text-muted-foreground" />
                            <span>₹{order.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm border ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-100' :
                          order.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {order.status || 'processing'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="flex flex-wrap gap-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="relative group/item">
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="h-20 w-16 object-cover rounded-sm bg-muted border border-border hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
                                {item.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <button className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                                        <Truck size={14} /> Track Order
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle className="font-display uppercase tracking-widest">Delivery Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="mt-4">
                                        <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-sm border border-border">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Order ID</p>
                                                <p className="text-sm font-mono font-medium">#{order._id}</p>
                                            </div>
                                            {order.trackingInfo?.trackingNumber && (
                                                <div className="text-right">
                                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{order.trackingInfo.carrier}</p>
                                                    <p className="text-sm font-medium">{order.trackingInfo.trackingNumber}</p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <DeliveryTimeline 
                                            history={order.statusHistory || [
                                                { status: order.status, timestamp: order.createdAt, message: 'Order status: ' + order.status }
                                            ]} 
                                            currentStatus={order.status} 
                                        />
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <button className="text-xs font-semibold uppercase tracking-widest flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group-hover:translate-x-1 duration-300">
                                View Details <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-dashed border-border rounded-sm bg-muted/20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package size={32} className="text-muted-foreground" strokeWidth={1} />
                </div>
                <h2 className="text-lg font-medium mb-2">No orders found</h2>
                <p className="text-muted-foreground text-sm mb-8">It looks like you haven't placed any orders yet.</p>
                <Link 
                    to="/products" 
                    className="inline-flex items-center justify-center h-11 px-8 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all"
                >
                    Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 text-center border-t border-border">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">© 2026 MAISON. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CustomerOrders;
