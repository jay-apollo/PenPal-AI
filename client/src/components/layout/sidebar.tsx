import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Bell,
  Users,
  FileEdit,
  BarChart2,
  Settings,
  LogOut,
  HelpCircle,
  Link2,
  PenTool,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  className,
  isMobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    {
      title: "Main",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Campaigns",
          href: "/campaigns",
          icon: Bell,
        },
        {
          title: "Recipients",
          href: "/recipients",
          icon: Users,
        },
        {
          title: "Templates",
          href: "/templates",
          icon: FileEdit,
        },
        {
          title: "Analytics",
          href: "/analytics",
          icon: BarChart2,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Integrations",
          href: "/integrations",
          icon: Link2,
        },
        {
          title: "Account Settings",
          href: "/settings",
          icon: Settings,
        },
        {
          title: "Help & Support",
          href: "/help",
          icon: HelpCircle,
        },
      ],
    },
  ];
  
  // Handle logout
  const handleLogout = async () => {
    // Removed logout functionality
  };

  // Determine appropriate sidebar class based on mobile state
  const sidebarClasses = cn(
    "fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-20 transition-transform duration-300 transform md:translate-x-0",
    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
    className
  );

  return (
    <div className={sidebarClasses}>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <PenTool className="h-8 w-8 text-primary" />
            <h1 className="text-lg font-semibold text-neutral-800">PenPal AI</h1>
          </div>
        </div>
        
        <ScrollArea className="flex-1 py-4">
          {navItems.map((group, i) => (
            <div key={i} className="mb-6">
              <div className="px-4 mb-3 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {group.title}
              </div>
              {group.items.map((item, j) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={j}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "flex items-center px-4 py-3 text-neutral-500 hover:bg-primary-50 hover:text-primary-600 group transition-colors",
                      isActive && "text-primary-600 bg-primary-50 font-medium"
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          ))}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User profile"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-700">
                Demo User
              </p>
              <p className="text-xs text-neutral-500">user@example.com</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="mt-4 w-full flex items-center justify-center"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
