import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Calendar,
  Briefcase,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, getStatusClass } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Campaign } from "@shared/schema";

interface CampaignListProps {
  campaigns: Campaign[];
  isLoading: boolean;
}

export function CampaignList({ campaigns, isLoading }: CampaignListProps) {
  const [, navigate] = useLocation();

  const handleViewAllCampaigns = () => {
    navigate("/campaigns");
  };

  // Sort campaigns by creation date (newest first)
  const sortedCampaigns = [...campaigns].sort(
    (a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Take only the first 3 campaigns for the dashboard
  const displayCampaigns = sortedCampaigns.slice(0, 3);

  // If there's no data but not loading, show empty state
  const showEmptyState = !isLoading && (!campaigns || campaigns.length === 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Active Campaigns</CardTitle>
        <Button
          variant="link"
          className="text-sm font-medium text-primary"
          onClick={handleViewAllCampaigns}
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
            <Calendar className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-base font-medium text-gray-900">No campaigns yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first campaign.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate("/campaign-wizard")}>
                Create Campaign
              </Button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {displayCampaigns.map((campaign) => {
              // Calculate progress (mock data for now)
              const progress = Math.floor(Math.random() * 100);
              const sentCount = Math.floor(Math.random() * 100);
              const totalCount = Math.floor(Math.random() * 100) + sentCount;
              
              return (
                <li key={campaign.id} className="py-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                        {campaign.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {campaign.recipientIds?.length || 0} recipients • Started {formatDate(campaign.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={cn("text-xs px-2 py-1 rounded-full", getStatusClass(campaign.status))}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1).replace('_', ' ')}
                      </span>
                      <Button variant="ghost" size="icon" className="ml-4">
                        <MoreVertical className="h-5 w-5 text-neutral-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="relative pt-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-primary-600">
                            {progress}% Complete
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-primary-600">
                            {sentCount}/{totalCount}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mt-1 text-xs flex rounded bg-primary-100">
                        <div
                          style={{ width: `${progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                        ></div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
