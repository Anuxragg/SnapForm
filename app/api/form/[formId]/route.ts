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

    const isBot = /bot|googlebot|crawler|spider|robot|crawling|lighthouse|headless|curl|wget|python/i.test(userAgent);

    let visitorHash: string | undefined = undefined;
    if (!isBot) {
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

    const acceptHeader = request.headers.get('accept') || '';
    const fetchDest = request.headers.get('sec-fetch-dest') || '';
    if (acceptHeader.includes('text/html') && (fetchDest === 'document' || !fetchDest)) {
      return NextResponse.redirect(new URL(`/form/${resolved.id}`, request.url));
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

    const rateLimit = checkRateLimit(`form_sub_${clientIp}`, {
      limit: 60,
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

    let rawData: Record<string, any> = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const body = await request.json();
        if (body && typeof body === 'object') {
          rawData = body.data && typeof body.data === 'object' ? body.data : body;
        }
      } catch (e) {
        return NextResponse.json(
          { success: false, message: 'Invalid JSON payload' },
          { status: 400 }
        );
      }
    } else if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      try {
        const formData = await request.formData();
        for (const [key, value] of formData.entries()) {
          rawData[key] = value;
        }
      } catch (e) {
        return NextResponse.json(
          { success: false, message: 'Invalid form data payload' },
          { status: 400 }
        );
      }
    } else {
      try {
        const body = await request.json();
        if (body && typeof body === 'object') {
          rawData = body.data && typeof body.data === 'object' ? body.data : body;
        }
      } catch {
        try {
          const formData = await request.formData();
          for (const [key, value] of formData.entries()) {
            rawData[key] = value;
          }
        } catch {
          // fallback to empty
          rawData = {};
        }
      }
    }

    if (!rawData || typeof rawData !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid submission data provided' },
        { status: 400 }
      );
    }

    // Honeypot spam protection
    if (rawData._gotcha || rawData._honeypot || rawData.bot_trap || rawData._bot) {
      return NextResponse.json(
        { success: false, message: 'Spam submission detected' },
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

    const formFields = resolved.fields || [];
    const isDbForm = !resolved.isPredefined && Boolean(resolved.dbId);
    const targetTemplateId = resolved.dbId ? new mongoose.Types.ObjectId(resolved.dbId) : null;

    const validationErrors: Record<string, string> = {};
    const sanitizedData: Record<string, any> = {};

    for (const field of formFields) {
      // Intelligent field key matching (exact id, lowercase, stripped, or common aliases)
      let val = rawData[field.id];
      if (val === undefined) {
        val = rawData[field.id.toLowerCase()];
      }
      if (val === undefined && field.label) {
        val = rawData[field.label] ?? rawData[field.label.toLowerCase()] ?? rawData[field.label.toLowerCase().replace(/\s+/g, '')];
      }
      if (val === undefined) {
        if (['fullName', 'contactName', 'name', 'user_name'].includes(field.id)) {
          val = rawData['name'] ?? rawData['fullName'] ?? rawData['fullname'] ?? rawData['contactName'] ?? rawData['contact_name'];
        } else if (['email', 'workEmail', 'userEmail'].includes(field.id)) {
          val = rawData['email'] ?? rawData['workEmail'] ?? rawData['userEmail'] ?? rawData['mail'];
        } else if (['phone', 'phoneNumber', 'mobile'].includes(field.id)) {
          val = rawData['phone'] ?? rawData['phoneNumber'] ?? rawData['tel'] ?? rawData['mobile'];
        } else if (['message', 'comments', 'notes', 'inquiry'].includes(field.id)) {
          val = rawData['message'] ?? rawData['comments'] ?? rawData['notes'] ?? rawData['inquiry'] ?? rawData['body'];
        }
      }

      if (typeof val === 'string') {
        val = val.replace(/\0/g, '').trim();
      }

      if (field.required) {
        if (
          val === undefined ||
          val === null ||
          val === '' ||
          (Array.isArray(val) && val.length === 0) ||
          (field.type === 'checkbox' && val !== true && val !== 'true' && val !== 'on' && (!Array.isArray(val) || val.length === 0))
        ) {
          validationErrors[field.id] = `${field.label || 'This field'} is required`;
          continue;
        }
      }

      if (val === undefined || val === null || val === '') {
        continue;
      }

      if (field.type === 'email') {
        const emailRegex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (typeof val !== 'string' || !emailRegex.test(val)) {
          validationErrors[field.id] = 'Please provide a valid email address';
          continue;
        }
      }

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

      if (field.type === 'number') {
        const num = Number(val);
        if (isNaN(num)) {
          validationErrors[field.id] = 'Must be a valid number';
          continue;
        }
        val = num;
      }

      if (
        (field.type === 'select' || field.type === 'radio') &&
        field.options &&
        Array.isArray(field.options) &&
        field.options.length > 0
      ) {
        const allowedValues = field.options.map((opt: any) =>
          typeof opt === 'string' ? opt : opt.value ?? opt.label
        );
        if (!allowedValues.includes(val)) {
          validationErrors[field.id] = `"${val}" is not a valid choice`;
          continue;
        }
      }

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
            // ignore invalid regex
          }
        }
      }

      sanitizedData[field.id] = val;
    }

    // Include any additional unmapped fields from submission
    for (const [key, value] of Object.entries(rawData)) {
      if (key.startsWith('_')) continue;
      if (sanitizedData[key] === undefined && value !== undefined && value !== '') {
        sanitizedData[key] = typeof value === 'string' ? value.replace(/\0/g, '').trim() : value;
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

    if (isDbForm && targetTemplateId) {
      const clientIp =
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';
      const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      await connectToDatabase();
      await FormSubmission.create({
        formId: targetTemplateId,
        data: sanitizedData,
        submittedAt: new Date(),
        ipHash,
        userAgent,
      });

      // Increment template submissions count
      await FormTemplate.updateOne(
        { _id: targetTemplateId },
        { $inc: { submissions: 1 } }
      ).catch(() => {});
    }

    // Support HTML form redirects if submitted from a standard browser HTML form
    const acceptHeader = request.headers.get('accept') || '';
    const nextUrl = rawData._next || rawData.next || rawData.redirect;
    if (acceptHeader.includes('text/html') && !acceptHeader.includes('application/json')) {
      if (nextUrl && typeof nextUrl === 'string' && (nextUrl.startsWith('/') || nextUrl.startsWith('http'))) {
        return NextResponse.redirect(new URL(nextUrl, request.url));
      }
      return NextResponse.redirect(new URL(`/form/${resolved.id}?submitted=true`, request.url));
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your response has been recorded.',
      data: {
        formId: resolved.id,
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error handling form submission:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record submission', error: error.message },
      { status: 500 }
    );
  }
}
