import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Double check user exists in DB to be secure
    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User no longer exists' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error during me API execution:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve active session',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
