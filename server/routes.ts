import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import MemoryStore from "memorystore";

// Import controllers
import * as authController from "./controllers/auth";
import * as campaignController from "./controllers/campaigns";
import * as recipientController from "./controllers/recipients";
import * as templateController from "./controllers/templates";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session store
  const MemoryStoreSession = MemoryStore(session);
  
  app.use(
    session({
      cookie: { maxAge: 86400000 }, // 1 day
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "penpal-ai-secret",
    })
  );

  // Initialize passport and session
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        
        // In a real app, you would use bcrypt to compare hashed passwords
        if (user.password !== password) {
          return done(null, false, { message: "Incorrect password." });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize and deserialize user for sessions
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // API Routes
  // Auth routes
  app.post("/api/auth/register", authController.register);
  app.post("/api/auth/login", authController.login);
  app.post("/api/auth/logout", authController.logout);
  app.get("/api/auth/user", isAuthenticated, authController.getCurrentUser);

  // Campaign routes
  app.get("/api/campaigns", isAuthenticated, campaignController.getCampaigns);
  app.get("/api/campaigns/:id", isAuthenticated, campaignController.getCampaign);
  app.post("/api/campaigns", isAuthenticated, campaignController.createCampaign);
  app.put("/api/campaigns/:id", isAuthenticated, campaignController.updateCampaign);
  app.delete("/api/campaigns/:id", isAuthenticated, campaignController.deleteCampaign);

  // Recipient routes
  app.get("/api/recipients", isAuthenticated, recipientController.getRecipients);
  app.get("/api/recipients/:id", isAuthenticated, recipientController.getRecipient);
  app.post("/api/recipients", isAuthenticated, recipientController.createRecipient);
  app.post("/api/recipients/batch", isAuthenticated, recipientController.createBatchRecipients);
  app.put("/api/recipients/:id", isAuthenticated, recipientController.updateRecipient);
  app.delete("/api/recipients/:id", isAuthenticated, recipientController.deleteRecipient);

  // Template routes
  app.get("/api/templates", isAuthenticated, templateController.getTemplates);
  app.get("/api/templates/:id", isAuthenticated, templateController.getTemplate);
  app.post("/api/templates", isAuthenticated, templateController.createTemplate);
  app.put("/api/templates/:id", isAuthenticated, templateController.updateTemplate);
  app.delete("/api/templates/:id", isAuthenticated, templateController.deleteTemplate);

  // Letters routes
  app.get("/api/letters", isAuthenticated, templateController.getLetters);
  app.post("/api/letters/generate", isAuthenticated, templateController.generateLetter);
  app.post("/api/letters/export", isAuthenticated, templateController.exportLetter);

  const httpServer = createServer(app);
  return httpServer;
}
