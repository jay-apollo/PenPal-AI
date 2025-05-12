import { apiRequest } from "./queryClient";
import { User } from "@shared/schema";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}

export interface AuthResponse {
  user: User;
}

/**
 * Login user
 */
export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/login", credentials);
  const data: AuthResponse = await response.json();
  return data.user;
}

/**
 * Register a new user
 */
export async function register(userData: RegisterData): Promise<User> {
  const response = await apiRequest("POST", "/api/auth/register", userData);
  const data: AuthResponse = await response.json();
  return data.user;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout", {});
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiRequest("GET", "/api/auth/user", undefined);
    const data: AuthResponse = await response.json();
    return data.user;
  } catch (error) {
    // If 401, user is not authenticated
    if ((error as any).message?.includes("401")) {
      return null;
    }
    throw error;
  }
}
