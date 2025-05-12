import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { previewHandwrittenText } from "@/lib/handwritingAI";
import { personalizeText } from "@/lib/utils";
import { Pencil, Settings, Image } from "lucide-react";
import { Recipient, Template } from "@shared/schema";

interface PersonalizeStepProps {
  campaignData: {
    recipientIds: number[];
    templateId: number;
    handwritingStyle?: string;
    paperType?: string;
  };
  onUpdateCampaign: (data: any) => void;
}

export function PersonalizeStep({
  campaignData,
  onUpdateCampaign,
}: PersonalizeStepProps) {
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(
    campaignData.recipientIds[0] || null
  );
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Fetch template data
  const { data: templateData, isLoading: isLoadingTemplate } = useQuery({
    queryKey: [`/api/templates/${campaignData.templateId}`],
    enabled: !!campaignData.templateId,
  });

  // Fetch recipients data
  const { data: recipientsData, isLoading: isLoadingRecipients } = useQuery({
    queryKey: ["/api/recipients"],
    enabled: campaignData.recipientIds.length > 0,
  });

  const template = templateData?.template;
  const recipients = recipientsData?.recipients || [];
  const selectedRecipients = recipients.filter((r: Recipient) =>
    campaignData.recipientIds.includes(r.id)
  );
  const selectedRecipient = recipients.find(
    (r: Recipient) => r.id === selectedRecipientId
  );

  // Handle handwriting style change
  const handleStyleChange = (value: string) => {
    onUpdateCampaign({ ...campaignData, handwritingStyle: value });
  };

  // Handle paper type change
  const handlePaperChange = (value: string) => {
    onUpdateCampaign({ ...campaignData, paperType: value });
  };

  // Generate a preview of the personalized letter
  const handleGeneratePreview = async () => {
    if (!template || !selectedRecipient) return;

    setIsPreviewLoading(true);
    try {
      // Personalize the template with recipient data
      const personalizedContent = personalizeText(
        template.content,
        selectedRecipient
      );

      // Generate a preview of the handwritten text
      const result = await previewHandwrittenText({
        text: personalizedContent,
        style: campaignData.handwritingStyle || "casual",
        paper: campaignData.paperType || "plain",
      });

      setPreviewImageUrl(result.previewUrl);
    } catch (error) {
      console.error("Failed to generate preview:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const isLoading = isLoadingTemplate || isLoadingRecipients;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">
          Template not found. Please go back and select a valid template.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Personalize Your Letters</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-neutral-500" />
                Handwriting Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">
                    Preview Recipient
                  </label>
                  <Select
                    value={selectedRecipientId?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedRecipientId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a recipient to preview" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedRecipients.map((recipient: Recipient) => (
                        <SelectItem
                          key={recipient.id}
                          value={recipient.id.toString()}
                        >
                          {recipient.firstName} {recipient.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Handwriting Style
                  </label>
                  <Select
                    value={campaignData.handwritingStyle || "casual"}
                    onValueChange={handleStyleChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a handwriting style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="elegant">Elegant</SelectItem>
                      <SelectItem value="neat">Neat</SelectItem>
                      <SelectItem value="messy">Messy</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-500 mt-1">
                    Select a handwriting style that matches your brand and message
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Paper Type
                  </label>
                  <Select
                    value={campaignData.paperType || "plain"}
                    onValueChange={handlePaperChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select paper type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plain">Plain White</SelectItem>
                      <SelectItem value="lined">Lined</SelectItem>
                      <SelectItem value="aged">Aged Parchment</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-500 mt-1">
                    Choose the paper background for your letters
                  </p>
                </div>

                <Button
                  onClick={handleGeneratePreview}
                  disabled={!selectedRecipientId || isPreviewLoading}
                  className="w-full mt-4"
                >
                  {isPreviewLoading && <Spinner size="sm" className="mr-2" />}
                  Preview Letter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Pencil className="h-5 w-5 mr-2 text-neutral-500" />
                Letter Preview
              </h3>

              {!previewImageUrl ? (
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-12 text-center">
                  <Image className="h-12 w-12 mx-auto text-neutral-300" />
                  <p className="mt-4 text-sm text-neutral-500 max-w-xs mx-auto">
                    Generate a preview to see how your letter will look with the
                    selected handwriting style and paper.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={previewImageUrl}
                    alt="Letter preview"
                    className="w-full object-contain"
                  />
                </div>
              )}

              {selectedRecipient && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">
                    Personalized Content Preview:
                  </h4>
                  <div className="p-4 bg-neutral-50 rounded-lg text-sm whitespace-pre-wrap">
                    {personalizeText(template.content, selectedRecipient)}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    Text will be rendered in the selected handwriting style on
                    the final letter.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}