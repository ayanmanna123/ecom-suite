import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Package, Plus, Edit, Trash2, Loader2, PackageOpen, TrendingUp, ShoppingBag, AlertTriangle } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

interface Product {
  _id: string;
  title: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SellerDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate("/auth");
      return;
    }

    Promise.all([fetchProducts(), fetchAnalytics()]).finally(() => setLoading(false));
  }, [user, navigate]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/orders/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/seller`, {
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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/products/${id}`, {
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

  const summary = analytics?.summary || { totalRevenue: 0, totalOrders: 0, activeOrders: 0 };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="font-display text-4xl font-semibold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Monitor performance and manage your inventory.</p>
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

        {/* Summary Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</span>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <span className="text-3xl font-semibold">₹{summary.totalRevenue.toFixed(2)}</span>
          </div>
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Orders</span>
              <ShoppingBag size={16} className="text-blue-500" />
            </div>
            <span className="text-3xl font-semibold">{summary.totalOrders}</span>
          </div>
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Orders</span>
              <Package size={16} className="text-amber-500" />
            </div>
            <span className="text-3xl font-semibold">{summary.activeOrders}</span>
          </div>
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Low Stock Items</span>
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <span className="text-3xl font-semibold">{analytics?.lowStockItems?.length || 0}</span>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Sales Over Time */}
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm h-[400px]">
            <h3 className="text-lg font-medium mb-6">Sales Revenue (Last 30 Days)</h3>
            <div className="h-[300px] w-full">
              {analytics?.salesOverTime?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.salesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="_id" 
                      tick={{fontSize: 12}} 
                      tickFormatter={(value) => value.split('-').slice(1).join('/')}
                    />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Revenue']}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No sales data available for this period
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm h-[400px]">
            <h3 className="text-lg font-medium mb-6">Sales by Category</h3>
            <div className="h-[300px] w-full">
              {analytics?.categoryBreakdown?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="sales"
                      nameKey="_id"
                    >
                      {analytics.categoryBreakdown.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      formatter={(value: any) => [`₹${value.toFixed(2)}`, 'Sales']}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No category data available
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Levels Bar Chart */}
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm h-[400px] md:col-span-2">
            <h3 className="text-lg font-medium mb-6">Inventory Status (Low Stock Items)</h3>
            <div className="h-[300px] w-full">
              {analytics?.lowStockItems?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.lowStockItems}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="title" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Bar dataKey="stock" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  All items are well-stocked. Great job!
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">All Products</h2>
            <span className="text-sm text-muted-foreground">{products.length} products listed</span>
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
            <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
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
