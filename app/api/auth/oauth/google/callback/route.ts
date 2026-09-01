import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeGoogleCodeForUser,
  getAppBaseUrl,
  upsertOAuthUser,
  verifyOAuthState,
} from '@/lib/oauth';
import { setSessionCookie } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const baseUrl = getAppBaseUrl(req.url);
  const searchParams = req.nextUrl.searchParams;

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const oauthError = searchParams.get('error');

  if (oauthError) {
    console.warn('Google OAuth returned error:', oauthError);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(oauthError === 'access_denied' ? 'Google sign-in was cancelled' : oauthError)}`, baseUrl)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/login?error=Invalid%20OAuth%20response%20received%20from%20Google', baseUrl)
    );
  }

  const { valid, returnUrl } = verifyOAuthState(state, 'google');
  if (!valid) {
    return NextResponse.redirect(
      new URL('/login?error=OAuth%20security%20state%20verification%20failed.%20Please%20try%20again.', baseUrl)
    );
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`;
    const userData = await exchangeGoogleCodeForUser(code, redirectUri);
    const user = await upsertOAuthUser(userData);

    // Set 7-day session cookie
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      provider: 'google',
      expiresAt,
    });

    const targetUrl = returnUrl.startsWith('/') ? returnUrl : '/dashboard';
    return NextResponse.redirect(new URL(targetUrl, baseUrl));
  } catch (err: any) {
    console.error('Google OAuth callback processing error:', err);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(err.message || 'Failed to complete Google authentication')}`, baseUrl)
    );
  }
}
