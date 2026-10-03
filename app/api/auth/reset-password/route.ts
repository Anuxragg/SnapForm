import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { hashPassword, generateSalt, isPasswordWithinLimit } from '@/lib/auth';
import { apiErrorResponse, parseJsonBody, requestSchemas } from '@/lib/apiRequest';

export async function POST(req: NextRequest) {
  try {
    const parsedBody = await parseJsonBody(req, requestSchemas.resetPassword);
    if (!parsedBody.success) return parsedBody.response;
    const { email: cleanEmail, token, password } = parsedBody.data;

    // Validate password complexity
    const hasMinLength = Array.from(password).length >= 8;
    const withinLengthLimit = isPasswordWithinLimit(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^a-zA-Z0-9]/.test(password);

    if (!hasMinLength || !withinLengthLimit || !hasLetter || !hasNumber || !hasSymbol) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password must be 8 to 128 characters long and contain letters, numbers, and symbols.',
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
    const newPasswordHash = await hashPassword(password, newSalt);

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
  } catch (error: unknown) {
    return apiErrorResponse('Error during reset-password:', error, 'Failed to reset password. Please try again.');
  }
}
