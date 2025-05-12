import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Plus, Link2, RefreshCw } from "lucide-react";
import { Integration } from "@shared/schema";

// Form schema for adding/editing integration
const integrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Integration type is required"),
  config: z.object({
    apiKey: z.string().min(1, "API Key is required"),
    baseUrl: z.string().optional(),
    notes: z.string().optional(),
  }),
});

type IntegrationFormValues = z.infer<typeof integrationSchema>;

function Integrations() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch all integrations
  const { data, isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  // Toggle integration active status
  const toggleIntegration = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      await apiRequest("PUT", `/api/integrations/${id}`, { active });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integration updated",
        description: "Integration status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating integration",
        description: (error as Error).message || "An error occurred while updating the integration.",
        variant: "destructive",
      });
    },
  });

  // Sync integration data
  const syncIntegration = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/integrations/${id}/sync`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integration synced",
        description: "Integration data has been synced successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error syncing integration",
        description: (error as Error).message || "An error occurred while syncing the integration.",
        variant: "destructive",
      });
    },
  });

  // Create new integration
  const createIntegration = useMutation({
    mutationFn: async (data: IntegrationFormValues) => {
      await apiRequest("POST", "/api/integrations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setAddDialogOpen(false);
      toast({
        title: "Integration added",
        description: "Your integration has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding integration",
        description: (error as Error).message || "An error occurred while adding the integration.",
        variant: "destructive",
      });
    },
  });

  // Setup form
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationSchema),
    defaultValues: {
      name: "",
      type: "salesforce",
      config: {
        apiKey: "",
        baseUrl: "",
        notes: "",
      },
    },
  });

  // Handle form submission
  const onSubmit = (values: IntegrationFormValues) => {
    createIntegration.mutate(values);
  };

  // Handle toggle integration status
  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    toggleIntegration.mutate({ id, active: !currentStatus });
  };

  // Handle sync integration
  const handleSyncIntegration = (id: number) => {
    syncIntegration.mutate(id);
  };

  const integrations = data?.integrations || [];

  // CRM integration types with icons
  const integrationTypes = [
    { value: "salesforce", label: "Salesforce" },
    { value: "hubspot", label: "HubSpot" },
    { value: "zoho", label: "Zoho CRM" },
    { value: "pipedrive", label: "Pipedrive" },
    { value: "custom", label: "Custom CRM" },
  ];

  return (
    <PageContainer title="Integrations">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">CRM Integrations</h1>
        <div className="mt-4 sm:mt-0">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add CRM Integration</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Integration Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Salesforce Instance" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Integration Type</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            {integrationTypes.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your API key" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.baseUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://your-instance.salesforce.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="config.notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Additional information about this integration" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={createIntegration.isPending}>
                      {createIntegration.isPending ? (
                        <Spinner size="sm" className="mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add Integration
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : integrations.length === 0 ? (
        <EmptyState
          title="No integrations yet"
          description="Connect your CRM to sync contact data and streamline your campaigns."
          icon="integrations"
          action={{
            label: "Add Integration",
            onClick: () => setAddDialogOpen(true)
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {integrations.map((integration: Integration) => (
            <Card key={integration.id} className={integration.active ? "" : "opacity-70"}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{integration.name}</CardTitle>
                    <CardDescription>
                      {integrationTypes.find(t => t.value === integration.type)?.label || integration.type}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`active-${integration.id}`}>Active</Label>
                    <Switch
                      id={`active-${integration.id}`}
                      checked={integration.active}
                      onCheckedChange={() => handleToggleStatus(integration.id, integration.active)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last synced:</span>
                    <span>
                      {integration.lastSyncAt 
                        ? formatDate(integration.lastSyncAt) 
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Added on:</span>
                    <span>{formatDate(integration.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSyncIntegration(integration.id)}
                  disabled={!integration.active || syncIntegration.isPending}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>About Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect PenPal AI with your CRM to automate recipient management and keep track of responses.
              Integrations allow you to:
            </p>
            <ul className="space-y-2 text-sm list-disc pl-5">
              <li>Import contacts directly from your CRM</li>
              <li>Automatically update contact records when letters are sent</li>
              <li>Sync response data back to your CRM</li>
              <li>Track campaign effectiveness in your existing workflows</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

export default Integrations;
