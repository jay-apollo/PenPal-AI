import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Search, Users, UserCheck, UserX } from "lucide-react";
import { Recipient } from "@shared/schema";

interface RecipientStepProps {
  selectedRecipients?: number[];
  onUpdateSelection: (recipientIds: number[]) => void;
}

export function RecipientStep({
  selectedRecipients = [],
  onUpdateSelection,
}: RecipientStepProps) {
  const selectedRecipientIds = selectedRecipients;
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch recipients
  const { data, isLoading } = useQuery({
    queryKey: ["/api/recipients"],
  });

  const recipients = data?.recipients || [];

  // Filter recipients based on search query
  const filteredRecipients = recipients.filter((recipient: Recipient) => {
    const fullName = `${recipient.firstName} ${recipient.lastName}`.toLowerCase();
    const company = (recipient.company || "").toLowerCase();
    const search = searchQuery.toLowerCase();
    
    return fullName.includes(search) || company.includes(search);
  });

  // Toggle selection of a single recipient
  const toggleRecipient = (id: number) => {
    const newSelection = selectedRecipientIds.includes(id)
      ? selectedRecipientIds.filter(recId => recId !== id)
      : [...selectedRecipientIds, id];
    
    onUpdateSelection(newSelection);
  };

  // Select all recipients
  const selectAllRecipients = () => {
    onUpdateSelection(filteredRecipients.map((recipient: Recipient) => recipient.id));
  };

  // Clear selection
  const clearSelection = () => {
    onUpdateSelection([]);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Select Recipients</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
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
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={selectAllRecipients}
              disabled={filteredRecipients.length === 0}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Select All
            </Button>
            <Button 
              variant="outline" 
              onClick={clearSelection}
              disabled={selectedRecipientIds.length === 0}
            >
              <UserX className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
        
        {selectedRecipientIds.length > 0 && (
          <div className="mt-4 px-3 py-2 bg-primary-50 text-primary-700 rounded-md text-sm">
            <span className="font-medium">{selectedRecipientIds.length}</span> recipients selected
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : recipients.length === 0 ? (
        <EmptyState
          title="No recipients yet"
          description="You need to add recipients before creating a campaign."
          icon="recipients"
        />
      ) : filteredRecipients.length === 0 ? (
        <EmptyState
          title="No matching recipients"
          description="Try adjusting your search terms."
          icon="search"
        />
      ) : (
        <div className="divide-y">
          {filteredRecipients.map((recipient: Recipient) => (
            <div 
              key={recipient.id} 
              className="p-4 flex items-center hover:bg-gray-50 transition-colors"
            >
              <Checkbox 
                id={`recipient-${recipient.id}`}
                checked={selectedRecipientIds.includes(recipient.id)}
                onCheckedChange={() => toggleRecipient(recipient.id)}
              />
              <div className="ml-4 flex-1">
                <label 
                  htmlFor={`recipient-${recipient.id}`}
                  className="font-medium cursor-pointer"
                >
                  {recipient.firstName} {recipient.lastName}
                </label>
                <div className="text-sm text-muted-foreground">
                  {recipient.company && (
                    <span className="mr-3">{recipient.company}</span>
                  )}
                  {recipient.email && (
                    <span>{recipient.email}</span>
                  )}
                </div>
              </div>
              <div className="text-sm text-muted-foreground hidden md:block">
                {recipient.addressLine1 && (
                  <div>
                    {recipient.city ? `${recipient.city}, ` : ''} 
                    {recipient.state} {recipient.postalCode}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}