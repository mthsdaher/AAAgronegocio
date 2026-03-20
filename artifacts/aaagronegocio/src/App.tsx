import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";

// Public Pages
import Home from "@/pages/Home";
import Listings from "@/pages/Listings";
import ListingDetail from "@/pages/ListingDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// Protected Pages (Seller)
import SellerDashboard from "@/pages/seller/Dashboard";
import SellerListings from "@/pages/seller/Listings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    }
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/imoveis" component={Listings} />
      <Route path="/imoveis/:slug" component={ListingDetail} />
      <Route path="/entrar" component={Login} />
      <Route path="/cadastrar" component={Register} />
      
      {/* Protected routes - Using simple direct mapping since layout handles auth check loosely */}
      <Route path="/painel/dashboard" component={SellerDashboard} />
      <Route path="/painel/anuncios" component={SellerListings} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
