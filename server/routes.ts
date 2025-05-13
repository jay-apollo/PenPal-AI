import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import MemoryStore from "memorystore";
import bcrypt from "bcrypt";
import csurf from "csurf";
import rateLimit from "express-rate-limit";

// Import controllers
import * as authController from "./controllers/auth";
import * as campaignController from "./controllers/campaigns";
import * as recipientController from "./controllers/recipients";
import * as templateController from "./controllers/templates";

// Environment validation
const requiredEnvVars = {
  SESSION_SECRET: process.env.SESSION_SECRET,
  NODE_ENV: process.env.NODE_ENV
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session store
  const MemoryStoreSession = MemoryStore(session);
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });

  app.use(
    session({
      cookie: { 
        maxAge: 86400000, // 1 day
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "strict"
      },
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      name: "sessionId" // Don't use the default 'connect.sid'
    })
  );

  // Initialize passport and session
  app.use(passport.initialize());
  app.use(passport.session());

  // Apply rate limiting to auth routes
  app.use("/api/auth", limiter);

  // Apply CSRF protection
  app.use(csurf());
  app.use((req: Request, res: Response, next: Function) => {
    res.cookie("XSRF-TOKEN", req.csrfToken());
    next();
  });

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
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
  app.get("/api/campaigns", campaignController.getCampaigns);
  app.get("/api/campaigns/:id", campaignController.getCampaign);
  app.post("/api/campaigns", campaignController.createCampaign);
  app.put("/api/campaigns/:id", campaignController.updateCampaign);
  app.delete("/api/campaigns/:id", campaignController.deleteCampaign);

  // Recipient routes
  app.get("/api/recipients", recipientController.getRecipients);
  app.get("/api/recipients/:id", recipientController.getRecipient);
  app.post("/api/recipients", recipientController.createRecipient);
  app.post("/api/recipients/batch", recipientController.createBatchRecipients);
  app.put("/api/recipients/:id", recipientController.updateRecipient);
  app.delete("/api/recipients/:id", recipientController.deleteRecipient);

  // Template routes
  app.get("/api/templates", templateController.getTemplates);
  app.get("/api/templates/:id", templateController.getTemplate);
  app.post("/api/templates", templateController.createTemplate);
  app.put("/api/templates/:id", templateController.updateTemplate);
  app.delete("/api/templates/:id", templateController.deleteTemplate);

  // Letters routes
  app.get("/api/letters", templateController.getLetters);
  app.post("/api/letters/generate", templateController.generateLetter);
  app.post("/api/letters/export", templateController.exportLetter);

  const httpServer = createServer(app);
  return httpServer;
}
