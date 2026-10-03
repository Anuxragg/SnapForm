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
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';
import { apiErrorResponse, parseJsonBody, requestSchemas } from '@/lib/apiRequest';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const ipLimit = await checkRateLimit(`login:ip:${clientIp}`, {
      limit: 30,
      windowMs: 15 * 60 * 1000,
    });
    if (!ipLimit.available) {
      return NextResponse.json(
        { success: false, message: 'Login is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.resetInSeconds) } }
      );
    }

    const parsedBody = await parseJsonBody(req, requestSchemas.login);
    if (!parsedBody.success) return parsedBody.response;
    const { email: normalizedEmail, password } = parsedBody.data;
    const credentialsLimit = await checkRateLimit(`login:credentials:${clientIp}:${normalizedEmail}`, {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!credentialsLimit.available) {
      return NextResponse.json(
        { success: false, message: 'Login is temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }
    if (!credentialsLimit.allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many login attempts for these credentials. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(credentialsLimit.resetInSeconds) } }
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
  } catch (error: unknown) {
    return apiErrorResponse('Error during login API execution:', error, 'Login failed due to an internal error.');
  }
}
