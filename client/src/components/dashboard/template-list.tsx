import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Edit } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Template } from "@shared/schema";

interface TemplateListProps {
  templates: Template[];
  isLoading: boolean;
}

export function TemplateList({ templates, isLoading }: TemplateListProps) {
  const [, navigate] = useLocation();

  const handleViewAllTemplates = () => {
    navigate("/templates");
  };

  const handleCreateTemplate = () => {
    navigate("/template-editor");
  };

  const handleEditTemplate = (id: number) => {
    navigate(`/template-editor/${id}`);
  };

  // Sort templates by updated date (newest first)
  const sortedTemplates = [...templates].sort(
    (a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Take only the first 3 templates for the dashboard
  const displayTemplates = sortedTemplates.slice(0, 3);

  // If there's no data but not loading, show empty state
  const showEmptyState = !isLoading && (!templates || templates.length === 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Templates</CardTitle>
        <Button
          variant="link"
          className="text-sm font-medium text-primary"
          onClick={handleViewAllTemplates}
        >
          View all
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : showEmptyState ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-base font-medium text-gray-900">No templates yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start crafting your personalized messages.
            </p>
            <div className="mt-6">
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <ul className="divide-y divide-neutral-200">
              {displayTemplates.map((template) => (
                <li 
                  key={template.id} 
                  className="py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors -mx-6 px-6"
                >
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-neutral-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">{template.name}</p>
                      <p className="text-sm text-neutral-500">
                        Updated {formatDate(template.updatedAt)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEditTemplate(template.id)}
                  >
                    <Edit className="h-5 w-5 text-neutral-400" />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCreateTemplate}
              >
                <Plus className="h-5 w-5 mr-2 text-neutral-500" />
                Create New Template
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
