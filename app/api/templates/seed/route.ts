import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import { PREDEFINED_TEMPLATES } from '@/lib/templates';

export async function GET() {
  try {
    await connectToDatabase();

    // Clear existing templates to avoid duplication
    await FormTemplate.deleteMany({});

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
