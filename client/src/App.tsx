import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? Dashboard : Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard" component={isAuthenticated ? Dashboard : Auth} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen text-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
