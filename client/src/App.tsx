import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin-page";
import TestPage from "@/pages/test-page";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import CourseDetailPage from "@/pages/course-detail-page";

function Navbar() {
  const { user, logoutMutation } = useAuth();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/">
          <a className="text-xl font-bold">Olawanle Patrick Layeni</a>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.isAdmin && (
                <Link href="/admin/dashboard">
                  <Button variant="outline">Admin Dashboard</Button>
                </Link>
              )}
              <Button variant="outline" onClick={() => logoutMutation.mutate()}>
                Logout
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button>Login</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/admin/dashboard" component={AdminPage} requireAdmin />
        <ProtectedRoute path="/admin/courses/:id" component={CourseDetailPage} requireAdmin />
        <Route path="/test" component={TestPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
