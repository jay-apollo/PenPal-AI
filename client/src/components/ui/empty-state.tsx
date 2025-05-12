import React from "react";
import { FileText, Search, Users, Calendar, BarChart, Link as LinkIcon, Settings, HelpCircle } from "lucide-react";
import { Button } from "./button";

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon: "templates" | "campaigns" | "recipients" | "analytics" | "search" | "integrations" | "settings" | "help";
  action?: EmptyStateAction;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case "templates":
        return <FileText className="h-12 w-12 text-gray-400" />;
      case "campaigns":
        return <Calendar className="h-12 w-12 text-gray-400" />;
      case "recipients":
        return <Users className="h-12 w-12 text-gray-400" />;
      case "analytics":
        return <BarChart className="h-12 w-12 text-gray-400" />;
      case "search":
        return <Search className="h-12 w-12 text-gray-400" />;
      case "integrations":
        return <LinkIcon className="h-12 w-12 text-gray-400" />;
      case "settings":
        return <Settings className="h-12 w-12 text-gray-400" />;
      case "help":
        return <HelpCircle className="h-12 w-12 text-gray-400" />;
      default:
        return <FileText className="h-12 w-12 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4">
        {getIcon()}
      </div>
      <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}