import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import crypto from "crypto"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateShortId(prefix = 'sf_', length = 6): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i] % chars.length];
  }
  return `${prefix}${result}`;
}

export function getDeterministicShortId(idString: string, prefix = 'sf_'): string {
  if (!idString) return `${prefix}form`;
  const str = idString.toString();
  if (str.startsWith('sf_')) return str;
  const clean = str.replace(/[^a-zA-Z0-9]/g, '');
  return `${prefix}${clean.slice(0, 7).toLowerCase()}`;
}

