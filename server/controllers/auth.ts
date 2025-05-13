import { Request, Response } from "express";
import passport from "passport";
import { z } from "zod";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";

// Define user type
interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  [key: string]: any;
}

const SALT_ROUNDS = 10;

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

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, SALT_ROUNDS);

    // Create new user with hashed password
    const newUser = await storage.createUser({
      ...validatedData,
      password: hashedPassword
    });

    const { password, ...userWithoutPassword } = newUser;
    return res.status(201).json({ user: userWithoutPassword });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    console.error('Registration error:', error);
    return res.status(500).json({ message: "Server error occurred during registration" });
  }
};

export const login = (req: Request, res: Response, next: Function) => {
  passport.authenticate("local", (err: Error | null, user: User | false, info: { message: string } | undefined) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info?.message || "Authentication failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
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
  const user = req.user as User | undefined;
  
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const { password, ...userWithoutPassword } = user;
  return res.status(200).json({ user: userWithoutPassword });
};
