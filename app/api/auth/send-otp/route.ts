import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import EmailOtp from '@/models/EmailOtp';
import { validateStandardEmail } from '@/lib/emailValidator';
import { sendVerificationOtpEmail } from '@/lib/emailService';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const body = await req.json();
    const { email, name } = body;

    // 1. IP & Email Rate Limiting: Max 4 requests per 10 minutes
    const ipLimit = checkRateLimit(`send_otp_ip:${clientIp}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many requests from your network. Please wait ${ipLimit.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Validate standard email format and reject disposable providers
    const validation = validateStandardEmail(email);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Please enter a valid standard email' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Rate limit specifically on the target email address
    const emailLimit = checkRateLimit(`send_otp_email:${normalizedEmail}`, {
      limit: 3,
      windowMs: 10 * 60 * 1000,
    });
    if (!emailLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many verification requests for this email. Please try again in ${emailLimit.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // 3. Check if email is already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'This email is already registered. Please sign in.' },
        { status: 400 }
      );
    }

    // 4. Generate secure 6-digit numeric OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

    // 5. Store in database (overwrite any existing pending OTP for this email)
    await EmailOtp.deleteMany({ email: normalizedEmail });
    await EmailOtp.create({
      email: normalizedEmail,
      code: otpCode,
      verified: false,
      expiresAt,
    });

    // 6. Send verification email via Resend
    const emailResult = await sendVerificationOtpEmail(normalizedEmail, otpCode, name);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      devCode: emailResult.devCode, // for easy testing in development if RESEND_API_KEY is not set
    });
  } catch (error: any) {
    console.error('Error sending verification OTP:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send verification code. Please try again.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
