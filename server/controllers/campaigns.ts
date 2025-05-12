import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertCampaignSchema } from "@shared/schema";

// Get all campaigns (no user filtering for demo)
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    // For demo purposes, we'll return all campaigns 
    const campaigns = await storage.getAllCampaigns();
    res.status(200).json({ campaigns });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch campaigns", error: (error as Error).message });
  }
};

// Get a specific campaign by ID
export const getCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }
    
    const campaign = await storage.getCampaign(campaignId);
    
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    // Ensure user can only access their own campaigns
    if (campaign.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    res.status(200).json({ campaign });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch campaign", error: (error as Error).message });
  }
};

// Create a new campaign (no auth for demo)
export const createCampaign = async (req: Request, res: Response) => {
  try {
    // Use userId from the request body instead of auth (for demo)
    const userId = req.body.userId || 1;
    
    // Validate input using Zod schema
    const campaignSchema = insertCampaignSchema.extend({
      name: z.string().min(1, "Campaign name is required"),
    });
    
    // Extract the main campaign fields from request body
    const validatedData = campaignSchema.parse({
      ...req.body,
      userId,
      createdAt: new Date(),
    });
    
    const newCampaign = await storage.createCampaign(validatedData);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "create",
      entityType: "campaign",
      entityId: newCampaign.id,
      createdAt: new Date(),
      metadata: { campaignName: newCampaign.name }
    });
    
    res.status(201).json({ campaign: newCampaign });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create campaign", error: (error as Error).message });
  }
};

// Update an existing campaign
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }
    
    // Get the existing campaign to check ownership
    const existingCampaign = await storage.getCampaign(campaignId);
    
    if (!existingCampaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    // Ensure user can only update their own campaigns
    if (existingCampaign.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Validate input using Zod schema
    const updateCampaignSchema = insertCampaignSchema.partial().extend({
      name: z.string().min(1, "Campaign name is required").optional(),
    });
    
    const validatedData = updateCampaignSchema.parse(req.body);
    
    const updatedCampaign = await storage.updateCampaign(campaignId, validatedData);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "update",
      entityType: "campaign",
      entityId: campaignId,
      metadata: { campaignName: updatedCampaign.name }
    });
    
    res.status(200).json({ campaign: updatedCampaign });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update campaign", error: (error as Error).message });
  }
};

// Delete a campaign
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const campaignId = parseInt(req.params.id);
    
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }
    
    // Get the existing campaign to check ownership
    const existingCampaign = await storage.getCampaign(campaignId);
    
    if (!existingCampaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    
    // Ensure user can only delete their own campaigns
    if (existingCampaign.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    await storage.deleteCampaign(campaignId);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "delete",
      entityType: "campaign",
      entityId: campaignId,
      metadata: { campaignName: existingCampaign.name }
    });
    
    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete campaign", error: (error as Error).message });
  }
};
