import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Loader2 } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/");
      } else {
        await register(email, password, name, role);
        toast({
          title: "Account created!",
          description: `You have successfully signed up as a ${role}.`,
        });
        navigate(role === 'seller' ? "/seller" : "/");
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 flex flex-col items-center justify-center py-20">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 self-start md:self-center"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        <div className="w-full max-w-md bg-card border border-border rounded-sm p-8 md:p-12">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-semibold mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isLogin 
                ? "Enter your credentials to access your account" 
                : "Join MAISON for a curated shopping experience"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Join as</Label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`flex-1 py-2 px-4 text-sm border rounded-sm transition-all ${
                        role === 'customer' 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background text-muted-foreground border-border hover:border-foreground'
                      }`}
                    >
                      Customer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`flex-1 py-2 px-4 text-sm border rounded-sm transition-all ${
                        role === 'seller' 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background text-muted-foreground border-border hover:border-foreground'
                      }`}
                    >
                      Seller
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {isLogin && (
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4">
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-sm"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-sm py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                isLogin ? "Sign In" : "Sign Up"
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1.5 text-foreground font-medium hover:underline underline-offset-4"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-12 text-center border-t border-border">
        <img src="/logo.png" alt="MAISON" className="h-8 w-auto object-contain mx-auto mb-2 opacity-50" />
        <p className="text-xs text-muted-foreground">© 2026 MAISON. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Auth;
