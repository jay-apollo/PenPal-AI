import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  Pause, 
  Play, 
  Trash2, 
  Copy, 
  Edit, 
  Calendar
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { cn, formatDate, getStatusClass } from "@/lib/utils";
import { Campaign } from "@shared/schema";

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // Calculate progress (mock data for now)
  const progress = Math.floor(Math.random() * 100);
  const sentCount = Math.floor(Math.random() * 100);
  const totalCount = Math.floor(Math.random() * 100) + sentCount;

  // Update campaign status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/campaigns/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign updated",
        description: "Campaign status has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating campaign",
        description: (error as Error).message || "An error occurred while updating the campaign.",
        variant: "destructive",
      });
    },
  });

  // Delete campaign mutation
  const deleteCampaign = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/campaigns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign deleted",
        description: "Campaign has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting campaign",
        description: (error as Error).message || "An error occurred while deleting the campaign.",
        variant: "destructive",
      });
    },
  });

  // Handle pause/resume campaign
  const handleToggleStatus = () => {
    const newStatus = campaign.status === "paused" ? "in_progress" : "paused";
    updateStatus.mutate({ id: campaign.id, status: newStatus });
  };

  // Handle duplicate campaign
  const handleDuplicate = () => {
    toast({
      title: "Duplicating campaign",
      description: "Creating a copy of this campaign...",
    });
    // Implement duplication logic here
  };

  // Handle delete campaign
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      deleteCampaign.mutate(campaign.id);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
              {campaign.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
              <div className="flex items-center mt-1">
                <span className={cn("text-xs px-2 py-1 rounded-full", getStatusClass(campaign.status))}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1).replace('_', ' ')}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {campaign.recipientIds?.length || 0} recipients
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/campaign-details/${campaign.id}`)}>
                <Edit className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                {campaign.status === "paused" ? (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Resume Campaign
                  </>
                ) : (
                  <>
                    <Pause className="mr-2 h-4 w-4" /> Pause Campaign
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500 line-clamp-2">
            {campaign.description || "No description provided."}
          </p>
        </div>
        
        {campaign.status === "in_progress" && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{progress}% Complete</span>
              <span>{sentCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {campaign.startDate && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Started: {formatDate(campaign.startDate)}</span>
          </div>
        )}
      </div>
      
      <CardFooter className="bg-gray-50 py-3 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate(`/campaign-details/${campaign.id}`)}>
          View Details
        </Button>
        {campaign.status === "draft" && (
          <Button size="sm" onClick={() => navigate(`/campaign-wizard/review?id=${campaign.id}`)}>
            Continue Editing
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
