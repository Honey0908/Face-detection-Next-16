import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * Uses clsx for conditional classes and tailwind-merge to handle Tailwind conflicts
 *
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged className string
 *
 * @example
 * cn('text-sm', 'text-lg') // => 'text-lg' (tailwind-merge resolves conflict)
 * cn('px-4 py-2', { 'bg-primary': true }) // => 'px-4 py-2 bg-primary'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
