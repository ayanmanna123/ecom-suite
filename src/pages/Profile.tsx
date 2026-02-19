import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { User, LogOut, Package, MapPin, Heart, Settings, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: any[];
}

const API_URL = 'http://localhost:5000/api';

const Profile = () => {
  const { user, token, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
    return <div className="min-h-screen bg-background flex items-center justify-center font-display">MAISON</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border pb-12">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                <User size={40} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="font-display text-3xl font-semibold mb-1 text-foreground">My Account</h1>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                {user.name && <p className="text-sm font-medium mt-1">{user.name}</p>}
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-fit flex items-center gap-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/5 border-border rounded-sm px-6"
            >
              <LogOut size={14} />
              Sign Out
            </Button>
          </header>

          <div className="space-y-12">
            <section>
              <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
                <Package size={20} />
                Recent Orders
              </h2>
              
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="border border-border rounded-sm p-4 md:p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-wrap justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Order ID</p>
                          <p className="text-sm font-mono font-medium">{order._id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Date</p>
                          <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total</p>
                          <p className="text-sm font-semibold">${order.totalAmount.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex flex-col items-center gap-1.5">
                            <div className="relative">
                              <img 
                                src={item.image} 
                                alt={item.title} 
                                className="h-12 w-10 object-cover rounded-sm bg-muted border border-border/50"
                              />
                            </div>
                            <span className={`text-[8px] font-bold uppercase tracking-tighter px-1 py-0.5 rounded-sm ${
                              item.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              item.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {item.status || 'pending'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-sm">
                  <p className="text-muted-foreground text-sm">No orders found yet.</p>
                  <Link to="/products" className="text-xs text-primary underline underline-offset-4 mt-2 inline-block">Start Shopping</Link>
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="flex flex-col items-center gap-3 p-6 border border-border rounded-sm hover:border-foreground/20 hover:bg-muted/30 transition-all text-center group">
                <div className="p-3 rounded-sm bg-muted text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">Addresses</h3>
                </div>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 border border-border rounded-sm hover:border-foreground/20 hover:bg-muted/30 transition-all text-center group">
                <div className="p-3 rounded-sm bg-muted text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                  <Heart size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">Wishlist</h3>
                </div>
              </button>
              <button className="flex flex-col items-center gap-3 p-6 border border-border rounded-sm hover:border-foreground/20 hover:bg-muted/30 transition-all text-center group">
                <div className="p-3 rounded-sm bg-muted text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                  <Settings size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">Settings</h3>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 text-center border-t border-border">
        <p className="text-xs text-muted-foreground">© 2026 MAISON. All rights reserved.</p>
      </footer>
    </div>
  );
};

const Link = ({ to, children, className }: { to: string, children: React.ReactNode, className?: string }) => (
  <a href={to} className={className} onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', to); window.dispatchEvent(new PopStateEvent('popstate')); }}>
    {children}
  </a>
);

export default Profile;
