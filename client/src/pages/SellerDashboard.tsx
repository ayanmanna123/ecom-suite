import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Package, Plus, Edit, Trash2, Loader2, PackageOpen } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

const SellerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate("/auth");
      return;
    }

    Promise.all([fetchProducts(), fetchOrders()]).finally(() => setLoading(false));
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders/seller", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders for analytics:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products/seller", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      } else {
        throw new Error(data.error || "Failed to fetch products");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const calculateMetrics = () => {
    const activeProducts = products.length;
    
    let totalRevenue = 0;
    let pendingItems = 0;

    orders.forEach(order => {
      order.items.forEach((item: any) => {
        if (item.sellerId === user?._id) {
          if (item.status !== 'cancelled') {
            totalRevenue += item.priceAtPurchase * item.quantity;
          }
          if (item.status === 'pending' || !item.status) {
            pendingItems++;
          }
        }
      });
    });

    return { activeProducts, totalRevenue, pendingItems };
  };

  const metrics = calculateMetrics();

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully.",
        });
        setProducts(products.filter(p => p._id !== id));
      } else {
        const data = await response.json();
        throw new Error(data.msg || "Failed to delete product");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="font-display text-4xl font-semibold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your product inventory and sales.</p>
          </div>
          <div className="flex gap-4">
            <Button 
                variant="outline"
                onClick={() => navigate("/seller/orders")}
                className="rounded-sm py-6 px-8"
            >
                View Orders
            </Button>
            <Button 
                onClick={() => navigate("/seller/add-product")}
                className="rounded-sm gap-2 py-6 px-8"
            >
                <Plus size={18} />
                Add New Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Total Revenue</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-semibold">₹{metrics.totalRevenue.toFixed(2)}</span>
              <span className="text-xs text-green-600 font-medium">+12% from last month</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Active Products</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-semibold">{metrics.activeProducts}</span>
              <span className="text-xs text-muted-foreground">Listings online</span>
            </div>
          </div>
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Pending Items</span>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-semibold">{metrics.pendingItems}</span>
              <span className="text-xs text-amber-600 font-medium">Require shipping</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card border border-border rounded-sm p-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
              <PackageOpen className="text-muted-foreground" size={32} />
            </div>
            <h2 className="text-xl font-medium mb-2">No products found</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              You haven't added any products to your store yet. Start selling by adding your first product.
            </p>
            <Button 
              variant="outline" 
              onClick={() => navigate("/seller/add-product")}
              className="rounded-sm"
            >
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="bg-card border border-border rounded-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="p-4 font-medium text-sm">Product</th>
                    <th className="p-4 font-medium text-sm">Category</th>
                    <th className="p-4 font-medium text-sm">Price</th>
                    <th className="p-4 font-medium text-sm">Stock</th>
                    <th className="p-4 font-medium text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-sm flex-shrink-0 overflow-hidden">
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-full h-full p-3 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium text-sm truncate max-w-[200px]">{product.title}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground capitalize">{product.category}</td>
                      <td className="p-4 text-sm font-medium">₹{product.price.toFixed(2)}</td>
                      <td className="p-4 text-sm">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          product.stock > 10 ? 'bg-green-100 text-green-700' : 
                          product.stock > 0 ? 'bg-amber-100 text-amber-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} in stock
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => navigate(`/seller/edit-product/${product._id}`)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(product._id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
