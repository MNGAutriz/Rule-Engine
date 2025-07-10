import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format numbers with commas for better readability
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

// Default export for compatibility
export default cn;
