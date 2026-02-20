import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";

const EditProduct = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    category: "",
    stock: "",
    badge: "",
    imageUrl: ""
  });

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate("/auth");
      return;
    }

    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        const data = await response.json();
        
        if (response.ok) {
          setFormData({
            title: data.title,
            description: data.description,
            price: data.price.toString(),
            originalPrice: data.originalPrice ? data.originalPrice.toString() : "",
            category: data.category,
            stock: data.stock.toString(),
            badge: data.badge || "",
            imageUrl: data.images[0] || ""
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.msg || "Failed to fetch product",
          });
          navigate("/seller");
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchProduct();
  }, [id, user, navigate, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        stock: parseInt(formData.stock),
        images: formData.imageUrl ? [formData.imageUrl] : []
      };

      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully!",
        });
        navigate("/seller");
      } else {
        throw new Error(data.msg || "Failed to update product");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Link 
          to="/seller" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to dashboard
        </Link>

        <div className="mb-10">
          <h1 className="font-display text-3xl font-semibold mb-2">Edit Product</h1>
          <p className="text-muted-foreground">Update the details of your product.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-card border border-border rounded-sm p-8 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                placeholder="Ex: Minimalist Leather Watch"
                value={formData.title}
                onChange={handleChange}
                required
                className="rounded-sm"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Ex: Accessories"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge">Badge (Optional)</Label>
                <Input
                  id="badge"
                  placeholder="Ex: New Arrival, Sale"
                  value={formData.badge}
                  onChange={handleChange}
                  className="rounded-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your product in detail..."
                value={formData.description}
                onChange={handleChange}
                required
                className="rounded-sm min-h-[120px]"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className="rounded-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Initial Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  className="rounded-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Product Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={handleChange}
                required
                className="rounded-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">Provide a direct link to a high-quality product image.</p>
            </div>
            
            {formData.imageUrl && (
              <div className="mt-4 relative w-40 h-40 bg-muted rounded-sm overflow-hidden border border-border">
                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setFormData(p => ({...p, imageUrl: ""}))}
                  className="absolute top-1 right-1 bg-background/80 p-1 rounded-full hover:bg-background transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/seller")}
              className="rounded-sm px-8"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="rounded-sm px-10 gap-2"
              disabled={loading}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProduct;
