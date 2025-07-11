import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { Store, Edit, Trash2 } from "lucide-react";
import type { StoreWithRating } from "@shared/schema";

interface StoresTableProps {
  onAddStore: () => void;
}

export function StoresTable({ onAddStore }: StoresTableProps) {
  const [filters, setFilters] = useState({
    name: "",
    address: "",
  });

  const { data: stores, isLoading } = useQuery({
    queryKey: ["/api/stores", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/stores?${params}`, {
        headers: AuthService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div>Loading stores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Stores Management</h2>
          <p className="text-gray-600 mt-2">Manage all registered stores</p>
        </div>
        <Button onClick={onAddStore}>
          <Store className="h-4 w-4 mr-2" />
          Add New Store
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name-filter">Store Name</Label>
              <Input
                id="name-filter"
                placeholder="Filter by store name"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="address-filter">Address</Label>
              <Input
                id="address-filter"
                placeholder="Filter by address"
                value={filters.address}
                onChange={(e) => handleFilterChange("address", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Store Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores?.map((store: StoreWithRating) => (
          <Card key={store.id} className="overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <Store className="h-12 w-12 text-gray-400" />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">{store.name}</h3>
                <StarRating rating={store.averageRating} size="sm" />
              </div>
              <p className="text-sm text-gray-600 mb-2">{store.email}</p>
              <p className="text-sm text-gray-700 mb-4">{store.address}</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="flex-1">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
