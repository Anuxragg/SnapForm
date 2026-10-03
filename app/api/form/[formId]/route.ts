import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import FormSubmission from '@/models/FormSubmission';
import mongoose from 'mongoose';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';
import { resolveForm } from '@/lib/formResolver';
import { apiErrorResponse } from '@/lib/apiRequest';

const MAX_SUBMISSION_BYTES = 1024 * 1024;
const SUBMISSION_CONTROL_FIELDS = new Set(['_gotcha', '_honeypot', 'bot_trap', '_bot']);

async function getBoundedRequest(request: NextRequest): Promise<Request> {
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_SUBMISSION_BYTES) {
    throw new Error('SUBMISSION_TOO_LARGE');
  }

  if (!request.body) return new Request(request.url, { method: request.method, headers: request.headers });

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > MAX_SUBMISSION_BYTES) {
      await reader.cancel();
      throw new Error('SUBMISSION_TOO_LARGE');
    }
    chunks.push(value);
  }

  return new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: Buffer.concat(chunks),
  });
}

function isSafeSameOriginRedirect(value: string, requestUrl: string): URL | null {
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) {
    return null;
  }

  try {
    const target = new URL(value, requestUrl);
    return target.origin === new URL(requestUrl).origin ? target : null;
  } catch {
    return null;
  }
}

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
  } catch (error: unknown) {
    return apiErrorResponse('Error fetching public form:', error, 'Failed to load form.');
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

    const rateLimit = await checkRateLimit(`form_sub_${clientIp}`, {
      limit: 60,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.available) {
      return NextResponse.json(
        { success: false, message: 'Submissions are temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

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
    let boundedRequest: Request;
    try {
      boundedRequest = await getBoundedRequest(request);
    } catch (error) {
      if (error instanceof Error && error.message === 'SUBMISSION_TOO_LARGE') {
        return NextResponse.json(
          { success: false, message: 'Submission is too large. Maximum size is 1 MB.' },
          { status: 413 }
        );
      }
      throw error;
    }

    if (contentType.includes('application/json')) {
      try {
        const body = await boundedRequest.json();
        if (body && typeof body === 'object' && !Array.isArray(body)) {
          rawData = body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : body;
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
        const formData = await boundedRequest.formData();
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
        const body = await boundedRequest.json();
        if (body && typeof body === 'object' && !Array.isArray(body)) {
          rawData = body.data && typeof body.data === 'object' && !Array.isArray(body.data) ? body.data : body;
        }
      } catch {
        try {
          const formData = await boundedRequest.formData();
          for (const [key, value] of formData.entries()) {
            rawData[key] = value;
          }
        } catch {
          // fallback to empty
          rawData = {};
        }
      }
    }

    if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
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

    const acceptedFieldNames = new Set<string>();
    for (const field of formFields) {
      if (field.id) {
        acceptedFieldNames.add(field.id);
        acceptedFieldNames.add(field.id.toLowerCase());
      }
      if (field.label) {
        acceptedFieldNames.add(field.label);
        acceptedFieldNames.add(field.label.toLowerCase());
        acceptedFieldNames.add(field.label.toLowerCase().replace(/\s+/g, ''));
      }
      if (['fullName', 'contactName', 'name', 'user_name'].includes(field.id)) {
        ['name', 'fullName', 'fullname', 'contactName', 'contact_name'].forEach((key) => acceptedFieldNames.add(key));
      }
      if (['email', 'workEmail', 'userEmail'].includes(field.id)) {
        ['email', 'workEmail', 'userEmail', 'mail'].forEach((key) => acceptedFieldNames.add(key));
      }
      if (['phone', 'phoneNumber', 'mobile'].includes(field.id)) {
        ['phone', 'phoneNumber', 'tel', 'mobile'].forEach((key) => acceptedFieldNames.add(key));
      }
      if (['message', 'comments', 'notes', 'inquiry'].includes(field.id)) {
        ['message', 'comments', 'notes', 'inquiry', 'body'].forEach((key) => acceptedFieldNames.add(key));
      }
    }

    const acceptHeader = request.headers.get('accept') || '';
    const wantsHtmlRedirect = acceptHeader.includes('text/html') && !acceptHeader.includes('application/json');
    const allowedControlFields = new Set(SUBMISSION_CONTROL_FIELDS);
    if (wantsHtmlRedirect) ['_next', 'next', 'redirect'].forEach((key) => allowedControlFields.add(key));

    const unknownFields = Object.keys(rawData).filter(
      (key) => !acceptedFieldNames.has(key) && !allowedControlFields.has(key)
    );
    if (unknownFields.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Submission contains fields that are not part of this form.' },
        { status: 400 }
      );
    }

    const nextUrl = rawData._next ?? rawData.next ?? rawData.redirect;
    let safeRedirect: URL | null = null;
    if (wantsHtmlRedirect && nextUrl !== undefined && nextUrl !== '') {
      safeRedirect = typeof nextUrl === 'string' ? isSafeSameOriginRedirect(nextUrl.trim(), request.url) : null;
      if (!safeRedirect) {
        return NextResponse.json(
          { success: false, message: 'Redirect must be a safe path on this site.' },
          { status: 400 }
        );
      }
    }

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
    if (wantsHtmlRedirect) {
      if (safeRedirect) return NextResponse.redirect(safeRedirect);
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
  } catch (error: unknown) {
    return apiErrorResponse('Error handling form submission:', error, 'Failed to record submission.');
  }
}
