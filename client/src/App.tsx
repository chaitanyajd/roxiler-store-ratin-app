import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin-dashboard";
import UserDashboard from "@/pages/user-dashboard";
import StoreDashboard from "@/pages/store-dashboard";

// Configure queryClient to use auth headers
queryClient.setQueryDefaults([], {
  queryFn: async ({ queryKey }) => {
    const authHeaders = getAuthHeaders();
    const response = await fetch(queryKey.join("/") as string, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
});

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function AuthenticatedApp() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/register" component={Register} />
        <Route path="/" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  // Route users based on their role
  const getDashboardComponent = () => {
    switch (user.role) {
      case "admin":
        return AdminDashboard;
      case "user":
        return UserDashboard;
      case "store":
        return StoreDashboard;
      default:
        return NotFound;
    }
  };

  return (
    <Switch>
      <Route path="/" component={getDashboardComponent()} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <AuthenticatedApp />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
