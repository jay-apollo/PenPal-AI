import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage";
import { insertRecipientSchema } from "@shared/schema";

// Get all recipients for the current user
export const getRecipients = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const recipients = await storage.getRecipientsByUserId(userId);
    res.status(200).json({ recipients });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipients", error: (error as Error).message });
  }
};

// Get a specific recipient by ID
export const getRecipient = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const recipientId = parseInt(req.params.id);
    
    if (isNaN(recipientId)) {
      return res.status(400).json({ message: "Invalid recipient ID" });
    }
    
    const recipient = await storage.getRecipient(recipientId);
    
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    
    // Ensure user can only access their own recipients
    if (recipient.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    res.status(200).json({ recipient });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recipient", error: (error as Error).message });
  }
};

// Create a new recipient
export const createRecipient = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    
    // Validate input using Zod schema
    const recipientSchema = insertRecipientSchema.extend({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required")
    });
    
    const validatedData = recipientSchema.parse({
      ...req.body,
      userId, // Ensure userId is from the authenticated user
    });
    
    const newRecipient = await storage.createRecipient(validatedData);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "create",
      entityType: "recipient",
      entityId: newRecipient.id,
      metadata: { 
        recipientName: `${newRecipient.firstName} ${newRecipient.lastName}` 
      }
    });
    
    res.status(201).json({ recipient: newRecipient });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create recipient", error: (error as Error).message });
  }
};

// Create multiple recipients in batch
export const createBatchRecipients = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { recipients } = req.body;
    
    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: "No recipients provided" });
    }
    
    // Validate input using Zod schema
    const recipientSchema = insertRecipientSchema.extend({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required")
    });
    
    const createdRecipients = [];
    const errors = [];
    
    for (const [index, recipientData] of recipients.entries()) {
      try {
        const validatedData = recipientSchema.parse({
          ...recipientData,
          userId, // Ensure userId is from the authenticated user
        });
        
        const newRecipient = await storage.createRecipient(validatedData);
        createdRecipients.push(newRecipient);
        
        // Create activity log
        await storage.createActivityLog({
          userId,
          action: "create",
          entityType: "recipient",
          entityId: newRecipient.id,
          metadata: { 
            recipientName: `${newRecipient.firstName} ${newRecipient.lastName}`,
            batchImport: true
          }
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({ index, errors: error.errors });
        } else {
          errors.push({ index, error: (error as Error).message });
        }
      }
    }
    
    if (createdRecipients.length > 0) {
      const response: any = { 
        recipients: createdRecipients, 
        message: `Created ${createdRecipients.length} recipients` 
      };
      
      if (errors.length > 0) {
        response.errors = errors;
        response.message += ` with ${errors.length} errors`;
      }
      
      return res.status(201).json(response);
    } else {
      return res.status(400).json({ 
        message: "Failed to create any recipients", 
        errors 
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to process batch recipients", error: (error as Error).message });
  }
};

// Update an existing recipient
export const updateRecipient = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const recipientId = parseInt(req.params.id);
    
    if (isNaN(recipientId)) {
      return res.status(400).json({ message: "Invalid recipient ID" });
    }
    
    // Get the existing recipient to check ownership
    const existingRecipient = await storage.getRecipient(recipientId);
    
    if (!existingRecipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    
    // Ensure user can only update their own recipients
    if (existingRecipient.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Validate input using Zod schema
    const updateRecipientSchema = insertRecipientSchema.partial();
    
    const validatedData = updateRecipientSchema.parse(req.body);
    
    const updatedRecipient = await storage.updateRecipient(recipientId, validatedData);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "update",
      entityType: "recipient",
      entityId: recipientId,
      metadata: { 
        recipientName: `${updatedRecipient.firstName} ${updatedRecipient.lastName}` 
      }
    });
    
    res.status(200).json({ recipient: updatedRecipient });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update recipient", error: (error as Error).message });
  }
};

// Delete a recipient
export const deleteRecipient = async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const recipientId = parseInt(req.params.id);
    
    if (isNaN(recipientId)) {
      return res.status(400).json({ message: "Invalid recipient ID" });
    }
    
    // Get the existing recipient to check ownership
    const existingRecipient = await storage.getRecipient(recipientId);
    
    if (!existingRecipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    
    // Ensure user can only delete their own recipients
    if (existingRecipient.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    await storage.deleteRecipient(recipientId);
    
    // Create activity log
    await storage.createActivityLog({
      userId,
      action: "delete",
      entityType: "recipient",
      entityId: recipientId,
      metadata: { 
        recipientName: `${existingRecipient.firstName} ${existingRecipient.lastName}` 
      }
    });
    
    res.status(200).json({ message: "Recipient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete recipient", error: (error as Error).message });
  }
};
