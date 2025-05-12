import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertTemplateSchema, insertLetterSchema } from "@shared/schema";

// Get all templates (no user filtering for demo)
export const getTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await storage.getAllTemplates();
    res.status(200).json({ templates });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch templates", error: (error as Error).message });
  }
};

// Get a specific template by ID (no user filtering for demo)
export const getTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    const template = await storage.getTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.status(200).json({ template });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch template", error: (error as Error).message });
  }
};

// Create a new template
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    // Validate input using Zod schema
    const templateSchema = insertTemplateSchema.extend({
      name: z.string().min(1, "Template name is required"),
      content: z.string().min(1, "Template content is required")
    });
    
    const validatedData = templateSchema.parse({
      ...req.body,
      userId, // Ensure userId is from the authenticated user
    });
    
    const newTemplate = await storage.createTemplate(validatedData);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "create",
      entityType: "template",
      entityId: newTemplate.id,
      metadata: { templateName: newTemplate.name }
    });
    
    res.status(201).json({ template: newTemplate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create template", error: (error as Error).message });
  }
};

// Update an existing template
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    // Get the existing template to check ownership
    const existingTemplate = await storage.getTemplate(templateId);
    
    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Ensure user can only update their own templates
    if (existingTemplate.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Validate input using Zod schema
    const updateTemplateSchema = insertTemplateSchema.partial();
    
    const validatedData = updateTemplateSchema.parse(req.body);
    
    const updatedTemplate = await storage.updateTemplate(templateId, validatedData);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "update",
      entityType: "template",
      entityId: templateId,
      metadata: { templateName: updatedTemplate.name }
    });
    
    res.status(200).json({ template: updatedTemplate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update template", error: (error as Error).message });
  }
};

// Delete a template
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    // Get the existing template to check ownership
    const existingTemplate = await storage.getTemplate(templateId);
    
    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    // Ensure user can only delete their own templates
    if (existingTemplate.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    await storage.deleteTemplate(templateId);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "delete",
      entityType: "template",
      entityId: templateId,
      metadata: { templateName: existingTemplate.name }
    });
    
    res.status(200).json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete template", error: (error as Error).message });
  }
};

// Get letters for the current user
export const getLetters = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    // Optional filter by campaignId
    const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
    
    // If campaignId is provided, verify ownership
    if (campaignId) {
      const campaign = await storage.getCampaign(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const letters = await storage.getLettersByCampaignId(campaignId);
      return res.status(200).json({ letters });
    } else {
      const letters = await storage.getLettersByUserId(userId);
      return res.status(200).json({ letters });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch letters", error: (error as Error).message });
  }
};

// Generate a letter with AI
export const generateLetter = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { templateId, recipientId, campaignId, customContent } = req.body;
    
    if (!templateId || !recipientId || !campaignId) {
      return res.status(400).json({ message: "templateId, recipientId, and campaignId are required" });
    }
    
    // Verify ownership of template, recipient, and campaign
    const template = await storage.getTemplate(templateId);
    const recipient = await storage.getRecipient(recipientId);
    const campaign = await storage.getCampaign(campaignId);
    
    if (!template || !recipient || !campaign) {
      return res.status(404).json({ message: "Template, recipient, or campaign not found" });
    }
    
    if (template.userId !== userId || recipient.userId !== userId || campaign.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Process template with recipient data
    let content = customContent || template.content;
    
    // Replace merge fields with recipient data
    // In a real implementation, this would be more sophisticated
    content = content.replace(/{{firstName}}/g, recipient.firstName);
    content = content.replace(/{{lastName}}/g, recipient.lastName);
    content = content.replace(/{{company}}/g, recipient.company || "");
    
    // Create a letter in draft status
    const letterData = {
      campaignId,
      recipientId,
      content,
      status: "draft",
      scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24) // Schedule for 24 hours from now
    };
    
    const letter = await storage.createLetter(letterData);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "generate",
      entityType: "letter",
      entityId: letter.id,
      metadata: { 
        recipientId, 
        templateId,
        campaignId
      }
    });
    
    res.status(201).json({ letter });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate letter", error: (error as Error).message });
  }
};

// Export letter as PDF or image
export const exportLetter = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { letterId, format } = req.body;
    
    if (!letterId || !format) {
      return res.status(400).json({ message: "letterId and format are required" });
    }
    
    if (!["pdf", "image"].includes(format)) {
      return res.status(400).json({ message: "Format must be 'pdf' or 'image'" });
    }
    
    const letter = await storage.getLetter(letterId);
    
    if (!letter) {
      return res.status(404).json({ message: "Letter not found" });
    }
    
    // Check if user owns the campaign associated with this letter
    const campaign = await storage.getCampaign(letter.campaignId);
    
    if (!campaign || campaign.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // In a real implementation, this would generate a PDF or image
    // For now, we'll just return a mock URL
    const mockExportUrl = `https://example.com/exports/${format}/${letterId}`;
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "export",
      entityType: "letter",
      entityId: letter.id,
      metadata: { format }
    });
    
    res.status(200).json({ 
      exportUrl: mockExportUrl,
      format
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to export letter", error: (error as Error).message });
  }
};
