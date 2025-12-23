import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

type ClassNameValue = ClassValue | ClassValue[] | Record<string, boolean> | undefined | null | false;

export function cn(...inputs: ClassNameValue[]): string {
  return twMerge(clsx(inputs));
}
