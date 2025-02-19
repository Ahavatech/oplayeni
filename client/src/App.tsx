import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/Header";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Research from "@/pages/Research";
import Teaching from "@/pages/Teaching";
import Publications from "@/pages/Publications";
import Talks from "@/pages/Talks";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";
import AdminLogin from "@/pages/admin/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/research" component={Research} />
      <Route path="/teaching" component={Teaching} />
      <Route path="/publications" component={Publications} />
      <Route path="/talks" component={Talks} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={AdminLogin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <Navigation />
        <main className="flex-1">
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;