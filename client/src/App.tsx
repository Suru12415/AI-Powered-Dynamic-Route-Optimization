import { Switch, Route, useLocation, useRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import { useEffect } from "react";

// Redirect component to handle route redirects
function Redirect({ to }: { to: string }) {
  const router = useRouter();
  
  useEffect(() => {
    router[1](to);
  }, [to, router]);
  
  return null;
}

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/routes" component={() => <Redirect to="/" />} />
      <Route path="/emissions" component={() => <Redirect to="/" />} />
      <Route path="/fleet" component={() => <Redirect to="/" />} />
      <Route path="/predictions" component={() => <Redirect to="/" />} />
      <Route path="/risk" component={() => <Redirect to="/" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
