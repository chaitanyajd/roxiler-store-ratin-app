import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Store, Star } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "stores", label: "Stores", icon: Store },
    { id: "ratings", label: "Ratings", icon: Star },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  activeTab === item.id && "bg-primary/10 text-primary border-r-2 border-primary"
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
