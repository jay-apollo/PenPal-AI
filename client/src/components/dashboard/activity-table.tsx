import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  CheckCircle,
  Calendar,
  Mail,
  FileEdit,
  Users,
} from "lucide-react";
import { cn, formatDate, getStatusClass } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { ActivityLog } from "@shared/schema";

interface ActivityTableProps {
  activities: ActivityLog[];
  isLoading: boolean;
}

export function ActivityTable({ activities, isLoading }: ActivityTableProps) {
  // Mock data for activity display
  // In a real application, this would come from your API
  const mockActivities = [
    {
      id: 1,
      action: "letter_sent",
      entityType: "letter",
      entityId: 123,
      metadata: { 
        recipientName: "John Smith", 
        templateName: "Follow-up Template",
        campaignName: "Q4 Client Outreach"
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      id: 2,
      action: "letter_opened",
      entityType: "letter",
      entityId: 124,
      metadata: { 
        recipientName: "Sarah Chen", 
        templateName: "Thank You Note",
        campaignName: "Thank You Notes - Summit"
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) // 4 days ago
    },
    {
      id: 3,
      action: "campaign_created",
      entityType: "campaign",
      entityId: 125,
      metadata: { 
        campaignName: "Follow-up - Enterprise Demo",
        recipientCount: 8
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6) // 6 days ago
    }
  ];

  // If no real activities are loaded, use mock data
  const displayActivities = activities.length > 0 ? activities : mockActivities;

  // Get icon and background color based on activity type
  const getActivityIcon = (action: string, entityType: string) => {
    if (action.includes("letter") && action.includes("sent")) {
      return { 
        icon: Mail, 
        bgClass: "bg-blue-100", 
        textClass: "text-blue-600" 
      };
    } else if (action.includes("letter") && action.includes("opened")) {
      return { 
        icon: CheckCircle, 
        bgClass: "bg-green-100", 
        textClass: "text-green-600" 
      };
    } else if (action.includes("campaign") && action.includes("created")) {
      return { 
        icon: Calendar, 
        bgClass: "bg-purple-100", 
        textClass: "text-purple-600" 
      };
    } else if (entityType === "template") {
      return { 
        icon: FileEdit, 
        bgClass: "bg-yellow-100", 
        textClass: "text-yellow-600" 
      };
    } else if (entityType === "recipient") {
      return { 
        icon: Users, 
        bgClass: "bg-indigo-100", 
        textClass: "text-indigo-600" 
      };
    }
    
    // Default
    return { 
      icon: Package, 
      bgClass: "bg-gray-100", 
      textClass: "text-gray-600" 
    };
  };

  // Format activity title
  const getActivityTitle = (activity: any) => {
    const { action, metadata } = activity;
    
    if (action.includes("letter_sent")) {
      return `Letter sent to ${metadata.recipientName}`;
    } else if (action.includes("letter_opened")) {
      return `Letter opened by ${metadata.recipientName}`;
    } else if (action.includes("campaign_created")) {
      return `Campaign created`;
    } else if (action.includes("template")) {
      return `Template ${action.includes("created") ? "created" : "updated"}`;
    }
    
    // Default
    return action.replace(/_/g, ' ');
  };

  // Format activity subtitle
  const getActivitySubtitle = (activity: any) => {
    const { action, metadata } = activity;
    
    if (action.includes("letter")) {
      return metadata.templateName;
    } else if (action.includes("campaign_created")) {
      return `${metadata.recipientCount} recipients added`;
    }
    
    return "";
  };

  // Get status badge
  const getActivityStatus = (activity: any) => {
    const { action } = activity;
    
    if (action.includes("letter_sent")) {
      return "Delivered";
    } else if (action.includes("letter_opened")) {
      return "Opened";
    } else if (action.includes("campaign_created")) {
      return "Scheduled";
    }
    
    return "";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        <Button variant="link" className="text-sm font-medium text-primary">
          View all activity
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {displayActivities.map((activity) => {
                  const { icon: ActivityIcon, bgClass, textClass } = getActivityIcon(
                    activity.action,
                    activity.entityType
                  );
                  
                  return (
                    <tr key={activity.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={cn("flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center", bgClass)}>
                            <ActivityIcon className={cn("h-4 w-4", textClass)} />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-neutral-900">
                              {getActivityTitle(activity)}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {getActivitySubtitle(activity)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900">
                          {activity.metadata?.campaignName || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-500">
                          {formatDate(activity.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActivityStatus(activity) && (
                          <span className={cn("px-2 inline-flex text-xs leading-5 font-semibold rounded-full", getStatusClass(getActivityStatus(activity)))}>
                            {getActivityStatus(activity)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
