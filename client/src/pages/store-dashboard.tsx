import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { AuthService } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StarRating } from "@/components/ui/star-rating";
import { Star, Users, TrendingUp, User } from "lucide-react";
import type { RatingWithDetails } from "@shared/schema";

export default function StoreDashboard() {
  const { data: storeData, isLoading } = useQuery({
    queryKey: ["/api/store-dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/store-dashboard", {
        headers: AuthService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading store dashboard...</div>;
  }

  if (!storeData) {
    return <div>No store data available</div>;
  }

  const { store, ratings, averageRating, totalRatings } = storeData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Store Dashboard</h2>
          <p className="text-gray-600 mt-2">Manage your store ratings and reviews</p>
        </div>

        {/* Store Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-3xl font-bold text-gray-900">{totalRatings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Month</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {ratings.filter((r: RatingWithDetails) => {
                      const ratingDate = new Date(r.createdAt!);
                      const now = new Date();
                      return ratingDate.getMonth() === now.getMonth() && 
                             ratingDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Ratings */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Ratings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ratings.map((rating: RatingWithDetails) => (
                  <TableRow key={rating.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{rating.user.name}</div>
                          <div className="text-sm text-gray-500">{rating.user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={rating.rating} size="sm" />
                    </TableCell>
                    <TableCell>
                      {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
