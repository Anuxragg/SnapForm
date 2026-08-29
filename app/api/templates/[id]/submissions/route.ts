import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FormSubmission from '@/models/FormSubmission';
import { getSession } from '@/lib/auth';
import { resolveForm } from '@/lib/formResolver';
import mongoose from 'mongoose';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Invalid form ID' },
        { status: 400 }
      );
    }

    const resolved = await resolveForm(id, { requireOwnerId: session.id });

    if (!resolved || !resolved.found || !resolved.dbId) {
      return NextResponse.json(
        { success: false, message: 'Form not found or unauthorized' },
        { status: 404 }
      );
    }

    await connectToDatabase();

    // Fetch all submissions for this form ordered latest first
    const submissions = await FormSubmission.find({ formId: new mongoose.Types.ObjectId(resolved.dbId) })
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      formName: resolved.name,
      fields: resolved.fields,
      count: submissions.length,
      submissions: submissions.map((s) => ({
        id: s._id.toString(),
        data: s.data,
        submittedAt: s.submittedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching form submissions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve submissions', error: error.message },
      { status: 500 }
    );
  }
}
