import crypto from 'crypto';
import { cookies } from 'next/headers';
import sessionSecret from '@/lib/session-secret';

// Password hashing configuration
const PBKDF2_ITERATIONS = 600_000;
const PASSWORD_KEY_LEN = 32;
const PASSWORD_DIGEST = 'sha256';
const LEGACY_PBKDF2_ITERATIONS = 1_000;
const LEGACY_PASSWORD_KEY_LEN = 64;
const LEGACY_PASSWORD_DIGEST = 'sha512';
const MAX_PASSWORD_CHARACTERS = 128;
const MAX_PASSWORD_BYTES = 1_024;
const PASSWORD_HASH_PREFIX = `pbkdf2-sha256$${PBKDF2_ITERATIONS}$`;
const ALGORITHM = 'aes-256-gcm';
const IV_LEN = 12; // 96 bits for GCM is standard and optimal
const TAG_LEN = 16; // 128-bit authentication tag

// Derive a fixed-length encryption key from the required session secret.
function getEncryptionKey(): Buffer {
  return crypto.createHash('sha256').update(sessionSecret).digest();
}

/**
 * Generate a cryptographically secure random salt
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function isPasswordWithinLimit(password: string): boolean {
  return Array.from(password).length <= MAX_PASSWORD_CHARACTERS &&
    Buffer.byteLength(password, 'utf8') <= MAX_PASSWORD_BYTES;
}

function derivePasswordKey(
  password: string,
  salt: string,
  iterations: number,
  keyLength: number,
  digest: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, keyLength, digest, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof password !== 'string' || !isPasswordWithinLimit(password)) {
    throw new Error('Password must not exceed 128 characters or 1024 bytes');
  }
  if (!salt) throw new Error('Password salt is required');

  const derivedKey = await derivePasswordKey(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PASSWORD_KEY_LEN,
    PASSWORD_DIGEST
  );
  return `${PASSWORD_HASH_PREFIX}${derivedKey.toString('hex')}`;
}

export function isCurrentPasswordHash(storedHash: string): boolean {
  return storedHash.startsWith(PASSWORD_HASH_PREFIX);
}

export async function verifyPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
  if (typeof password !== 'string' || !isPasswordWithinLimit(password) || !salt || !storedHash) return false;

  let iterations: number;
  let keyLength: number;
  let digest: string;
  let expectedHash: string;

  if (storedHash.startsWith(PASSWORD_HASH_PREFIX)) {
    iterations = PBKDF2_ITERATIONS;
    keyLength = PASSWORD_KEY_LEN;
    digest = PASSWORD_DIGEST;
    expectedHash = storedHash.slice(PASSWORD_HASH_PREFIX.length);
    if (!/^[a-f\d]{64}$/i.test(expectedHash)) return false;
  } else {
    iterations = LEGACY_PBKDF2_ITERATIONS;
    keyLength = LEGACY_PASSWORD_KEY_LEN;
    digest = LEGACY_PASSWORD_DIGEST;
    expectedHash = storedHash;
    if (!/^[a-f\d]{128}$/i.test(expectedHash)) return false;
  }

  const calculatedHash = await derivePasswordKey(password, salt, iterations, keyLength, digest);
  const storedBuffer = Buffer.from(expectedHash, 'hex');
  return calculatedHash.length === storedBuffer.length && crypto.timingSafeEqual(calculatedHash, storedBuffer);
}

export interface ISessionPayload {
  id: string;
  email: string;
  name: string;
  provider?: string;
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
    if (!ivHex || !encryptedHex || !tagHex) return null;

    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
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
 * Next.js Helper to set the authenticated session cookie.
 * Strictly enforces a lightweight payload (under 200 bytes) to stay safely below the 4096-byte RFC cookie limit.
 */
export async function setSessionCookie(payload: {
  id: string;
  email: string;
  name?: string;
  provider?: string;
  expiresAt: number;
  avatar?: string;
}): Promise<void> {
  const minimalPayload: ISessionPayload = {
    id: String(payload.id),
    email: String(payload.email || '').trim().toLowerCase(),
    name: String(payload.name || '').slice(0, 80),
    provider: payload.provider ? String(payload.provider) : 'credentials',
    expiresAt: payload.expiresAt,
  };

  const token = encryptSession(minimalPayload);
  const cookieStore = await cookies();
  const maxAge = Math.max(0, Math.floor((payload.expiresAt - Date.now()) / 1000));
  
  cookieStore.set('snapform_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAge || 60 * 60 * 24 * 7,
    expires: new Date(payload.expiresAt),
  });
}

/**
 * Next.js Helper to clear the authenticated session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('snapform_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  cookieStore.delete('snapform_session');
}
