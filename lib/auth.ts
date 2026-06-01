import crypto from 'crypto';
import { cookies } from 'next/headers';

// Cryptographic configuration
const ITERATIONS = 1000;
const KEY_LEN = 64;
const DIGEST = 'sha512';
const ALGORITHM = 'aes-256-gcm';
const IV_LEN = 12; // 96 bits for GCM is standard and optimal
const TAG_LEN = 16; // 128-bit authentication tag

// Generate a secure 32-byte key from whatever SESSION_SECRET environment variable is defined
function getEncryptionKey(): Buffer {
  const secret = process.env.SESSION_SECRET || 'snapform_secure_session_secret_32_bytes_fallback';
  return crypto.createHash('sha256').update(secret).digest();
}

/**
 * Generate a cryptographically secure random salt
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Hash a password using PBKDF2Sync
 */
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
}

export interface ISessionPayload {
  id: string;
  email: string;
  name: string;
  expiresAt: number;
}

/**
 * Encrypt a session payload into an AES-256-GCM token
 */
export function encryptSession(payload: ISessionPayload): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Format token as IV_hex:Encrypted_hex:Tag_hex
  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}

/**
 * Decrypt and verify an AES-256-GCM session token
 */
export function decryptSession(token: string): ISessionPayload | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return null;
    
    const [ivHex, encryptedHex, tagHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted as any, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    const payload = JSON.parse(decrypted) as ISessionPayload;
    
    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    
    return payload;
  } catch (err) {
    console.error('Session decryption failed:', err);
    return null;
  }
}

/**
 * Next.js Helper to get the current authenticated session from cookies
 */
export async function getSession(): Promise<ISessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('snapform_session');
    if (!sessionCookie || !sessionCookie.value) return null;
    
    return decryptSession(sessionCookie.value);
  } catch (err) {
    console.error('Error fetching session in cookies helper:', err);
    return null;
  }
}

/**
 * Next.js Helper to set the authenticated session cookie
 */
export async function setSessionCookie(payload: ISessionPayload): Promise<void> {
  const token = encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set('snapform_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(payload.expiresAt),
  });
}

/**
 * Next.js Helper to clear the authenticated session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('snapform_session');
}
