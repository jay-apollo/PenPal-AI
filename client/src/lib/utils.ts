import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class values into a single class string using clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date as a readable string
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Truncates a string to a specified length and adds an ellipsis
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Personalize text by replacing merge fields with recipient data
 */
export function personalizeText(text: string, recipient: any): string {
  if (!text || !recipient) return text || '';
  
  // Replace standard merge fields
  let personalized = text;
  
  // Use regex to find merge fields like {{fieldName}}
  const mergeFields = text.match(/{{([^}]+)}}/g) || [];
  
  for (const field of mergeFields) {
    const fieldName = field.replace(/{{|}}/g, '');
    const value = recipient[fieldName] || '';
    personalized = personalized.replace(field, value);
  }
  
  return personalized;
}

/**
 * Get status badge class based on status
 */
export function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
    case 'in progress':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'paused':
      return 'bg-orange-100 text-orange-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'opened':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Calculate days remaining from a date
 */
export function getDaysRemaining(date: Date | string): number {
  const targetDate = new Date(date);
  const currentDate = new Date();
  
  // Set both dates to midnight for accurate day calculation
  targetDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);
  
  // Calculate difference in milliseconds
  const difference = targetDate.getTime() - currentDate.getTime();
  
  // Convert to days
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
