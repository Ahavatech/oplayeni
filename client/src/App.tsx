import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin-page";
import TestPage from "@/pages/test-page";
import CourseDetailPage from "@/pages/course-detail-page";
import { Profile } from "@shared/schema";

function Navbar() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        return response.json();
      } catch (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
    },
    enabled: true,
    retry: 1
  });

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
            {isLoading ? (
              <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <span>{profile?.name}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/admin/dashboard" component={AdminPage} requireAdmin />
          <ProtectedRoute path="/admin/courses/:id" component={CourseDetailPage} requireAdmin />
          <Route path="/test" component={TestPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
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
