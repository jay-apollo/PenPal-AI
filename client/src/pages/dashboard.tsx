import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/dashboard/stats-card";
import { CampaignList } from "@/components/dashboard/campaign-list";
import { TemplateList } from "@/components/dashboard/template-list";
import { ActivityTable } from "@/components/dashboard/activity-table";
import { Plus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

function Dashboard() {
  const [, navigate] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Fetch campaigns
  const { data: campaignsData, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["/api/campaigns"],
  });

  // Fetch templates
  const { data: templatesData, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["/api/templates"],
  });

  // Fetch activity logs
  const { data: activityData, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["/api/activity-logs"],
  });

  const handleCreateCampaign = () => {
    navigate("/campaign-wizard");
  };

  const isLoading = isLoadingCampaigns || isLoadingTemplates || isLoadingActivity;

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen} 
        onMobileClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      <div className="lg:ml-64">
        <Header 
          title="Dashboard" 
          onMobileMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} 
        />
        
        <main className="py-6 px-4 sm:px-6 lg:px-8 bg-neutral-50 min-h-screen">
          {/* Page Heading */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Welcome back!
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Here's what's happening with your campaigns today.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button onClick={handleCreateCampaign}>
                <Plus className="h-5 w-5 mr-2" />
                Create New Campaign
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Total Campaigns"
                  value={(campaignsData?.campaigns?.length || 0).toString()}
                  icon="campaigns"
                  trend={{ value: "+2", label: "new" }}
                />
                <StatsCard
                  title="Letters Sent"
                  value="156"
                  icon="letters"
                  trend={{ value: "+23%", label: "" }}
                />
                <StatsCard
                  title="Response Rate"
                  value="32%"
                  icon="responses"
                  trend={{ value: "+5%", label: "" }}
                />
                <StatsCard
                  title="Pending Letters"
                  value="42"
                  icon="pending"
                />
              </div>

              {/* Campaigns and Templates Sections */}
              <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
                {/* Active Campaigns */}
                <div className="lg:col-span-2">
                  <CampaignList 
                    campaigns={campaignsData?.campaigns || []} 
                    isLoading={isLoadingCampaigns}
                  />
                </div>

                {/* Recent Templates */}
                <div>
                  <TemplateList 
                    templates={templatesData?.templates || []} 
                    isLoading={isLoadingTemplates}
                  />
                </div>
              </div>

              {/* Recent Activity Table */}
              <div className="mt-8">
                <ActivityTable 
                  activities={activityData?.activityLogs || []}
                  isLoading={isLoadingActivity}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
