import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth";
import Navbar from "@/components/navbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import MapView from "@/pages/map";
import PlantTree from "@/pages/plant";
import Trees from "@/pages/trees";
import TreeDetail from "@/pages/tree-detail";
import Dashboard from "@/pages/dashboard";
import Report from "@/pages/report";
import SignUp from "@/pages/signup";
import Login from "@/pages/login";
import Profile from "@/pages/profile";
import AdminPanel from "@/pages/admin";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/map" component={MapView} />
        <Route path="/plant" component={PlantTree} />
        <Route path="/trees" component={Trees} />
        <Route path="/tree/:id" component={TreeDetail} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/report" component={Report} />
        <Route path="/admin" component={AdminPanel} />
        <Route path="/signup" component={SignUp} />
        <Route path="/login" component={Login} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
