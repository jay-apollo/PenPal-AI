import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RecipientForm } from "@/components/recipients/recipient-form";
import { RecipientImport } from "@/components/recipients/recipient-import";
import { RecipientTable } from "@/components/recipients/recipient-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Search, Upload, UserPlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Recipient } from "@shared/schema";

function Recipients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  // Fetch all recipients
  const { data, isLoading } = useQuery({
    queryKey: ["/api/recipients"],
  });

  // Delete recipient mutation
  const deleteRecipient = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/recipients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      toast({
        title: "Recipient deleted",
        description: "Recipient has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting recipient",
        description: (error as Error).message || "An error occurred while deleting the recipient.",
        variant: "destructive",
      });
    },
  });

  const recipients = data?.recipients || [];

  // Filter recipients based on search query
  const filteredRecipients = recipients.filter((recipient: Recipient) => {
    const fullName = `${recipient.firstName} ${recipient.lastName}`.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    return (
      fullName.includes(searchLower) ||
      recipient.email?.toLowerCase().includes(searchLower) ||
      recipient.company?.toLowerCase().includes(searchLower)
    );
  });

  // Handle recipient deletion
  const handleDeleteRecipient = (id: number) => {
    if (window.confirm("Are you sure you want to delete this recipient?")) {
      deleteRecipient.mutate(id);
    }
  };

  // Handle dialog close after successful add
  const handleRecipientAdded = () => {
    setAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
    toast({
      title: "Recipient added",
      description: "New recipient has been successfully added.",
    });
  };

  // Handle batch import success
  const handleImportSuccess = (count: number) => {
    setAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
    toast({
      title: "Recipients imported",
      description: `${count} recipients have been successfully imported.`,
    });
  };

  return (
    <PageContainer title="Recipients">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Recipients</h1>
        <div className="mt-4 sm:mt-0">
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-5 w-5 mr-2" />
                Add Recipient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Recipient</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="single" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="single">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Single Recipient
                  </TabsTrigger>
                  <TabsTrigger value="import">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Recipients
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="single">
                  <RecipientForm onSuccess={handleRecipientAdded} />
                </TabsContent>
                <TabsContent value="import">
                  <RecipientImport onSuccess={handleImportSuccess} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input 
              placeholder="Search recipients..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="sm:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="prospects">Prospects</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : recipients.length === 0 ? (
        <EmptyState
          title="No recipients yet"
          description="Add recipients to start sending personalized handwritten letters."
          icon="recipients"
          action={{
            label: "Add Recipient",
            onClick: () => setAddDialogOpen(true)
          }}
        />
      ) : filteredRecipients.length === 0 ? (
        <EmptyState
          title="No matching recipients"
          description="Try adjusting your search terms."
          icon="search"
        />
      ) : (
        <RecipientTable 
          recipients={filteredRecipients} 
          onDelete={handleDeleteRecipient}
        />
      )}
    </PageContainer>
  );
}

export default Recipients;
