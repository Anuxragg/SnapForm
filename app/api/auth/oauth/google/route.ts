import { NextRequest, NextResponse } from 'next/server';
import { createOAuthState, getAppBaseUrl, getGoogleOAuthUrl } from '@/lib/oauth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';

    const baseUrl = getAppBaseUrl(req.url);
    const redirectUri = `${baseUrl}/api/auth/oauth/google/callback`;
    const state = createOAuthState('google', returnUrl);

    if (!process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.redirect(
        new URL('/login?error=Google%20OAuth%20is%20not%20configured.%20Please%20set%20GOOGLE_CLIENT_ID%20and%20GOOGLE_CLIENT_SECRET%20in%20.env', baseUrl)
      );
    }

    const authUrl = getGoogleOAuthUrl(redirectUri, state);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Google OAuth init error:', error);
    const baseUrl = getAppBaseUrl(req.url);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'Failed to start Google OAuth')}`, baseUrl)
    );
  }
}
