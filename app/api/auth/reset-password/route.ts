import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { hashPassword, generateSalt } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, password } = body;

    if (!email || !token || !password) {
      return NextResponse.json(
        { success: false, message: 'Email, token, and new password are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Validate password complexity
    const hasMinLength = password.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);

    if (!hasMinLength || !hasLetter || !hasNumber || !hasSymbol) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password must be at least 8 characters long and contain letters, numbers, and symbols.',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify reset token exists and has not expired
    const resetRecord = await PasswordResetToken.findOne({
      email: cleanEmail,
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRecord) {
      return NextResponse.json(
        {
          success: false,
          message: 'The password reset link is invalid or has expired. Please request a new one.',
        },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found.' },
        { status: 404 }
      );
    }

    // Generate new salt and hash new password
    const newSalt = generateSalt();
    const newPasswordHash = hashPassword(password, newSalt);

    user.passwordHash = newPasswordHash;
    user.salt = newSalt;
    if (user.provider === 'credentials' || !user.provider) {
      user.provider = 'credentials';
    }
    await user.save();

    // Purge the used reset token so it cannot be used again
    await PasswordResetToken.deleteMany({ email: cleanEmail });

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. You can now log in.',
    });
  } catch (error: any) {
    console.error('Error during reset-password:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to reset password. Please try again.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
