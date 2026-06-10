import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeToArray = <T>(input: T | T[]): T[] => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input;
  } else {
    return [input];
  }
};
