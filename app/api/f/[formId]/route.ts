import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import FormSubmission from '@/models/FormSubmission';
import mongoose from 'mongoose';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';
import { resolveForm } from '@/lib/formResolver';

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

    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Ignore known bots / crawlers (e.g. Googlebot, Bingbot, HeadlessChrome, python-requests, etc.)
    const isBot = /bot|googlebot|crawler|spider|robot|crawling|lighthouse|headless|curl|wget|python/i.test(userAgent);

    let visitorHash: string | undefined = undefined;
    if (!isBot) {
      // Deterministic anonymous visitor fingerprint (IP + User-Agent)
      visitorHash = crypto
        .createHash('sha256')
        .update(`${clientIp}::${userAgent}`)
        .digest('hex')
        .substring(0, 32);
    }

    const resolved = await resolveForm(formId, {
      incrementViews: Boolean(visitorHash),
      visitorHash,
    });

    if (!resolved || !resolved.found) {
      return NextResponse.json(
        { success: false, message: 'Form not found or has been removed' },
        { status: 404 }
      );
    }

    // If navigated directly from browser address bar (HTML request), redirect to hosted page
    const acceptHeader = request.headers.get('accept') || '';
    const fetchDest = request.headers.get('sec-fetch-dest') || '';
    if (acceptHeader.includes('text/html') && (fetchDest === 'document' || !fetchDest)) {
      return NextResponse.redirect(new URL(`/f/${resolved.id}`, request.url));
    }

    return NextResponse.json({
      success: true,
      data: {
        id: resolved.id,
        name: resolved.name,
        description: resolved.description,
        category: resolved.category,
        fields: resolved.fields,
        styling: resolved.styling,
        isPredefined: resolved.isPredefined,
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

    const resolved = await resolveForm(formId);

    if (!resolved || !resolved.found) {
      return NextResponse.json(
        { success: false, message: 'Target form not found' },
        { status: 404 }
      );
    }

    const formFields = resolved.fields;
    const isDbForm = !resolved.isPredefined && Boolean(resolved.dbId);
    const targetTemplateId = resolved.dbId ? (new mongoose.Types.ObjectId(resolved.dbId)) : null;

    if (!formFields.length && !resolved.isPredefined) {
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
