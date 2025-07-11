import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/ui/star-rating";
import { User, Store } from "lucide-react";
import type { RatingWithDetails } from "@shared/schema";

export function RatingsTable() {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ["/api/ratings"],
    queryFn: async () => {
      const response = await fetch("/api/ratings", {
        headers: AuthService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  if (isLoading) {
    return <div>Loading ratings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Ratings Management</h2>
        <p className="text-gray-600 mt-2">View and manage all submitted ratings</p>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratings?.map((rating: RatingWithDetails) => (
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
                    <div>
                      <div className="font-medium">{rating.store.name}</div>
                      <div className="text-sm text-gray-500">{rating.store.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StarRating rating={rating.rating} size="sm" />
                  </TableCell>
                  <TableCell>
                    {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
