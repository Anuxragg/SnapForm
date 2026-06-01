import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import { PREDEFINED_TEMPLATES } from '@/lib/templates';
import { getSession } from '@/lib/auth';

// GET all templates (combining seeds and user's custom templates)
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getSession();
    
    let query = {};
    if (session && session.id) {
      // Find global static seeds or user's custom saved templates
      query = {
        $or: [
          { userId: { $exists: false } },
          { userId: null },
          { userId: session.id },
        ],
      };
    } else {
      // Only return public static templates for anonymous users
      query = {
        $or: [
          { userId: { $exists: false } },
          { userId: null },
        ],
      };
    }

    const templates = await FormTemplate.find(query).sort({ createdAt: -1 });

    if (templates.length === 0) {
      return NextResponse.json({
        success: true,
        source: 'static-empty-db',
        data: PREDEFINED_TEMPLATES,
      });
    }

    return NextResponse.json({
      success: true,
      source: 'database',
      data: templates,
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
