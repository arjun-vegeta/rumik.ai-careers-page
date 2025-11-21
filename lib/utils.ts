import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Merges Tailwind CSS classes intelligently, handling conflicts and duplicates
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
