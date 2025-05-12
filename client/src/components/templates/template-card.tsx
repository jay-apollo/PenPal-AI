import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Edit, Trash, MoreHorizontal } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Template } from "@shared/schema";

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
}

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  // Truncate content if it's too long
  const truncateContent = (content: string, maxLength: number = 120) => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3">
            <FileText className="h-6 w-6 text-neutral-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-lg mb-1">{template.name}</h3>
              <p className="text-sm text-neutral-500 mb-3">
                Updated {formatDate(template.updatedAt)}
              </p>
              <p className="text-sm text-neutral-600 line-clamp-3">
                {truncateContent(template.content)}
              </p>
              
              {template.mergeFields && template.mergeFields.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.mergeFields.slice(0, 3).map((field, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-50 text-primary-700"
                    >
                      {field}
                    </span>
                  ))}
                  {template.mergeFields.length > 3 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                      +{template.mergeFields.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 focus:text-red-700"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}