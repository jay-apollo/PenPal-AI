import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, FileText, Users, Calendar, Edit } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Recipient, Template } from "@shared/schema";

interface ReviewStepProps {
  campaignData: {
    name: string;
    description?: string;
    recipientIds: number[];
    templateId: number;
    startDate?: Date;
    handwritingStyle?: string;
    paperType?: string;
  };
  onEditSection: (section: string) => void;
}

export function ReviewStep({ campaignData, onEditSection }: ReviewStepProps) {
  // Fetch recipients
  const { data: recipientsData, isLoading: isLoadingRecipients } = useQuery({
    queryKey: ["/api/recipients"],
    enabled: campaignData.recipientIds.length > 0,
  });

  // Fetch template
  const { data: templateData, isLoading: isLoadingTemplate } = useQuery({
    queryKey: [`/api/templates/${campaignData.templateId}`],
    enabled: !!campaignData.templateId,
  });

  const template = templateData?.template as Template;
  const recipients = recipientsData?.recipients || [];
  const selectedRecipients = recipients.filter((r: Recipient) => 
    campaignData.recipientIds.includes(r.id)
  );

  const isLoading = isLoadingRecipients || isLoadingTemplate;

  // Format handwriting style for display
  const formatStyle = (style: string) => {
    return style.charAt(0).toUpperCase() + style.slice(1);
  };

  // Format paper type for display
  const formatPaper = (paper: string) => {
    switch (paper) {
      case "plain": return "Plain White";
      case "lined": return "Lined";
      case "aged": return "Aged Parchment";
      default: return paper;
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Review Your Campaign</h2>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium mb-4">Campaign Details</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSection("details")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Name:</span> 
                  <span className="ml-2">{campaignData.name}</span>
                </div>
                {campaignData.description && (
                  <div>
                    <span className="text-sm font-medium">Description:</span>
                    <p className="mt-1 text-sm text-neutral-700">{campaignData.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Recipients */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-neutral-500" />
                  <h3 className="text-lg font-medium">Recipients</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSection("recipients")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium">{selectedRecipients.length}</span> 
                  <span className="ml-1">recipients selected</span>
                </div>
                
                {selectedRecipients.length > 0 ? (
                  <div className="mt-2 border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">Company</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">Location</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {selectedRecipients.slice(0, 5).map((recipient: Recipient) => (
                          <tr key={recipient.id}>
                            <td className="px-4 py-2 text-sm">{recipient.firstName} {recipient.lastName}</td>
                            <td className="px-4 py-2 text-sm hidden md:table-cell">{recipient.company || "—"}</td>
                            <td className="px-4 py-2 text-sm hidden md:table-cell">
                              {recipient.city && recipient.state ? `${recipient.city}, ${recipient.state}` : "—"}
                            </td>
                          </tr>
                        ))}
                        {selectedRecipients.length > 5 && (
                          <tr>
                            <td colSpan={3} className="px-4 py-2 text-sm text-neutral-500 text-center">
                              + {selectedRecipients.length - 5} more recipients
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-3 text-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-neutral-700">No recipients selected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Template */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-neutral-500" />
                  <h3 className="text-lg font-medium">Template</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSection("template")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              
              <div className="mt-4">
                {template ? (
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-neutral-500 mt-1">
                      Created: {format(new Date(template.createdAt), "PPP")}
                    </p>
                    <div className="mt-3 p-4 bg-neutral-50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{template.content}</p>
                    </div>
                    {template.mergeFields && template.mergeFields.length > 0 && (
                      <div className="mt-3">
                        <span className="text-xs font-medium text-neutral-500">Merge Fields:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.mergeFields.map((field, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-50 text-primary-700"
                            >
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-3 text-center">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-neutral-700">No template selected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Personalization */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">Personalization Settings</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSection("personalize")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              
              <div className="mt-4 space-y-2">
                <div>
                  <span className="text-sm font-medium">Handwriting Style:</span> 
                  <span className="ml-2">{formatStyle(campaignData.handwritingStyle || "casual")}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Paper Type:</span>
                  <span className="ml-2">{formatPaper(campaignData.paperType || "plain")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Schedule */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-neutral-500" />
                  <h3 className="text-lg font-medium">Schedule</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSection("schedule")}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
              
              <div className="mt-4">
                {campaignData.startDate ? (
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <span>Scheduled for: </span>
                    <span className="ml-1 font-medium">
                      {format(campaignData.startDate, "PPP")}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    <span>Not scheduled</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}