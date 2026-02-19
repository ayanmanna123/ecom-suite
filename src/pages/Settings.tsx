import Navbar from "@/components/Navbar";
import { Settings as SettingsIcon, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
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
          
          <header className="mb-12 border-b border-border pb-8">
            <h1 className="font-display text-3xl font-semibold flex items-center gap-3">
              <SettingsIcon size={28} strokeWidth={1.5} />
              Account Settings
            </h1>
            <p className="text-muted-foreground mt-2">Manage your account preferences and security.</p>
          </header>

          <div className="space-y-8">
            <section className="bg-muted/30 p-6 border border-border rounded-sm">
              <h2 className="text-lg font-medium mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="text-sm font-medium italic">Email cannot be changed</p>
                  </div>
                </div>
              </div>
            </section>
            
            <section className="bg-muted/30 p-6 border border-border rounded-sm">
              <h2 className="text-lg font-medium mb-4">Security</h2>
              <button className="px-4 py-2 border border-border rounded-sm text-sm hover:bg-muted transition-colors">
                Change Password
              </button>
            </section>
          </div>
        </div>
      </main>
      <footer className="mt-20 py-12 text-center border-t border-border text-muted-foreground text-xs">
        © 2026 MAISON. All rights reserved.
      </footer>
    </div>
  );
};

export default Settings;
