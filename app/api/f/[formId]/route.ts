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

    // 1. Honeypot & Bot Trap Protection on Server
    if (data._gotcha || data._honeypot || data.bot_trap) {
      return NextResponse.json(
        { success: false, message: 'Spam submission detected' },
        { status: 400 }
      );
    }

    // 2. Resolve Form Schema
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

    // 3. Strict Server-Side Validation against Form Field Definitions
    const validationErrors: Record<string, string> = {};
    const sanitizedData: Record<string, any> = {};

    for (const field of formFields) {
      let val = data[field.id];

      // Sanitize text inputs by removing null bytes & extra trailing whitespaces
      if (typeof val === 'string') {
        val = val.replace(/\0/g, '').trim();
      }

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

      // Skip type validation if optional and omitted
      if (val === undefined || val === null || val === '') {
        continue;
      }

      // Email format check on server
      if (field.type === 'email') {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (typeof val !== 'string' || !emailRegex.test(val)) {
          validationErrors[field.id] = 'Please provide a valid email address';
          continue;
        }
      }

      // URL format check on server
      if (field.type === 'url' && typeof val === 'string') {
        try {
          const parsedUrl = new URL(val.startsWith('http') ? val : `https://${val}`);
          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            validationErrors[field.id] = 'Please provide a valid HTTP/HTTPS URL';
            continue;
          }
        } catch {
          validationErrors[field.id] = 'Please provide a valid URL';
          continue;
        }
      }

      // Number validation on server
      if (field.type === 'number') {
        const num = Number(val);
        if (isNaN(num)) {
          validationErrors[field.id] = 'Must be a valid number';
          continue;
        }
        val = num;
      }

      // Select / Radio allowed options check on server
      if ((field.type === 'select' || field.type === 'radio') && field.options && Array.isArray(field.options) && field.options.length > 0) {
        const allowedValues = field.options.map((opt: any) => typeof opt === 'string' ? opt : opt.value ?? opt.label);
        if (!allowedValues.includes(val)) {
          validationErrors[field.id] = `"${val}" is not a valid choice`;
          continue;
        }
      }

      // Text length and custom regex validation on server
      if (typeof val === 'string') {
        if (field.validation) {
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
              // ignore invalid regex definition
            }
          }
        }
      }

      sanitizedData[field.id] = val;
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
        data: sanitizedData,
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
