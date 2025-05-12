import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TemplateForm } from "@/components/templates/template-form";
import { TemplatePreview } from "@/components/templates/template-preview";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Template } from "@shared/schema";

function TemplateEditor() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("edit");
  const [templateData, setTemplateData] = useState<Partial<Template>>({
    name: "",
    content: "",
    mergeFields: []
  });

  // If editing an existing template, fetch its data
  const { data: existingTemplate, isLoading: isLoadingTemplate } = useQuery({
    queryKey: params?.id ? [`/api/templates/${params.id}`] : null,
    enabled: !!params?.id
  });

  // Update templateData when existing template is loaded
  useEffect(() => {
    if (existingTemplate?.template) {
      setTemplateData(existingTemplate.template);
    }
  }, [existingTemplate]);

  // Create or update template mutation
  const saveTemplate = useMutation({
    mutationFn: async (template: Partial<Template>) => {
      if (params?.id) {
        // Update existing template
        await apiRequest("PUT", `/api/templates/${params.id}`, template);
      } else {
        // Create new template
        await apiRequest("POST", "/api/templates", template);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: params?.id ? "Template updated" : "Template created",
        description: params?.id 
          ? "Your template has been successfully updated." 
          : "Your new template has been created.",
      });
      navigate("/templates");
    },
    onError: (error) => {
      toast({
        title: "Error saving template",
        description: (error as Error).message || "An error occurred while saving the template.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const handleSave = () => {
    if (!templateData.name || !templateData.content) {
      toast({
        title: "Missing required fields",
        description: "Please provide both a name and content for your template.",
        variant: "destructive",
      });
      return;
    }

    saveTemplate.mutate(templateData);
  };

  return (
    <PageContainer title={params?.id ? "Edit Template" : "Create Template"}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/templates")}
            className="mr-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900">
            {params?.id ? "Edit Template" : "Create Template"}
          </h1>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            onClick={handleSave}
            disabled={saveTemplate.isPending}
          >
            {saveTemplate.isPending ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Save Template
          </Button>
        </div>
      </div>

      {isLoadingTemplate ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit">
                <TemplateForm
                  template={templateData}
                  onChange={setTemplateData}
                />
              </TabsContent>
              
              <TabsContent value="preview">
                <TemplatePreview template={templateData} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}

export default TemplateEditor;
