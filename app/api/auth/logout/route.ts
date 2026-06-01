import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully!',
    });
  } catch (error: any) {
    console.error('Error during logout API execution:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Logout failed due to internal error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
