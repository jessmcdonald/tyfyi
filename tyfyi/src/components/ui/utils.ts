import { type ClassValue, clsx } from "clsx@2.1.1"
import { twMerge } from "tailwind-merge@2.5.4"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
