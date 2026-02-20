import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Package, ArrowLeft, Loader2, CheckCircle, Clock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const SellerOrders = () => {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/seller`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch seller orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSellerOrders();
    }
  }, [token]);

  const handleStatusUpdate = async (orderId: string, productId: string, status: string) => {
    setUpdatingId(`${orderId}-${productId}`);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/${orderId}/item/${productId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: "Item status has been successfully updated.",
        });
        // Update local state
        setOrders(prev => prev.map(order => {
          if (order._id === orderId) {
            return {
              ...order,
              items: order.items.map((item: any) => 
                item.productId === productId ? { ...item, status } : item
              )
            };
          }
          return order;
        }));
      } else {
        const data = await response.json();
        throw new Error(data.msg || "Failed to update status");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/seller"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-display font-semibold">Seller Orders</h1>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-muted/30 border border-border rounded-sm overflow-hidden"
              >
                <div className="p-4 border-b border-border flex flex-wrap justify-between items-center gap-4 bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Order ID</span>
                      <span className="text-sm font-medium">#{order._id.slice(-8)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Date</span>
                      <span className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="hidden sm:flex flex-col">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Status</span>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {order.status === 'delivered' ? (
                          <CheckCircle size={14} className="text-green-500" />
                        ) : (
                          <Clock size={14} className="text-amber-500" />
                        )}
                        <span className="text-xs font-medium capitalize">{order.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Order Total</span>
                    <span className="text-sm font-bold text-primary">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Your Items in this Order</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items
                      .filter((item: any) => item.sellerId === user?._id)
                      .map((item: any, i: number) => (
                        <div key={i} className="flex flex-col gap-3 bg-background p-3 rounded-sm border border-border/50">
                          <div className="flex gap-4 items-center">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded-sm bg-muted"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{item.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ₹{item.priceAtPurchase.toFixed(2)}
                              </p>
                              <div className="mt-1 flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm ${
                                  item.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  item.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {item.status || 'pending'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 border-t border-border pt-3">
                            <select 
                              className="flex-1 bg-muted text-xs border-0 rounded-sm px-2 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                              defaultValue={item.status || 'pending'}
                              id={`status-${order._id}-${item.productId}`}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <Button 
                              size="sm" 
                              className="h-8 rounded-sm gap-1.5 px-3"
                              disabled={updatingId === `${order._id}-${item.productId}`}
                              onClick={() => {
                                const select = document.getElementById(`status-${order._id}-${item.productId}`) as HTMLSelectElement;
                                handleStatusUpdate(order._id, item.productId, select.value);
                              }}
                            >
                              {updatingId === `${order._id}-${item.productId}` ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Save size={12} />
                              )}
                              Update
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="p-4 border-t border-border bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Shipping To</h3>
                      <p className="text-sm font-medium">{order.shippingAddress.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border rounded-sm">
            <Package size={48} className="text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground text-sm max-w-xs text-center">
              When customers purchase your products, they will appear here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerOrders;
