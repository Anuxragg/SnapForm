import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import { PREDEFINED_TEMPLATES } from '@/lib/templates';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET all templates (combining seeds and user's custom templates)
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getSession();
    
    let userCustomTemplates: any[] = [];
    if (session && session.id) {
      userCustomTemplates = await FormTemplate.find({ userId: session.id }).sort({ createdAt: -1 }).lean();
    }

    // Combine user's custom saved templates at the top + standard predefined blueprints catalog
    const allTemplates = [...userCustomTemplates, ...PREDEFINED_TEMPLATES];

    return NextResponse.json({
      success: true,
      source: 'database-and-catalog',
      data: allTemplates,
    });
  } catch (error: any) {
    console.warn('MongoDB connection failed, falling back to static templates:', error.message);
    return NextResponse.json({
      success: true,
      source: 'static-fallback',
      data: PREDEFINED_TEMPLATES,
    });
  }
}

// POST new custom template associated with logged-in user if active
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.name || !body.category || !body.fields || !body.styling) {
      return NextResponse.json(
        { success: false, message: 'Missing required template fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const session = await getSession();
    
    // Build insert payload
    const templateData: any = {
      name: body.name,
      category: body.category,
      description: body.description || 'Custom generated form template',
      fields: body.fields,
      styling: body.styling,
    };

    // Attach active user ownership
    if (session && session.id) {
      templateData.userId = session.id;
    }

    const newTemplate = await FormTemplate.create(templateData);

    return NextResponse.json({
      success: true,
      message: session
        ? 'Custom form template saved to your profile successfully!'
        : 'Custom form template compiled successfully (Anonymous)!',
      data: newTemplate,
    });
  } catch (error: any) {
    console.error('Error saving custom template:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save template. Please check database connection.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE a custom template associated with logged-in user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing template ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const session = await getSession();

    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find and delete the template, ensuring it belongs to the active user
    const deleted = await FormTemplate.findOneAndDelete({
      _id: id,
      userId: session.id,
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Form template not found or unauthorized to delete' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Custom form template deleted successfully!',
    });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete template. Please check database connection.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

