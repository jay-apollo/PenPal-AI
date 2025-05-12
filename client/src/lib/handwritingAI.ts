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
  text: string,
  options: Partial<GenerateHandwritingOptions> = {}
): Promise<string> {
  // This is a mock function that would normally call an AI service
  // For now, just return a placeholder URL
  return `https://example.com/handwriting-preview?text=${encodeURIComponent(text)}&style=${options.style || 'casual'}`;
}
