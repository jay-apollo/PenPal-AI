import { Request, Response } from "express";
import passport from "passport";
import { z } from "zod";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";

export const register = async (req: Request, res: Response) => {
  try {
    // Validate input using Zod schema
    const registerSchema = insertUserSchema.extend({
      password: z.string().min(8, "Password must be at least 8 characters long"),
      email: z.string().email("Please enter a valid email address"),
    });

    const validatedData = registerSchema.parse(req.body);

    // Check if user with this email already exists
    const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Check if username is taken
    const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already in use" });
    }

    // Create new user
    const newUser = await storage.createUser(validatedData);

    // In a real app, you would not return the password
    const { password, ...userWithoutPassword } = newUser;

    return res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: "Server error occurred during registration" });
  }
};

export const login = (req: Request, res: Response, next: Function) => {
  passport.authenticate("local", (err: Error, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message || "Authentication failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      // In a real app, you would not return the password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword });
    });
  })(req, res, next);
};

export const logout = (req: Request, res: Response) => {
  req.logout(() => {
    res.status(200).json({ message: "Logged out successfully" });
  });
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  // In a real app, you would not return the password
  const { password, ...userWithoutPassword } = req.user as any;
  return res.status(200).json({ user: userWithoutPassword });
};
