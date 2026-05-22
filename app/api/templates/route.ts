import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import { PREDEFINED_TEMPLATES } from '@/lib/templates';

// GET all templates
export async function GET() {
  try {
    await connectToDatabase();
    const templates = await FormTemplate.find({}).sort({ createdAt: -1 });

    if (templates.length === 0) {
      // If db is connected but empty, return predefined static ones as a fallback
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
    // Graceful offline fallback
    return NextResponse.json({
      success: true,
      source: 'static-fallback',
      data: PREDEFINED_TEMPLATES,
    });
  }
}

// POST new custom template
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
    
    // Create new template
    const newTemplate = await FormTemplate.create({
      name: body.name,
      category: body.category,
      description: body.description || 'Custom generated form template',
      fields: body.fields,
      styling: body.styling,
    });

    return NextResponse.json({
      success: true,
      message: 'Custom form template saved successfully!',
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
