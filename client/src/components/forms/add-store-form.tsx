import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AuthService } from "@/lib/auth";
import { storeSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type StoreFormData = z.infer<typeof storeSchema>;

interface AddStoreFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddStoreForm({ open, onOpenChange }: AddStoreFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: async (data: StoreFormData) => {
      const headers = AuthService.getAuthHeaders();
      const response = await apiRequest("POST", "/api/stores", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Store created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/stores"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create store",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: StoreFormData) => {
    setIsLoading(true);
    try {
      await createStoreMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Store Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="Enter store name"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter store email address"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...form.register("address")}
              placeholder="Enter store address (max 400 characters)"
              rows={3}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Add Store"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
