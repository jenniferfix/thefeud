import { type ClassValue, clsx } from 'clsx';
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

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'string') {
    return error;
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  } else {
    return 'Unknown error';
  }
};
