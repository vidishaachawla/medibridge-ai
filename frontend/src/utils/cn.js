/**
 * cn – Utility to merge Tailwind class names conditionally.
 * Wraps clsx + tailwind-merge for correct precedence resolution.
 *
 * Usage:
 *   cn('px-4 py-2', condition && 'bg-brand-500', 'text-white')
 */
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
