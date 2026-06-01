import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email and password' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Find user
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 3. Verify password
    const calculatedHash = hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 4. Set session cookie (valid for 7 days)
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error during login API execution:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Login failed due to internal error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
