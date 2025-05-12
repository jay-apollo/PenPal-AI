import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RecipientStep } from "@/components/campaigns/wizard/recipient-step";
import { TemplateStep } from "@/components/campaigns/wizard/template-step";
import { PersonalizeStep } from "@/components/campaigns/wizard/personalize-step";
import { ScheduleStep } from "@/components/campaigns/wizard/schedule-step";
import { ReviewStep } from "@/components/campaigns/wizard/review-step";
import { ChevronLeft, ChevronRight, Users, FileEdit, PenTool, Calendar, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

const steps = [
  { id: "recipients", label: "Recipients", icon: Users },
  { id: "template", label: "Template", icon: FileEdit },
  { id: "personalize", label: "Personalize", icon: PenTool },
  { id: "schedule", label: "Schedule", icon: Calendar },
  { id: "review", label: "Review", icon: CheckCircle },
];

// Define types for handwriting style and paper type
type HandwritingStyle = "casual" | "formal" | "elegant" | "neat" | "messy";
type PaperType = "plain" | "lined" | "aged";

// Initial campaign data
const initialCampaignData = {
  name: "",
  description: "",
  status: "draft",
  recipientIds: [] as number[],
  templateId: null as number | null,
  personalization: {},
  startDate: null as Date | null,
  handwritingStyle: "casual" as HandwritingStyle, // Default handwriting style
  paperType: "plain" as PaperType, // Default paper type
};

function CampaignWizard() {
  // Get the step from URL params if provided
  const params = useParams<{ step: string }>();
  const initialStep = params?.step || "recipients";
  
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [campaignData, setCampaignData] = useState(initialCampaignData);
  
  // When URL changes, update the current step
  useEffect(() => {
    if (params?.step && steps.some(step => step.id === params.step)) {
      setCurrentStep(params.step);
    }
  }, [params]);

  // Handle step change
  const handleStepChange = (step: string) => {
    setCurrentStep(step);
    navigate(`/campaign-wizard/${step}`, { replace: true });
  };

  // Go to next step
  const handleNext = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1].id;
      handleStepChange(nextStep);
    }
  };

  // Go to previous step
  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1].id;
      handleStepChange(prevStep);
    }
  };

  // Update campaign data
  const updateCampaignData = (data: Partial<typeof campaignData>) => {
    setCampaignData(prev => ({ ...prev, ...data }));
  };

  // Validate current step
  const validateStep = (): boolean => {
    switch (currentStep) {
      case "recipients":
        if (!campaignData.recipientIds.length) {
          toast({
            title: "No recipients selected",
            description: "Please select at least one recipient for your campaign.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      case "template":
        if (!campaignData.templateId) {
          toast({
            title: "No template selected",
            description: "Please select a template for your campaign.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      case "personalize":
        if (!campaignData.name) {
          toast({
            title: "Campaign name required",
            description: "Please provide a name for your campaign.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      case "schedule":
        if (!campaignData.startDate) {
          toast({
            title: "Start date required",
            description: "Please select a start date for your campaign.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  // Handle next button click
  const handleNextClick = () => {
    if (validateStep()) {
      handleNext();
    }
  };

  // Add a state for handling submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Create a mutation for creating campaigns
  const { mutate: createCampaign } = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        // Try to get more detailed error information
        const errorData = await response.json().catch(() => ({}));
        console.error("Campaign creation failed:", response.status, errorData);
        
        if (errorData.errors) {
          throw new Error(`Validation errors: ${JSON.stringify(errorData.errors)}`);
        }
        
        throw new Error(`Failed to create campaign: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
      });
      navigate('/campaigns');
    },
    onError: (error) => {
      toast({
        title: "Failed to create campaign",
        description: error.message,
        variant: "destructive",
      });
      console.error("Campaign creation error:", error);
      setIsSubmitting(false);
    }
  });

  // Handle form submission
  const handleSubmitCampaign = () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);
    
    // Prepare the campaign data for submission
    // For this demo, we'll use a fixed userId of 1
    const submissionData = {
      userId: 1,
      name: campaignData.name || `Campaign ${new Date().toLocaleDateString()}`,
      description: campaignData.description || null,
      status: "scheduled",
      templateId: campaignData.templateId,
      recipientIds: campaignData.recipientIds.map(id => id.toString()), // Convert to string array as expected by schema
      startDate: campaignData.startDate,
      // The createdAt field will be added by the server
    };

    // Store handwriting style and paper type as metadata in description
    // if needed for future reference
    if (campaignData.handwritingStyle || campaignData.paperType) {
      const metadataStr = JSON.stringify({
        handwritingStyle: campaignData.handwritingStyle,
        paperType: campaignData.paperType
      });
      
      if (submissionData.description) {
        submissionData.description += `\n\nSettings: ${metadataStr}`;
      } else {
        submissionData.description = `Settings: ${metadataStr}`;
      }
    }

    console.log("Submitting campaign data:", submissionData);
    
    createCampaign(submissionData);
  };

  // Determine if the next button should show "Next" or "Create Campaign"
  const nextButtonText = currentStep === "review" ? "Create Campaign" : "Next";

  return (
    <PageContainer title="Create Campaign">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Create Campaign</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={currentStep} onValueChange={handleStepChange} className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              {steps.map((step) => (
                <TabsTrigger 
                  key={step.id} 
                  value={step.id}
                  className="flex flex-col sm:flex-row items-center py-2 gap-2"
                >
                  <step.icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{step.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="recipients">
              <RecipientStep 
                selectedRecipients={campaignData.recipientIds}
                onUpdateSelection={(recipientIds) => updateCampaignData({ recipientIds })}
              />
            </TabsContent>
            
            <TabsContent value="template">
              <TemplateStep 
                selectedTemplateId={campaignData.templateId}
                onSelectTemplate={(templateId) => updateCampaignData({ templateId })}
              />
            </TabsContent>
            
            <TabsContent value="personalize">
              <PersonalizeStep 
                campaignData={campaignData}
                onUpdateCampaign={updateCampaignData}
              />
            </TabsContent>
            
            <TabsContent value="schedule">
              <ScheduleStep 
                startDate={campaignData.startDate}
                onUpdateSchedule={(startDate) => updateCampaignData({ startDate })}
              />
            </TabsContent>
            
            <TabsContent value="review">
              <ReviewStep 
                campaignData={campaignData}
                onEditSection={(section) => {
                  // Map section names to step IDs
                  const sectionToStep: Record<string, string> = {
                    recipients: "recipients",
                    template: "template",
                    personalize: "personalize",
                    schedule: "schedule",
                    details: "personalize"
                  };
                  
                  handleStepChange(sectionToStep[section] || "recipients");
                }}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === steps[0].id}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button 
              onClick={currentStep === "review" ? handleSubmitCampaign : handleNextClick}
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner size="sm" className="mr-2" />}
              {nextButtonText}
              {currentStep !== "review" && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

export default CampaignWizard;
