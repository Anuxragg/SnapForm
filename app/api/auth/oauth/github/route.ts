import { NextRequest, NextResponse } from 'next/server';
import { createOAuthState, getAppBaseUrl, getGithubOAuthUrl } from '@/lib/oauth';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const returnUrl = searchParams.get('returnUrl') || '/dashboard';

    const baseUrl = getAppBaseUrl(req.url);
    const redirectUri = `${baseUrl}/api/auth/oauth/github/callback`;
    const state = createOAuthState('github', returnUrl);

    if (!process.env.GITHUB_CLIENT_ID) {
      return NextResponse.redirect(
        new URL('/login?error=GitHub%20OAuth%20is%20not%20configured.%20Please%20set%20GITHUB_CLIENT_ID%20and%20GITHUB_CLIENT_SECRET%20in%20.env', baseUrl)
      );
    }

    const authUrl = getGithubOAuthUrl(redirectUri, state);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('GitHub OAuth init error:', error);
    const baseUrl = getAppBaseUrl(req.url);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'Failed to start GitHub OAuth')}`, baseUrl)
    );
  }
}
