import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Rocket, Upload, ClipboardList, BarChart3, Calendar, LogOut, LogIn } from "lucide-react";
import { useAuth, useLogout } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const navItems = isAuthenticated 
    ? [
        { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/dashboard" },
      ]
    : [
        { id: "home", label: "Home", icon: Upload, path: "/" },
      ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full ai-gradient flex items-center justify-center ai-glow">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Career Navigator</h1>
              <p className="text-sm text-gray-300">Find your perfect opportunity</p>
            </div>
          </Link>
          
          <div className="flex items-center space-x-6">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={location === item.path ? "default" : "ghost"}
                className={`flex items-center space-x-2 ${
                  location === item.path 
                    ? "glass-card bg-white/10" 
                    : "hover:bg-white/10"
                } transition-all duration-300`}
                onClick={() => setLocation(item.path)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  Welcome, {user?.name || user?.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="text-gray-300 hover:text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {logout.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setLocation("/auth")}
                  className="flex items-center space-x-2 hover:bg-white/10 transition-all duration-300"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Button>
                <Button 
                  className="ai-gradient hover:scale-105 transition-all duration-300 ai-glow"
                  onClick={() => setLocation("/auth")}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
