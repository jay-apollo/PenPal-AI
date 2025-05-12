import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Search } from "lucide-react";
import { Campaign } from "@shared/schema";

function Campaigns() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all campaigns
  const { data, isLoading } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  const campaigns = data?.campaigns || [];

  // Filter campaigns based on search query
  const filteredCampaigns = campaigns.filter((campaign: Campaign) => 
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group campaigns by status
  const groupedCampaigns: Record<string, Campaign[]> = {
    in_progress: [],
    scheduled: [],
    draft: [],
    completed: [],
    paused: [],
  };

  filteredCampaigns.forEach((campaign: Campaign) => {
    const status = campaign.status.toLowerCase();
    if (groupedCampaigns[status]) {
      groupedCampaigns[status].push(campaign);
    } else {
      groupedCampaigns.draft.push(campaign);
    }
  });

  const statusOrder = ["in_progress", "scheduled", "draft", "paused", "completed"];
  const statusLabels: Record<string, string> = {
    in_progress: "In Progress",
    scheduled: "Scheduled",
    draft: "Drafts",
    completed: "Completed",
    paused: "Paused"
  };

  return (
    <PageContainer title="Campaigns">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Campaigns</h1>
        <div className="mt-4 sm:mt-0">
          <Button onClick={() => navigate("/campaign-wizard")}>
            <Plus className="h-5 w-5 mr-2" />
            Create New Campaign
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input 
            placeholder="Search campaigns..." 
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
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns yet"
          description="Start reaching out to your prospects with personalized handwritten letters."
          icon="campaigns"
          action={{
            label: "Create Campaign",
            onClick: () => navigate("/campaign-wizard")
          }}
        />
      ) : filteredCampaigns.length === 0 ? (
        <EmptyState
          title="No matching campaigns"
          description="Try adjusting your search terms."
          icon="search"
        />
      ) : (
        <div className="space-y-8">
          {statusOrder.map(status => {
            const campaignsInStatus = groupedCampaigns[status];
            if (!campaignsInStatus || campaignsInStatus.length === 0) return null;
            
            return (
              <div key={status}>
                <h2 className="text-xl font-semibold mb-4">{statusLabels[status]}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {campaignsInStatus.map((campaign: Campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}

export default Campaigns;
