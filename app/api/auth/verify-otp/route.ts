import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import EmailOtp from '@/models/EmailOtp';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';
import { apiErrorResponse, parseJsonBody, requestSchemas } from '@/lib/apiRequest';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const parsedBody = await parseJsonBody(req, requestSchemas.verifyOtp);
    if (!parsedBody.success) return parsedBody.response;
    const { email: normalizedEmail, code: cleanCode } = parsedBody.data;

    // Rate Limiting: Max 5 verification attempts per 10 minutes to prevent OTP brute-forcing
    const verifyLimit = await checkRateLimit(`verify_otp:${clientIp}_${normalizedEmail}`, {
      limit: 5,
      windowMs: 10 * 60 * 1000,
    });
    if (!verifyLimit.available) {
      return NextResponse.json(
        { success: false, message: 'Verification is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }
    if (!verifyLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed attempts. Please wait ${verifyLimit.resetInSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // 1. Find OTP record
    const otpRecord = await EmailOtp.findOne({ email: normalizedEmail });
    if (!otpRecord) {
      return NextResponse.json(
        { success: false, message: 'Verification code expired or not found. Please request a new code.' },
        { status: 400 }
      );
    }

    // 2. Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // 3. Check code match
    if (otpRecord.code !== cleanCode) {
      return NextResponse.json(
        {
          success: false,
          message: `Incorrect verification code. (${verifyLimit.remaining} attempts remaining)`,
        },
        { status: 400 }
      );
    }

    // 4. Mark verified
    otpRecord.verified = true;
    await otpRecord.save();

    return NextResponse.json({
      success: true,
      message: 'Email successfully verified!',
      email: normalizedEmail,
    });
  } catch (error: unknown) {
    return apiErrorResponse('Error verifying OTP:', error, 'Verification failed. Please try again.');
  }
}
