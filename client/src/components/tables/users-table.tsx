import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { User, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserWithStore } from "@shared/schema";

interface UsersTableProps {
  onAddUser: () => void;
}

export function UsersTable({ onAddUser }: UsersTableProps) {
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    role: "",
    address: "",
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`/api/users?${params}`, {
        headers: AuthService.getAuthHeaders(),
      });
      return response.json();
    },
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="secondary">System Admin</Badge>;
      case "user":
        return <Badge variant="outline">Normal User</Badge>;
      case "store":
        return <Badge variant="default">Store Owner</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value === "all" ? "" : value }));
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Users Management</h2>
          <p className="text-gray-600 mt-2">Manage all platform users</p>
        </div>
        <Button onClick={onAddUser}>
          <User className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name-filter">Name</Label>
              <Input
                id="name-filter"
                placeholder="Filter by name"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-filter">Email</Label>
              <Input
                id="email-filter"
                placeholder="Filter by email"
                value={filters.email}
                onChange={(e) => handleFilterChange("email", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select onValueChange={(value) => handleFilterChange("role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">System Admin</SelectItem>
                  <SelectItem value="user">Normal User</SelectItem>
                  <SelectItem value="store">Store Owner</SelectItem>
                </SelectContent>
              </Select>
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

      {/* Users Table */}
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user: UserWithStore) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        {user.role === "store" ? (
                          <Store className="h-5 w-5 text-gray-600" />
                        ) : (
                          <User className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="max-w-xs truncate">{user.address}</TableCell>
                  <TableCell>
                    {user.store ? (
                      <div className="text-sm text-gray-500">Store Rating Available</div>
                    ) : (
                      <div className="text-sm text-gray-500">N/A</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
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
