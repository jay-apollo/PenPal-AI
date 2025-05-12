import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, Settings, Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  onMobileMenuClick: () => void;
}

function getPageTitle(path: string): string {
  switch (path) {
    case "/dashboard":
      return "Dashboard";
    case "/campaigns":
      return "Campaigns";
    case "/recipients":
      return "Recipients";
    case "/templates":
      return "Templates";
    case "/analytics":
      return "Analytics";
    case "/integrations":
      return "Integrations";
    case "/settings":
      return "Account Settings";
    case "/help":
      return "Help & Support";
    default:
      if (path.startsWith("/campaign-wizard")) {
        return "Create Campaign";
      } else if (path.startsWith("/template-editor")) {
        return "Template Editor";
      }
      return "Dashboard";
  }
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const [location] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");

  useEffect(() => {
    setPageTitle(getPageTitle(location));
  }, [location]);

  return (
    <header className="bg-white shadow-sm z-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 md:justify-start md:space-x-10">
          <div className="flex justify-start lg:w-0 lg:flex-1 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileMenuClick}
              className="inline-flex items-center justify-center p-2 rounded-md text-neutral-400 hover:text-neutral-500 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-neutral-900">{pageTitle}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-5 w-5 text-neutral-500" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-5 w-5 text-neutral-500" />
            </Button>
            <div className="relative">
              <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User profile"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
