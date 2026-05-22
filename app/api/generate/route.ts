import { NextRequest, NextResponse } from 'next/server';
import { generateReactComponent } from '@/lib/generators/componentGenerator';
import { generateZodSchema } from '@/lib/generators/zodGenerator';
import { generateApiRoute } from '@/lib/generators/apiGenerator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fields, styling, name } = body;

    if (!fields || !styling || !name) {
      return NextResponse.json(
        { success: false, message: 'Missing fields, styling, or name configuration for generation' },
        { status: 400 }
      );
    }

    const componentCode = generateReactComponent(fields, styling, name);
    const schemaCode = generateZodSchema(fields, name);
    const apiRouteCode = generateApiRoute(fields, name);

    return NextResponse.json({
      success: true,
      data: {
        component: componentCode,
        schema: schemaCode,
        apiRoute: apiRouteCode,
      },
    });
  } catch (error: any) {
    console.error('Error generating form code:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate code',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
