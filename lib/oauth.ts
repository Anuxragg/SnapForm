import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import User, { IUser } from '@/models/User';

export interface OAuthUserData {
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github';
  providerId: string;
}

/**
 * Get base URL from environment or request headers
 */
export function getAppBaseUrl(requestUrl?: string): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  if (requestUrl) {
    try {
      const url = new URL(requestUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // ignore
    }
  }
  return 'http://localhost:3000';
}

/**
 * Create a signed CSRF state token
 */
export function createOAuthState(provider: 'google' | 'github', returnUrl: string = '/dashboard'): string {
  const secret = process.env.SESSION_SECRET || 'snapform_secure_session_secret_32_bytes_fallback';
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = JSON.stringify({ provider, returnUrl, timestamp, nonce });
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ payload, hmac })).toString('base64url');
}

/**
 * Verify and unpack a CSRF state token
 */
export function verifyOAuthState(stateStr: string, provider: 'google' | 'github'): { valid: boolean; returnUrl: string } {
  try {
    const raw = Buffer.from(stateStr, 'base64url').toString('utf8');
    const { payload, hmac } = JSON.parse(raw);
    const secret = process.env.SESSION_SECRET || 'snapform_secure_session_secret_32_bytes_fallback';
    const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    if (hmac !== expectedHmac) {
      return { valid: false, returnUrl: '/dashboard' };
    }

    const data = JSON.parse(payload);
    if (data.provider !== provider) {
      return { valid: false, returnUrl: '/dashboard' };
    }

    // State valid for 15 minutes
    if (Date.now() - data.timestamp > 15 * 60 * 1000) {
      return { valid: false, returnUrl: '/dashboard' };
    }

    return { valid: true, returnUrl: data.returnUrl || '/dashboard' };
  } catch (err) {
    return { valid: false, returnUrl: '/dashboard' };
  }
}

/**
 * Google OAuth configuration and token exchange
 */
export function getGoogleOAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in environment variables');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCodeForUser(code: string, redirectUri: string): Promise<OAuthUserData> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials are not fully configured');
  }

  // 1. Exchange code for access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code with Google');
  }

  // 2. Fetch User Profile
  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const userData = await userRes.json();
  if (!userRes.ok || !userData.email) {
    throw new Error('Failed to retrieve user profile from Google');
  }

  return {
    email: userData.email.toLowerCase().trim(),
    name: userData.name || userData.email.split('@')[0],
    avatar: userData.picture || undefined,
    provider: 'google',
    providerId: userData.sub,
  };
}

/**
 * GitHub OAuth configuration and token exchange
 */
export function getGithubOAuthUrl(redirectUri: string, state: string): string {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    throw new Error('GITHUB_CLIENT_ID is not configured in environment variables');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email',
    state,
  });

  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}

export async function exchangeGithubCodeForUser(code: string, redirectUri: string): Promise<OAuthUserData> {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GitHub OAuth credentials are not fully configured');
  }

  // 1. Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange authorization code with GitHub');
  }

  const accessToken = tokenData.access_token;

  // 2. Fetch User Profile
  const userRes = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'SnapForm-OAuth-App',
      Accept: 'application/vnd.github+json',
    },
  });

  const userData = await userRes.json();
  if (!userRes.ok) {
    throw new Error('Failed to retrieve user profile from GitHub');
  }

  let email = userData.email;

  // If email is null (private email setting on GitHub), fetch user's emails
  if (!email) {
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'SnapForm-OAuth-App',
        Accept: 'application/vnd.github+json',
      },
    });

    if (emailsRes.ok) {
      const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailsRes.json();
      const primaryEmail = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
      if (primaryEmail) {
        email = primaryEmail.email;
      }
    }
  }

  if (!email) {
    throw new Error('No verified email found on this GitHub account');
  }

  return {
    email: email.toLowerCase().trim(),
    name: userData.name || userData.login || email.split('@')[0],
    avatar: userData.avatar_url || undefined,
    provider: 'github',
    providerId: String(userData.id),
  };
}

/**
 * Upsert or link an OAuth user in MongoDB
 */
export async function upsertOAuthUser(userData: OAuthUserData): Promise<IUser> {
  await connectToDatabase();

  const normalizedEmail = userData.email.toLowerCase().trim();

  // Look for user by email first
  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    // If user exists, update OAuth fields if not already populated
    let modified = false;
    if (!user.provider || user.provider === 'credentials') {
      user.provider = userData.provider;
      user.providerId = userData.providerId;
      modified = true;
    }
    if (!user.avatar && userData.avatar) {
      user.avatar = userData.avatar;
      modified = true;
    }
    if (!user.isVerified) {
      user.isVerified = true;
      modified = true;
    }
    if (modified) {
      await user.save();
    }
    return user;
  }

  // Otherwise, create a new user
  user = await User.create({
    name: userData.name,
    email: normalizedEmail,
    provider: userData.provider,
    providerId: userData.providerId,
    avatar: userData.avatar || '',
    passwordHash: '',
    salt: '',
    isVerified: true,
  });

  return user;
}
