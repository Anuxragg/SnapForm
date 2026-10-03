import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';
import { apiErrorResponse } from '@/lib/apiRequest';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully!',
    });
  } catch (error: unknown) {
    return apiErrorResponse('Error during logout API execution:', error, 'Logout failed due to an internal error.');
  }
}
