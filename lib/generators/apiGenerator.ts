import { IFormField } from '@/models/FormTemplate';

export function generateApiRoute(fields: IFormField[], formName: string = 'Form'): string {
  const schemaName = `${formName.replace(/\s+/g, '')}Schema`;
  const hasFiles = fields.some((field) => field.type === 'file');
  
  let parsingLogic = '';
  
  if (hasFiles) {
    parsingLogic = `
    let data: any = {};
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      
      // Parse entries
      formData.forEach((value, key) => {
        if (value instanceof File) {
          data[key] = value.name ? value : null; // Represent File in validation
        } else {
          // Check if string is serialized array (e.g. multi-checkboxes)
          try {
            data[key] = JSON.parse(value as string);
          } catch {
            data[key] = value;
          }
        }
      });
    } else {
      data = await req.json();
    }`;
  } else {
    parsingLogic = `
    const data = await req.json();`;
  }

  return `import { NextRequest, NextResponse } from 'next/server';
import { ${schemaName} } from './schema';

export async function POST(req: NextRequest) {
  try {${parsingLogic}

    // Server-side validation using Zod
    const validationResult = ${schemaName}.safeParse(data);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // TODO: Perform database operations, emails, integrations, or Stripe payments here.
    console.log('Successfully received validated form submission:', validatedData);

    return NextResponse.json({
      success: true,
      message: 'Form submitted and processed successfully on the server!',
      receivedData: validatedData,
    });
  } catch (error: any) {
    console.error('Error handling form submission API route:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error occurred',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
`;
}
