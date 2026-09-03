import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import { PREDEFINED_TEMPLATES } from '@/lib/templates';
import { getSession } from '@/lib/auth';
import { generateShortId, getDeterministicShortId } from '@/lib/utils';

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

      // Ensure every user custom template has a permanent, deterministic shortId
      for (const t of userCustomTemplates) {
        if (!t.shortId) {
          const permId = getDeterministicShortId(t._id.toString());
          t.shortId = permId;
          await FormTemplate.updateOne({ _id: t._id }, { $set: { shortId: permId } });
        }
      }
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
    
    // Strict Server-Side Validation: Ensure payload is an object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid payload provided' },
        { status: 400 }
      );
    }

    const { name, category, description, fields, styling } = body;

    // Validate Template Name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Form name is required and must be a valid string' },
        { status: 400 }
      );
    }
    if (name.trim().length > 120) {
      return NextResponse.json(
        { success: false, message: 'Form name must not exceed 120 characters' },
        { status: 400 }
      );
    }

    // Validate Category
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Category is required and must be a valid string' },
        { status: 400 }
      );
    }

    // Validate Fields Array
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one form field is required' },
        { status: 400 }
      );
    }

    // Validate Each Field Object on the Backend
    const validFieldTypes = new Set([
      'text', 'email', 'textarea', 'select', 'radio', 'checkbox',
      'number', 'tel', 'url', 'date', 'rating', 'switch', 'slider', 'file'
    ]);

    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (!field || typeof field !== 'object') {
        return NextResponse.json(
          { success: false, message: `Field at position ${i + 1} is invalid` },
          { status: 400 }
        );
      }

      if (!field.id || typeof field.id !== 'string' || field.id.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: `Field at position ${i + 1} must have a valid identifier (id)` },
          { status: 400 }
        );
      }

      if (!field.type || !validFieldTypes.has(field.type)) {
        return NextResponse.json(
          { success: false, message: `Field "${field.label || field.id}" has an unsupported type "${field.type}"` },
          { status: 400 }
        );
      }

      if (!field.label || typeof field.label !== 'string') {
        return NextResponse.json(
          { success: false, message: `Field at position ${i + 1} must have a valid text label` },
          { status: 400 }
        );
      }

      // Check options if select/radio
      if ((field.type === 'select' || field.type === 'radio') && field.options) {
        if (!Array.isArray(field.options)) {
          return NextResponse.json(
            { success: false, message: `Options for field "${field.label}" must be an array` },
            { status: 400 }
          );
        }
      }
    }

    // Validate Styling
    const cleanStyling = styling && typeof styling === 'object' ? styling : {
      theme: 'modern',
      primaryColor: '#ff4f00',
      borderRadius: 'md',
      layout: 'single-column'
    };

    await connectToDatabase();
    const session = await getSession();
    
    // Build sanitized insert payload with clean short ID
    const templateData: any = {
      name: name.trim(),
      category: category.trim().toLowerCase(),
      description: typeof description === 'string' && description.trim() ? description.trim() : 'Custom generated form template',
      fields,
      styling: cleanStyling,
      shortId: generateShortId('sf_'),
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

