import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { sendPasswordResetEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    // Strict validation
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    await connectToDatabase();

    const user = await User.findOne({ email: cleanEmail });

    // If user exists, generate token and send email privately
    if (user) {
      // Remove any existing password reset tokens for this email
      await PasswordResetToken.deleteMany({ email: cleanEmail });

      // Generate secure 32-byte (64 hex characters) token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

      await PasswordResetToken.create({
        email: cleanEmail,
        token,
        expiresAt,
      });

      // Construct reset URL
      const origin =
        req.headers.get('origin') ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'http://localhost:3000';
      const resetLink = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

      await sendPasswordResetEmail(cleanEmail, resetLink, user.name);
    }

    // Always respond with a generic success message for security/privacy
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Error during forgot-password request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to process your password reset request at this time.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
