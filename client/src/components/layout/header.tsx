import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Store, User, ChevronDown, Key, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Header() {
  const { user, logout } = useAuth();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="secondary">System Admin</Badge>;
      case "user":
        return <Badge variant="outline">Normal User</Badge>;
      case "store":
        return <Badge variant="default">Store Owner</Badge>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Store className="text-primary text-2xl mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Store Rating Platform</h1>
          </div>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="font-medium">{user?.name}</span>
                  {user?.role && getRoleBadge(user.role)}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
