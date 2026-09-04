import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSessionCookie, clearSessionCookie } from '@/lib/auth';
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

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const userId = session.id;
    const userEmail = session.email?.toLowerCase();

    // 1. Find all forms created by this user
    const FormTemplate = (await import('@/models/FormTemplate')).default;
    const FormSubmission = (await import('@/models/FormSubmission')).default;
    const FormView = (await import('@/models/FormView')).default;
    const EmailOtp = (await import('@/models/EmailOtp')).default;
    const PasswordResetToken = (await import('@/models/PasswordResetToken')).default;

    const userForms = await FormTemplate.find({ userId }).select('_id').lean();
    const formIds = userForms.map((f: any) => f._id);

    // 2. Cascade delete form submissions & views
    if (formIds.length > 0) {
      await Promise.all([
        FormSubmission.deleteMany({ formId: { $in: formIds } }),
        FormView.deleteMany({ formId: { $in: formIds } }),
      ]);
    }

    // 3. Delete user forms
    await FormTemplate.deleteMany({ userId });

    // 4. Delete tokens and otps if email exists
    if (userEmail) {
      await Promise.all([
        EmailOtp.deleteMany({ email: userEmail }),
        PasswordResetToken.deleteMany({ email: userEmail }),
      ]);
    }

    // 5. Delete the user document
    await User.findByIdAndDelete(userId);

    // 6. Clear session cookie
    await clearSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'Account and associated data deleted successfully',
    });
  } catch (error: any) {
    console.error('Error during account deletion:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete account. Please try again.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

