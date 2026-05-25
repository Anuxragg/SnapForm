import { NextRequest, NextResponse } from 'next/server';
import { generateReactComponent } from '@/lib/generators/componentGenerator';
import { generateZodSchema } from '@/lib/generators/zodGenerator';
import { generateApiRoute } from '@/lib/generators/apiGenerator';
import * as archiverNamespace from 'archiver';
import fs from 'fs';
import path from 'path';

const archiver = (archiverNamespace.default || archiverNamespace) as any;

// Helper to write ZIP archive using streams in a Promise
async function createZipArchive(
  outputFilePath: string,
  componentCode: string,
  schemaCode: string,
  routeCode: string
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    output.on('close', () => resolve());
    archive.on('error', (err: any) => reject(err));

    archive.pipe(output);
    archive.append(componentCode, { name: 'form-bundle/FormComponent.tsx' });
    archive.append(schemaCode, { name: 'form-bundle/schema.ts' });
    archive.append(routeCode, { name: 'form-bundle/route.ts' });
    archive.finalize();
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Support both new API spec (prompt, fields, theme, framework)
    // and builder page payload format (fields, styling, name)
    const fields = body.fields;
    const prompt = body.prompt || body.name;
    const theme = body.theme || (body.styling && body.styling.theme) || 'modern';
    const framework = body.framework || 'nextjs-14';

    // 1. Error handling: Invalid inputs
    if (!fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or empty fields array provided' },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid or missing prompt description' },
        { status: 400 }
      );
    }

    let componentCode = '';
    let schemaCode = '';
    let routeCode = '';
    let usedAI = false;

    const key = process.env.GEMINI_API_KEY;

    if (key) {
      try {
        const systemPrompt = `You are a premium Next.js full-stack form compiler.
Generate clean, production-ready form code styled with Tailwind CSS, using react-hook-form for frontend and zod for validation.

Return a JSON object matching this structure EXACTLY:
{
  "component": "string (complete React component code)",
  "schema": "string (complete Zod validation schema code)",
  "route": "string (complete Next.js API route handler code)"
}

Requirements for generating code files:
1. FormComponent.tsx (component):
   - Use 'use client'; at the very top.
   - styled with Tailwind CSS matching the selected theme.
     - 'modern': Glassmorphism, smooth gradients, thin borders, soft shadows, round edges.
     - 'minimal': High-contrast, sharp borders, monospace font accents, stark layout.
     - 'corporate': Rigid layout, slate colors, professional form paddings, formal labels.
   - Use Lucide icons where appropriate.
   - Integrate react-hook-form and zodResolver using schema.ts.
   - Display client-side validation errors reactively.
   - Make a POST request to '/api/submit' to handle submit, displaying loading states and visual toasts.

2. schema.ts (schema):
   - Define a zod schema named FormSchema.
   - Use robust, standard validation rules for each field (e.g. email checks, minLength, required, pattern regex).

3. route.ts (route):
   - Standard Next.js Route Handler (using NEXT.JS 14 App Router layout).
   - Import FormSchema from './schema' and run safeParse on req.json() body.
   - If validation fails, return 400 with errors.
   - Return 200 JSON response on successful validation.

Selected Theme: ${theme}
Selected Framework: ${framework}
User Prompt idea: ${prompt}
Input fields config to build: ${JSON.stringify(fields, null, 2)}
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: systemPrompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: 'OBJECT',
                  properties: {
                    component: { type: 'STRING' },
                    schema: { type: 'STRING' },
                    route: { type: 'STRING' },
                  },
                  required: ['component', 'schema', 'route'],
                },
              },
            }),
          }
        );

        if (response.status === 429) {
          throw new Error('Gemini API Rate limit exceeded');
        }

        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error.message || 'Gemini API execution error');
        }

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
          const parsed = JSON.parse(text);
          componentCode = parsed.component;
          schemaCode = parsed.schema;
          routeCode = parsed.route;
          usedAI = true;
        }
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to local compilers:', err.message);
      }
    } else {
      console.warn('GEMINI_API_KEY environment variable is not defined. Using local compiler fallbacks.');
    }

    // 2. Fallback logic: If AI generation failed or wasn't configured, run local engines
    if (!usedAI) {
      componentCode = generateReactComponent(fields, { theme, primaryColor: '#ff4f19' }, prompt);
      schemaCode = generateZodSchema(fields, prompt);
      routeCode = generateApiRoute(fields, prompt);
    }

    // 3. Zipping generated files using archiver package
    const id = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const zipFileName = `SnapForm-${id}.zip`;
    const outputDirectory = path.join(process.cwd(), 'public', 'downloads');

    // Ensure output directory exists
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }

    const outputFilePath = path.join(outputDirectory, zipFileName);
    await createZipArchive(outputFilePath, componentCode, schemaCode, routeCode);

    const downloadUrl = `/downloads/${zipFileName}`;

    // 4. Return JSON response matching both API spec and builder compatibility
    return NextResponse.json({
      success: true,
      aiGenerated: usedAI,
      data: {
        component: componentCode,
        schema: schemaCode,
        apiRoute: routeCode,
        route: routeCode,
      },
      files: {
        component: componentCode,
        schema: schemaCode,
        route: routeCode,
      },
      downloadUrl,
    });
  } catch (error: any) {
    console.error('Error generating form code in POST endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate form code suite',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
