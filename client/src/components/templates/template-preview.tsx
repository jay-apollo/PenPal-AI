import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { previewHandwrittenText } from "@/lib/handwritingAI";
import { personalizeText } from "@/lib/utils";
import { Pencil, Image, RefreshCw } from "lucide-react";
import { Template, Recipient } from "@shared/schema";

interface TemplatePreviewProps {
  template: {
    name: string;
    content: string;
    mergeFields?: string[];
  };
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | null>(null);
  const [handwritingStyle, setHandwritingStyle] = useState("casual");
  const [paperType, setPaperType] = useState("plain");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Fetch recipients
  const { data: recipientsData, isLoading: isLoadingRecipients } = useQuery({
    queryKey: ["/api/recipients"],
  });

  const recipients = recipientsData?.recipients || [];
  const selectedRecipient = recipients.find(
    (r: Recipient) => r.id === selectedRecipientId
  );

  // Set default recipient if available
  useEffect(() => {
    if (recipients.length > 0 && !selectedRecipientId) {
      setSelectedRecipientId(recipients[0].id);
    }
  }, [recipients, selectedRecipientId]);

  // Get personalized content for preview
  const getPersonalizedContent = () => {
    if (!selectedRecipient) {
      return template.content;
    }
    return personalizeText(template.content, selectedRecipient);
  };

  // Generate handwritten preview
  const handleGeneratePreview = async () => {
    setIsGenerating(true);
    try {
      const content = getPersonalizedContent();
      const result = await previewHandwrittenText({
        text: content,
        style: handwritingStyle,
        paper: paperType,
      });

      setPreviewImage(result.previewUrl);
    } catch (error) {
      console.error("Failed to generate preview:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate preview on mount if we have all required data
  useEffect(() => {
    if (selectedRecipient && template.content && !previewImage) {
      handleGeneratePreview();
    }
  }, [selectedRecipient, template.content]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Preview Options */}
        <div className="w-full md:w-1/3 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">
              Preview with Recipient
            </label>
            <Select
              value={selectedRecipientId?.toString() || ""}
              onValueChange={(value) => setSelectedRecipientId(parseInt(value))}
              disabled={isLoadingRecipients || recipients.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a recipient" />
              </SelectTrigger>
              <SelectContent>
                {recipients.map((recipient: Recipient) => (
                  <SelectItem
                    key={recipient.id}
                    value={recipient.id.toString()}
                  >
                    {recipient.firstName} {recipient.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {recipients.length === 0 && !isLoadingRecipients && (
              <p className="text-xs text-amber-500 mt-1">
                No recipients available. Add recipients to see personalized preview.
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              Handwriting Style
            </label>
            <Select
              value={handwritingStyle}
              onValueChange={setHandwritingStyle}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="elegant">Elegant</SelectItem>
                <SelectItem value="neat">Neat</SelectItem>
                <SelectItem value="messy">Messy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Paper Type</label>
            <Select value={paperType} onValueChange={setPaperType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plain">Plain White</SelectItem>
                <SelectItem value="lined">Lined</SelectItem>
                <SelectItem value="aged">Aged Parchment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGeneratePreview}
            disabled={!selectedRecipient || isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Regenerate Preview
          </Button>
        </div>

        {/* Preview Display */}
        <div className="w-full md:w-2/3">
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 flex items-center">
              <Pencil className="h-5 w-5 mr-2 text-neutral-500" />
              Handwritten Preview
            </h3>
          </div>

          {!previewImage ? (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                {isGenerating ? (
                  <div className="text-center">
                    <Spinner size="lg" className="mb-4" />
                    <p className="text-neutral-500">
                      Generating your handwritten preview...
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Image className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <p className="text-neutral-500 max-w-xs mx-auto">
                      {!selectedRecipient
                        ? "Select a recipient to see a personalized preview"
                        : "Click 'Generate Preview' to see your letter in handwritten form"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={previewImage}
                alt="Handwritten letter preview"
                className="w-full object-contain"
              />
            </div>
          )}

          {selectedRecipient && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-1">Plain text preview:</h4>
              <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                {getPersonalizedContent()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}