import { NextResponse } from 'next/server';
import { z } from 'zod';

export const requestSchemas = {
  login: z.object({
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    password: z.string().min(1).max(128),
  }).strict(),
  signup: z.object({
    name: z.string().trim().max(120).optional(),
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    password: z.string().min(6).max(128),
  }).strict(),
  sendOtp: z.object({
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    name: z.string().trim().max(120).optional(),
  }).strict(),
  verifyOtp: z.object({
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    code: z.string().trim().regex(/^\d{6}$/),
  }).strict(),
  forgotPassword: z.object({
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  }).strict(),
  resetPassword: z.object({
    email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
    token: z.string().min(1).max(256),
    password: z.string().min(8).max(128),
  }).strict(),
};

type ParsedJsonBody<Schema extends z.ZodType> =
  | { success: true; data: z.infer<Schema> }
  | { success: false; response: NextResponse };

export async function parseJsonBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema
): Promise<ParsedJsonBody<Schema>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: NextResponse.json({ success: false, message: 'Request body must be valid JSON.' }, { status: 400 }),
    };
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid request data.', errors: parsed.error.issues.map(({ path, message }) => ({ path, message })) },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: parsed.data };
}

export function apiErrorResponse(
  context: string,
  error: unknown,
  message: string,
  headers?: HeadersInit
): NextResponse {
  console.error(context, error);
  return NextResponse.json({ success: false, message }, { status: 500, headers });
}
