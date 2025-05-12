import { apiRequest } from "./queryClient";

interface GenerateHandwritingOptions {
  text: string;
  style?: "casual" | "formal" | "elegant" | "neat" | "messy";
  color?: string; // hex color code
  paper?: "plain" | "lined" | "aged";
  size?: "small" | "medium" | "large";
}

interface GeneratedLetter {
  id: number;
  campaignId: number;
  recipientId: number;
  content: string;
  status: string;
  generatedImageUrl?: string;
  scheduledFor?: Date;
}

/**
 * Generate a personalized handwritten letter using AI
 */
export async function generateHandwrittenLetter(
  templateId: number,
  recipientId: number,
  campaignId: number,
  customContent?: string
): Promise<GeneratedLetter> {
  const response = await apiRequest("POST", "/api/letters/generate", {
    templateId,
    recipientId,
    campaignId,
    customContent
  });
  
  const data = await response.json();
  return data.letter;
}

/**
 * Export a letter as PDF or image
 */
export async function exportLetter(
  letterId: number, 
  format: 'pdf' | 'image'
): Promise<{ exportUrl: string, format: string }> {
  const response = await apiRequest("POST", "/api/letters/export", {
    letterId,
    format
  });
  
  return await response.json();
}

/**
 * Preview handwritten text
 * Note: In a real implementation, this would call an AI service API
 */
export async function previewHandwrittenText(
  options: GenerateHandwritingOptions
): Promise<{ previewUrl: string }> {
  // This is a mock function that would normally call an AI service API
  // For now, just return a placeholder URL with a delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    previewUrl: `https://placehold.co/600x400/e2e8f0/1e293b?text=Handwritten+Preview+(${options.style || 'casual'}+style+on+${options.paper || 'plain'}+paper)`
  };
}
