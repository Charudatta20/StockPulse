import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Portfolio from "@/pages/portfolio";
import Markets from "@/pages/markets";
import Watchlist from "@/pages/watchlist";
import News from "@/pages/news";
import IPOs from "@/pages/ipos";
import Login from "@/pages/login";
import SignUp from "@/pages/signup";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={SignUp} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/portfolio" component={Portfolio} />
          <Route path="/markets" component={Markets} />
          <Route path="/watchlist" component={Watchlist} />
          <Route path="/news" component={News} />
          <Route path="/ipos" component={IPOs} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CurrencyProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
