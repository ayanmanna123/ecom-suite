import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { Loader2, ShoppingBag, Store } from "lucide-react";

const CompleteProfile = () => {
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateRole } = useAuth();

  const handleCompleteProfile = async () => {
    setLoading(true);
    try {
      await updateRole(role);
      toast({
        title: "Profile updated!",
        description: `You are now signed up as a ${role}.`,
      });
      navigate(role === 'seller' ? "/seller" : "/");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 flex flex-col items-center justify-center py-20">
        <div className="w-full max-w-xl bg-card border border-border rounded-sm p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-semibold mb-4">
              Complete Your Profile
            </h1>
            <p className="text-muted-foreground">
              Welcome to MAISON! Please select how you'd like to use our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <button
              onClick={() => setRole('customer')}
              className={`flex flex-col items-center gap-4 p-8 border rounded-sm transition-all text-center ${
                role === 'customer'
                  ? 'bg-primary/5 border-primary ring-1 ring-primary'
                  : 'bg-background border-border hover:border-foreground'
              }`}
            >
              <div className={`p-4 rounded-full ${role === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Customer</h3>
                <p className="text-sm text-muted-foreground">Browse and shop curated products</p>
              </div>
            </button>

            <button
              onClick={() => setRole('seller')}
              className={`flex flex-col items-center gap-4 p-8 border rounded-sm transition-all text-center ${
                role === 'seller'
                  ? 'bg-primary/5 border-primary ring-1 ring-primary'
                  : 'bg-background border-border hover:border-foreground'
              }`}
            >
              <div className={`p-4 rounded-full ${role === 'seller' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                <Store size={24} />
              </div>
              <div>
                <h3 className="font-medium text-lg mb-1">Seller</h3>
                <p className="text-sm text-muted-foreground">List products and manage your store</p>
              </div>
            </button>
          </div>

          <Button 
            onClick={handleCompleteProfile}
            className="w-full rounded-sm py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Complete Setup"
            )}
          </Button>
        </div>
      </main>

      <footer className="py-12 text-center border-t border-border mt-auto">
        <img src="/logo.svg" alt="MAISON" className="h-12 w-auto object-contain mx-auto mb-2 opacity-50" />
        <p className="text-xs text-muted-foreground">© 2026 MAISON. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default CompleteProfile;
