import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { FileText, Search, Plus, Check } from "lucide-react";
import { useLocation } from "wouter";
import { Template } from "@shared/schema";

interface TemplateStepProps {
  selectedTemplateId: number | null;
  onSelectTemplate: (templateId: number) => void;
}

export function TemplateStep({
  selectedTemplateId,
  onSelectTemplate,
}: TemplateStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  // Fetch templates
  const { data, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  const templates = data?.templates || [];

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template: Template) => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate to template creation
  const handleCreateTemplate = () => {
    navigate("/template-editor");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Select a Template</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              placeholder="Search templates..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Template
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="You need to create a template before continuing."
          icon="templates"
          action={{
            label: "Create Template",
            onClick: handleCreateTemplate
          }}
        />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          title="No matching templates"
          description="Try adjusting your search terms."
          icon="search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template: Template) => (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all ${
                selectedTemplateId === template.id 
                  ? 'ring-2 ring-primary ring-offset-2' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelectTemplate(template.id)}
            >
              <CardContent className="p-6">
                {selectedTemplateId === template.id && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <div className="flex items-start">
                  <FileText className="h-8 w-8 text-muted-foreground mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                      {template.content}
                    </p>
                    {template.mergeFields && template.mergeFields.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}