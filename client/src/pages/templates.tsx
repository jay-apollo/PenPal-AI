import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TemplateCard } from "@/components/templates/template-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Search } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Template } from "@shared/schema";

function Templates() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch all templates
  const { data, isLoading } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Delete template mutation
  const deleteTemplate = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template deleted",
        description: "Template has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting template",
        description: (error as Error).message || "An error occurred while deleting the template.",
        variant: "destructive",
      });
    },
  });

  const templates = data?.templates || [];

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template: Template) => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle template deletion
  const handleDeleteTemplate = (id: number) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplate.mutate(id);
    }
  };

  // Handle template edit
  const handleEditTemplate = (id: number) => {
    navigate(`/template-editor/${id}`);
  };

  return (
    <PageContainer title="Templates">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Letter Templates</h1>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => navigate("/template-editor")}>
            <Plus className="h-5 w-5 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input 
            placeholder="Search templates..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : templates.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Create your first letter template to start personalizing your outreach."
          icon="templates"
          action={{
            label: "Create Template",
            onClick: () => navigate("/template-editor")
          }}
        />
      ) : filteredTemplates.length === 0 ? (
        <EmptyState
          title="No matching templates"
          description="Try adjusting your search terms."
          icon="search"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template: Template) => (
            <TemplateCard 
              key={template.id} 
              template={template} 
              onEdit={() => handleEditTemplate(template.id)}
              onDelete={() => handleDeleteTemplate(template.id)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

export default Templates;
