import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import {
  generateSalt,
  hashPassword,
  isCurrentPasswordHash,
  isPasswordWithinLimit,
  setSessionCookie,
  verifyPassword,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // 1. Validate inputs
    if (!email || typeof password !== 'string' || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide both email and password' },
        { status: 400 }
      );
    }
    if (!isPasswordWithinLimit(password)) {
      return NextResponse.json(
        { success: false, message: 'Password must not exceed 128 characters' },
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
    if (!user.passwordHash || !user.salt) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, user.salt, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!isCurrentPasswordHash(user.passwordHash)) {
      const salt = generateSalt();
      user.passwordHash = await hashPassword(password, salt);
      user.salt = salt;
      await user.save();
    }

    // 4. Set session cookie (valid for 7 days)
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      provider: user.provider || 'credentials',
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || '',
        provider: user.provider || 'credentials',
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
