import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { generateSalt, hashPassword, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 2. Check if user already exists
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'This email is already registered' },
        { status: 400 }
      );
    }

    // 3. Create user
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      salt,
    });

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
      message: 'Account created successfully!',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Error during signup API execution:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Signup failed due to internal error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
