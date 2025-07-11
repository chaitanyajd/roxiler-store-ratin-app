import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AuthService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { Store } from "@shared/schema";

interface RatingFormProps {
  store: Store;
  currentRating?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RatingForm({ store, currentRating, open, onOpenChange }: RatingFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(currentRating || 0);
  const [isLoading, setIsLoading] = useState(false);

  const isUpdate = !!currentRating;

  const ratingMutation = useMutation({
    mutationFn: async (ratingValue: number) => {
      const headers = AuthService.getAuthHeaders();
      const endpoint = isUpdate ? `/api/ratings/${store.id}` : "/api/ratings";
      const method = isUpdate ? "PUT" : "POST";
      
      const data = isUpdate 
        ? { rating: ratingValue }
        : { storeId: store.id, rating: ratingValue };

      const response = await apiRequest(method, endpoint, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: isUpdate ? "Rating updated successfully" : "Rating submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast({
        title: "Error",
        description: "Please select a rating between 1 and 5",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await ratingMutation.mutateAsync(rating);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? "Update Rating" : "Rate Store"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{store.name}</h3>
            <p className="text-sm text-gray-600">{store.address}</p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm">Select your rating:</p>
            <StarRating
              rating={rating}
              interactive={true}
              onRatingChange={setRating}
              size="lg"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || rating === 0}>
            {isLoading ? "Submitting..." : isUpdate ? "Update Rating" : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
