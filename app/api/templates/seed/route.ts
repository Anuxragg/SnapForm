import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import { PREDEFINED_TEMPLATES } from '@/lib/templates';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret');
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, prevent arbitrary seed triggers unless authorized
    if (isProduction && secret !== process.env.SESSION_SECRET) {
      const existingPredefined = await FormTemplate.countDocuments({ userId: { $exists: false } });
      if (existingPredefined > 0) {
        return NextResponse.json(
          { success: true, message: 'Templates already seeded', count: existingPredefined },
          { status: 200 }
        );
      }
    }

    // Clear only existing predefined starter templates to avoid duplicating blueprints and protect user custom forms
    await FormTemplate.deleteMany({ userId: { $exists: false } });

    // Seed the predefined templates
    const createdTemplates = await FormTemplate.insertMany(PREDEFINED_TEMPLATES);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with predefined templates!',
      count: createdTemplates.length,
      templates: createdTemplates,
    });
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database seeding failed',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
