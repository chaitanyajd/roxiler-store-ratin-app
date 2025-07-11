import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { UsersTable } from "@/components/tables/users-table";
import { StoresTable } from "@/components/tables/stores-table";
import { RatingsTable } from "@/components/tables/ratings-table";
import { AddUserForm } from "@/components/forms/add-user-form";
import { AddStoreForm } from "@/components/forms/add-store-form";
import { AuthService } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Store, Star, Plus, UserPlus, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [showAddStoreForm, setShowAddStoreForm] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const response = await fetch("/api/stats", {
        headers: AuthService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
              <p className="text-gray-600 mt-2">Overview of platform statistics and management</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Store className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Stores</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalStores || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Star className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Ratings</p>
                      <p className="text-3xl font-bold text-gray-900">{stats?.totalRatings || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setShowAddUserForm(true)}
                    className="flex items-center justify-center py-3"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New User
                  </Button>
                  <Button 
                    onClick={() => setShowAddStoreForm(true)}
                    className="flex items-center justify-center py-3"
                    variant="outline"
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Add New Store
                  </Button>
                  <Button 
                    onClick={() => setShowAddUserForm(true)}
                    className="flex items-center justify-center py-3"
                    variant="outline"
                  >
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "users":
        return <UsersTable onAddUser={() => setShowAddUserForm(true)} />;
      case "stores":
        return <StoresTable onAddStore={() => setShowAddStoreForm(true)} />;
      case "ratings":
        return <RatingsTable />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
      
      <AddUserForm 
        open={showAddUserForm} 
        onOpenChange={setShowAddUserForm} 
      />
      <AddStoreForm 
        open={showAddStoreForm} 
        onOpenChange={setShowAddStoreForm} 
      />
    </div>
  );
}
