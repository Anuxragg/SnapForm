import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import FormSubmission from '@/models/FormSubmission';
import mongoose from 'mongoose';
import { PREDEFINED_TEMPLATES } from '@/lib/templates';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';
// Public Hosted Form API Route
export const runtime = 'nodejs';

// GET: Retrieve public form schema and styling for rendering
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;

    if (!formId) {
      return NextResponse.json(
        { success: false, message: 'Form ID is required' },
        { status: 400 }
      );
    }

    // 1. Check if it's a predefined starter template
    const predefined = PREDEFINED_TEMPLATES.find((t) => t.id === formId);
    if (predefined) {
      return NextResponse.json({
        success: true,
        data: {
          id: predefined.id,
          name: predefined.name,
          description: predefined.description,
          category: predefined.category,
          fields: predefined.fields,
          styling: predefined.styling || { theme: 'modern', primaryColor: '#ff4f19' },
          isPredefined: true,
        },
      });
    }

    // 2. Otherwise lookup in database
    if (!mongoose.Types.ObjectId.isValid(formId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid form ID format' },
        { status: 404 }
      );
    }

    await connectToDatabase();
    const template = await FormTemplate.findById(formId).lean();

    if (!template) {
      return NextResponse.json(
        { success: false, message: 'Form not found or has been removed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: template._id.toString(),
        name: template.name,
        description: template.description,
        category: template.category,
        fields: template.fields,
        styling: template.styling || { theme: 'modern', primaryColor: '#ff4f19' },
        isPredefined: false,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public form:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load form', error: error.message },
      { status: 500 }
    );
  }
}

// POST: Submit answers to the form
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const clientIp = getClientIp(request);
    const { formId } = await params;

    // DDoS & Spam protection: Max 30 submissions per minute per IP
    const rateLimit = checkRateLimit(`form_sub_${clientIp}`, {
      limit: 30,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many submissions. Please slow down and try again in ${rateLimit.resetInSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { data } = body;

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid submission data provided' },
        { status: 400 }
      );
    }

    let formFields: any[] = [];
    let isDbForm = false;
    let targetTemplateId: mongoose.Types.ObjectId | null = null;

    // Check predefined vs DB form
    const predefined = PREDEFINED_TEMPLATES.find((t) => t.id === formId);
    if (predefined) {
      formFields = predefined.fields;
    } else if (mongoose.Types.ObjectId.isValid(formId)) {
      await connectToDatabase();
      const template = await FormTemplate.findById(formId);
      if (template) {
        formFields = template.fields;
        isDbForm = true;
        targetTemplateId = template._id as mongoose.Types.ObjectId;
      }
    }

    if (!formFields.length && !predefined) {
      return NextResponse.json(
        { success: false, message: 'Target form not found' },
        { status: 404 }
      );
    }

    // Validation against form field definitions
    const validationErrors: Record<string, string> = {};

    for (const field of formFields) {
      const val = data[field.id];

      // Required check
      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0) ||
          (field.type === 'checkbox' && val !== true && (!Array.isArray(val) || val.length === 0))
        ) {
          validationErrors[field.id] = `${field.label || 'This field'} is required`;
          continue;
        }
      }

      // Skip validation if optional and empty
      if (val === undefined || val === null || val === '') {
        continue;
      }

      // Email format check
      if (field.type === 'email' && typeof val === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val.trim())) {
          validationErrors[field.id] = 'Please provide a valid email address';
        }
      }

      // Text length checks
      if (typeof val === 'string' && field.validation) {
        if (field.validation.minLength && val.length < field.validation.minLength) {
          validationErrors[field.id] = `Must be at least ${field.validation.minLength} characters`;
        }
        if (field.validation.maxLength && val.length > field.validation.maxLength) {
          validationErrors[field.id] = `Must not exceed ${field.validation.maxLength} characters`;
        }
        if (field.validation.pattern) {
          try {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(val)) {
              validationErrors[field.id] = 'Invalid format';
            }
          } catch {
            // ignore invalid pattern regex
          }
        }
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed on some fields',
          errors: validationErrors,
        },
        { status: 422 }
      );
    }

    // Save to Database if it's a persisted DB Form
    if (isDbForm && targetTemplateId) {
      const clientIp =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';
      const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      await FormSubmission.create({
        formId: targetTemplateId,
        data,
        submittedAt: new Date(),
        ipHash,
        userAgent,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your response has been recorded.',
    });
  } catch (error: any) {
    console.error('Error handling form submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record submission', error: error.message },
      { status: 500 }
    );
  }
}
