import { 
  users, type User, type InsertUser, 
  campaigns, type Campaign, type InsertCampaign,
  templates, type Template, type InsertTemplate,
  recipients, type Recipient, type InsertRecipient,
  activityLogs, type ActivityLog, type InsertActivityLog,
  letters, type Letter, type InsertLetter 
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaign methods
  getAllCampaigns(): Promise<Campaign[]>;
  getCampaignsByUserId(userId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;
  
  // Template methods
  getAllTemplates(): Promise<Template[]>;
  getTemplatesByUserId(userId: number): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template>;
  deleteTemplate(id: number): Promise<void>;
  
  // Recipient methods
  getAllRecipients(): Promise<Recipient[]>;
  getRecipientsByUserId(userId: number): Promise<Recipient[]>;
  getRecipient(id: number): Promise<Recipient | undefined>;
  createRecipient(recipient: InsertRecipient): Promise<Recipient>;
  createBatchRecipients(recipients: InsertRecipient[]): Promise<Recipient[]>;
  updateRecipient(id: number, recipient: Partial<InsertRecipient>): Promise<Recipient>;
  deleteRecipient(id: number): Promise<void>;
  
  // Activity Log methods
  getActivityLogsByUserId(userId: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  
  // Letter methods
  getLettersByUserId(userId: number): Promise<Letter[]>;
  getLetter(id: number): Promise<Letter | undefined>;
  createLetter(letter: InsertLetter): Promise<Letter>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private templates: Map<number, Template>;
  private recipients: Map<number, Recipient>;
  private activityLogs: Map<number, ActivityLog>;
  private letters: Map<number, Letter>;
  
  private currentIds: {
    users: number;
    campaigns: number;
    templates: number;
    recipients: number;
    activityLogs: number;
    letters: number;
  };

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.templates = new Map();
    this.recipients = new Map();
    this.activityLogs = new Map();
    this.letters = new Map();
    
    this.currentIds = {
      users: 1,
      campaigns: 1,
      templates: 1,
      recipients: 1,
      activityLogs: 1,
      letters: 1
    };
    
    // Add some default data for demo purposes
    this.addDemoData();
  }
  
  private addDemoData() {
    // Add a demo user
    const demoUser = this.createUser({
      username: "demo",
      email: "demo@example.com",
      password: "password", // In a real app, this would be hashed
      firstName: "Demo",
      lastName: "User",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Add demo recipients
    this.createRecipient({
      userId: 1,
      firstName: "John",
      lastName: "Smith",
      email: "john@example.com",
      company: "Acme Corp",
      addressLine1: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    this.createRecipient({
      userId: 1,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      company: "Widgets Inc",
      addressLine1: "456 Broad St",
      city: "San Francisco",
      state: "CA",
      postalCode: "94107",
      country: "USA",
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Add demo template
    this.createTemplate({
      userId: 1,
      name: "Welcome Letter",
      content: "Dear {{firstName}},\n\nThank you for your interest in our services. We're excited to work with you and {{company}}.\n\nBest regards,\nDemo User",
      mergeFields: ["firstName", "company"],
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Campaign methods
  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }
  
  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.userId === userId
    );
  }
  
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }
  
  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentIds.campaigns++;
    const campaign: Campaign = { ...insertCampaign, id };
    this.campaigns.set(id, campaign);
    return campaign;
  }
  
  async updateCampaign(id: number, updateData: Partial<InsertCampaign>): Promise<Campaign> {
    const existingCampaign = this.campaigns.get(id);
    if (!existingCampaign) {
      throw new Error(`Campaign with ID ${id} not found`);
    }
    
    const updatedCampaign = { ...existingCampaign, ...updateData, updatedAt: new Date() };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }
  
  async deleteCampaign(id: number): Promise<void> {
    this.campaigns.delete(id);
  }
  
  // Template methods
  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }
  
  async getTemplatesByUserId(userId: number): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.userId === userId
    );
  }
  
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }
  
  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = this.currentIds.templates++;
    const template: Template = { ...insertTemplate, id };
    this.templates.set(id, template);
    return template;
  }
  
  async updateTemplate(id: number, updateData: Partial<InsertTemplate>): Promise<Template> {
    const existingTemplate = this.templates.get(id);
    if (!existingTemplate) {
      throw new Error(`Template with ID ${id} not found`);
    }
    
    const updatedTemplate = { ...existingTemplate, ...updateData, updatedAt: new Date() };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteTemplate(id: number): Promise<void> {
    this.templates.delete(id);
  }
  
  // Recipient methods
  async getAllRecipients(): Promise<Recipient[]> {
    return Array.from(this.recipients.values());
  }
  
  async getRecipientsByUserId(userId: number): Promise<Recipient[]> {
    return Array.from(this.recipients.values()).filter(
      (recipient) => recipient.userId === userId
    );
  }
  
  async getRecipient(id: number): Promise<Recipient | undefined> {
    return this.recipients.get(id);
  }
  
  async createRecipient(insertRecipient: InsertRecipient): Promise<Recipient> {
    const id = this.currentIds.recipients++;
    const recipient: Recipient = { ...insertRecipient, id };
    this.recipients.set(id, recipient);
    return recipient;
  }
  
  async createBatchRecipients(insertRecipients: InsertRecipient[]): Promise<Recipient[]> {
    const createdRecipients: Recipient[] = [];
    
    for (const insertRecipient of insertRecipients) {
      const recipient = await this.createRecipient(insertRecipient);
      createdRecipients.push(recipient);
    }
    
    return createdRecipients;
  }
  
  async updateRecipient(id: number, updateData: Partial<InsertRecipient>): Promise<Recipient> {
    const existingRecipient = this.recipients.get(id);
    if (!existingRecipient) {
      throw new Error(`Recipient with ID ${id} not found`);
    }
    
    const updatedRecipient = { ...existingRecipient, ...updateData, updatedAt: new Date() };
    this.recipients.set(id, updatedRecipient);
    return updatedRecipient;
  }
  
  async deleteRecipient(id: number): Promise<void> {
    this.recipients.delete(id);
  }
  
  // Activity Log methods
  async getActivityLogsByUserId(userId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values())
      .filter((log) => log.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createActivityLog(insertActivityLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.currentIds.activityLogs++;
    const activityLog: ActivityLog = { ...insertActivityLog, id };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }
  
  // Letter methods
  async getLettersByUserId(userId: number): Promise<Letter[]> {
    return Array.from(this.letters.values()).filter(
      (letter) => letter.userId === userId
    );
  }
  
  async getLetter(id: number): Promise<Letter | undefined> {
    return this.letters.get(id);
  }
  
  async createLetter(insertLetter: InsertLetter): Promise<Letter> {
    const id = this.currentIds.letters++;
    const letter: Letter = { ...insertLetter, id };
    this.letters.set(id, letter);
    return letter;
  }
}

export const storage = new MemStorage();
