import Navbar from "@/components/Navbar";
import { MapPin, ArrowLeft, Plus, Trash2, Loader2, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = 'http://localhost:5000/api';

interface Address {
  _id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
}

const Addresses = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    isDefault: false
  });

  useEffect(() => {
    if (token) {
      fetchAddresses();
    }
  }, [token]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${API_URL}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setAddresses(data);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        setAddresses(data);
        setShowForm(false);
        setFormData({
          firstName: "",
          lastName: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          isDefault: false
        });
        toast({ title: "Address Saved", description: "Your shipping address has been added successfully." });
      } else {
        throw new Error(data.message || 'Failed to save address');
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        toast({ title: "Address Deleted" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete address", variant: "destructive" });
    }
  };

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
            Back to Profile
          </Link>
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-border pb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold flex items-center gap-3">
                <MapPin size={28} strokeWidth={1.5} />
                My Addresses
              </h1>
              <p className="text-muted-foreground mt-2">Manage your shipping and billing addresses.</p>
            </div>
            {!showForm && addresses.length > 0 && (
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 rounded-sm">
                <Plus size={16} /> Add New Address
              </Button>
            )}
          </header>

          {showForm ? (
            <div className="bg-card border border-border rounded-sm p-8 max-w-2xl mx-auto">
              <h2 className="text-lg font-medium mb-6">Add New Address</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address line</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" name="zip" value={formData.zip} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isDefault" 
                    name="isDefault" 
                    checked={formData.isDefault} 
                    onChange={handleInputChange}
                    className="rounded-sm border-border text-primary focus:ring-primary"
                  />
                  <Label htmlFor="isDefault" className="text-sm font-normal">Set as default shipping address</Label>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={saving} className="flex-1 rounded-sm">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Address
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="px-8 rounded-sm">Cancel</Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-muted-foreground" />
                </div>
              ) : addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((addr) => (
                    <div key={addr._id} className={`border rounded-sm p-6 relative group ${addr.isDefault ? 'border-foreground' : 'border-border'}`}>
                      {addr.isDefault && (
                        <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest bg-foreground text-background px-2 py-0.5 rounded-sm flex items-center gap-1">
                          <Check size={10} /> Default
                        </span>
                      )}
                      <h3 className="font-medium text-lg mb-2">{addr.firstName} {addr.lastName}</h3>
                      <p className="text-sm text-foreground">{addr.address}</p>
                      <p className="text-sm text-foreground">{addr.city}, {addr.state} {addr.zip}</p>
                      <button 
                        onClick={() => deleteAddress(addr._id)}
                        className="mt-6 text-xs text-destructive hover:underline flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} /> Remove address
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border border-dashed border-border rounded-sm">
                  <p className="text-muted-foreground">You haven't added any addresses yet.</p>
                  <Button onClick={() => setShowForm(true)} className="mt-4 px-6 rounded-sm">
                    Add New Address
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <footer className="mt-20 py-12 text-center border-t border-border text-muted-foreground text-xs">
        © 2026 MAISON. All rights reserved.
      </footer>
    </div>
  );
};

export default Addresses;
