import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSessionCookie } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Double check user exists in DB to be secure
    const user = await User.findById(session.id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User no longer exists' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        provider: user.provider,
      },
    });
  } catch (error: any) {
    console.error('Error during me API execution:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve active session',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, avatar } = body;

    await connectToDatabase();

    const updateFields: any = {};
    if (typeof name === 'string' && name.trim()) {
      updateFields.name = name.trim().slice(0, 100);
    }
    if (typeof avatar === 'string') {
      updateFields.avatar = avatar;
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Refresh session cookie with updated name & avatar
    await setSessionCookie({
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      provider: updatedUser.provider,
      expiresAt: session.expiresAt || (Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated in database successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
      },
    });
  } catch (error: any) {
    console.error('Error updating user profile in MongoDB:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile in database', error: error.message },
      { status: 500 }
    );
  }
}
