import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { RatingForm } from "@/components/forms/rating-form";
import { AuthService } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/ui/star-rating";
import { Star, Edit } from "lucide-react";
import type { StoreWithRating } from "@shared/schema";

export default function UserDashboard() {
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    address: "",
  });
  const [selectedStore, setSelectedStore] = useState<StoreWithRating | null>(null);
  const [showRatingForm, setShowRatingForm] = useState(false);

  const { data: stores, isLoading } = useQuery({
    queryKey: ["/api/stores", searchFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/stores?${params}`, {
        headers: AuthService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setSearchFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRateStore = (store: StoreWithRating) => {
    setSelectedStore(store);
    setShowRatingForm(true);
  };

  if (isLoading) {
    return <div>Loading stores...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Browse Stores</h2>
          <p className="text-gray-600 mt-2">Rate and review your favorite stores</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name-search">Search by Name</Label>
                <Input
                  id="name-search"
                  placeholder="Enter store name"
                  value={searchFilters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address-search">Search by Address</Label>
                <Input
                  id="address-search"
                  placeholder="Enter location"
                  value={searchFilters.address}
                  onChange={(e) => handleFilterChange("address", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Store Listings */}
        <div className="space-y-6">
          {stores?.map((store: StoreWithRating) => (
            <Card key={store.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{store.name}</h3>
                    <p className="text-gray-600 mb-3">{store.address}</p>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Overall Rating:</span>
                        <StarRating rating={store.averageRating} size="sm" />
                      </div>
                      {store.userRating && (
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-2">Your Rating:</span>
                          <StarRating rating={store.userRating} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 ml-6">
                    <Button onClick={() => handleRateStore(store)}>
                      <Star className="h-4 w-4 mr-1" />
                      {store.userRating ? "Update Rating" : "Rate Store"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedStore && (
        <RatingForm
          store={selectedStore}
          currentRating={selectedStore.userRating}
          open={showRatingForm}
          onOpenChange={setShowRatingForm}
        />
      )}
    </div>
  );
}
