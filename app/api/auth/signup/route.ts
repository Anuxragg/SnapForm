import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import EmailOtp from '@/models/EmailOtp';
import { generateSalt, hashPassword, setSessionCookie } from '@/lib/auth';
import { validateStandardEmail } from '@/lib/emailValidator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    const validation = validateStandardEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Please provide a valid standard email' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'This email is already registered. Please sign in.' },
        { status: 400 }
      );
    }

    // 3. Verify OTP verification status
    const otpRecord = await EmailOtp.findOne({ email: normalizedEmail });
    if (otpRecord && !otpRecord.verified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email with the OTP code first' },
        { status: 400 }
      );
    }

    // 4. Create user
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const userName = name && typeof name === 'string' && name.trim().length > 0
      ? name.trim()
      : normalizedEmail.split('@')[0];

    const user = await User.create({
      name: userName,
      email: normalizedEmail,
      passwordHash,
      salt,
      isVerified: true,
    });

    // 5. Clean up temporary OTP record
    if (otpRecord) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
    }

    // 6. Set session cookie (valid for 7 days)
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;
    await setSessionCookie({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: 'Account created and verified successfully!',
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
