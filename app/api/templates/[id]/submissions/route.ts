import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import FormSubmission from '@/models/FormSubmission';
import { getSession } from '@/lib/auth';
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
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid form ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verify ownership
    const template = await FormTemplate.findOne({
      _id: id,
      userId: session.id,
    });

    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Form not found or unauthorized' },
        { status: 404 }
      );
    }

    // Fetch all submissions for this form ordered latest first
    const submissions = await FormSubmission.find({ formId: id })
      .sort({ submittedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      formName: template.name,
      fields: template.fields,
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
