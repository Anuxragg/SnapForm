import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import FormTemplate from '@/models/FormTemplate';
import FormSubmission from '@/models/FormSubmission';
import FormView from '@/models/FormView';
import { getSession } from '@/lib/auth';
import mongoose from 'mongoose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getSession();

    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const timeframe = (searchParams.get('timeframe') || '30days') as '7days' | '30days' | '12months';
    const formId = searchParams.get('formId') || 'all';

    // 1. Fetch user's forms
    const userForms = await FormTemplate.find({ userId: session.id }).lean();
    let targetFormIds: mongoose.Types.ObjectId[] = [];

    if (formId !== 'all') {
      // Ensure the requested form belongs to the user
      const matched = userForms.find(
        (f: any) => f._id.toString() === formId || f.shortId === formId
      );
      if (matched) {
        targetFormIds = [new mongoose.Types.ObjectId(matched._id)];
      }
    } else {
      targetFormIds = userForms.map((f: any) => f._id);
    }

    // Calculate total views stored on the form documents as baseline
    const templateViewsCount = userForms.reduce((acc, f: any) => {
      if (formId === 'all' || f._id.toString() === formId || f.shortId === formId) {
        return acc + (f.views || 0);
      }
      return acc;
    }, 0);

    // 2. Determine start date based on timeframe
    const now = new Date();
    let startDate = new Date();
    let bucketCount = 7;
    let formatLabel: (date: Date, index: number) => string;

    if (timeframe === '7days') {
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 7;
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      formatLabel = (d: Date) => days[d.getDay()];
    } else if (timeframe === '30days') {
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 15; // 15 2-day intervals
      formatLabel = (_d: Date, idx: number) => `Day ${idx * 2 + 1}`;
    } else {
      // 12 months
      startDate.setMonth(now.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      bucketCount = 12;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      formatLabel = (d: Date) => months[d.getMonth()];
    }

    // 3. Fetch submissions and actual view events within the timeframe
    let submissions: any[] = [];
    let viewEvents: any[] = [];

    if (targetFormIds.length > 0) {
      const [subs, views] = await Promise.all([
        FormSubmission.find({
          formId: { $in: targetFormIds },
          submittedAt: { $gte: startDate },
        })
          .sort({ submittedAt: 1 })
          .lean(),
        FormView.find({
          formId: { $in: targetFormIds },
          viewedAt: { $gte: startDate },
        })
          .sort({ viewedAt: 1 })
          .lean(),
      ]);
      submissions = subs;
      viewEvents = views;
    }

    const totalSubmissions = submissions.length;
    const totalRecordedViews = Math.max(templateViewsCount, viewEvents.length);

    // 4. Generate genuine time-series buckets
    const buckets: Array<{ label: string; submissions: number; impressions: number; conversion: number }> = [];

    if (timeframe === '7days') {
      for (let i = 0; i < 7; i++) {
        const bucketDate = new Date(startDate);
        bucketDate.setDate(startDate.getDate() + i);
        const nextDate = new Date(bucketDate);
        nextDate.setDate(bucketDate.getDate() + 1);

        const subCount = submissions.filter(
          (s) => new Date(s.submittedAt) >= bucketDate && new Date(s.submittedAt) < nextDate
        ).length;

        const viewCount = viewEvents.filter(
          (v) => new Date(v.viewedAt) >= bucketDate && new Date(v.viewedAt) < nextDate
        ).length;

        const bucketImpressions = Math.max(viewCount, subCount);
        const conv =
          bucketImpressions > 0
            ? ((subCount / bucketImpressions) * 100).toFixed(1)
            : subCount > 0
            ? '100.0'
            : '0.0';

        buckets.push({
          label: formatLabel(bucketDate, i),
          submissions: subCount,
          impressions: bucketImpressions,
          conversion: parseFloat(conv),
        });
      }
    } else if (timeframe === '30days') {
      const intervalDays = 2;
      for (let i = 0; i < bucketCount; i++) {
        const bucketDate = new Date(startDate);
        bucketDate.setDate(startDate.getDate() + i * intervalDays);
        const nextDate = new Date(bucketDate);
        nextDate.setDate(bucketDate.getDate() + intervalDays);

        const subCount = submissions.filter(
          (s) => new Date(s.submittedAt) >= bucketDate && new Date(s.submittedAt) < nextDate
        ).length;

        const viewCount = viewEvents.filter(
          (v) => new Date(v.viewedAt) >= bucketDate && new Date(v.viewedAt) < nextDate
        ).length;

        const bucketImpressions = Math.max(viewCount, subCount);
        const conv =
          bucketImpressions > 0
            ? ((subCount / bucketImpressions) * 100).toFixed(1)
            : subCount > 0
            ? '100.0'
            : '0.0';

        buckets.push({
          label: formatLabel(bucketDate, i),
          submissions: subCount,
          impressions: bucketImpressions,
          conversion: parseFloat(conv),
        });
      }
    } else {
      // 12 months
      for (let i = 0; i < 12; i++) {
        const bucketDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        const nextDate = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 1);

        const subCount = submissions.filter(
          (s) => new Date(s.submittedAt) >= bucketDate && new Date(s.submittedAt) < nextDate
        ).length;

        const viewCount = viewEvents.filter(
          (v) => new Date(v.viewedAt) >= bucketDate && new Date(v.viewedAt) < nextDate
        ).length;

        const bucketImpressions = Math.max(viewCount, subCount);
        const conv =
          bucketImpressions > 0
            ? ((subCount / bucketImpressions) * 100).toFixed(1)
            : subCount > 0
            ? '100.0'
            : '0.0';

        buckets.push({
          label: formatLabel(bucketDate, i),
          submissions: subCount,
          impressions: bucketImpressions,
          conversion: parseFloat(conv),
        });
      }
    }

    const calculatedTotalViews = Math.max(
      totalRecordedViews,
      buckets.reduce((acc, b) => acc + b.impressions, 0)
    );

    const overallConversion =
      calculatedTotalViews > 0
        ? ((totalSubmissions / calculatedTotalViews) * 100).toFixed(1)
        : totalSubmissions > 0
        ? '100.0'
        : '0.0';

    // Calculate genuine response time if views and submissions with timestamps exist
    let responseTimeStr = '0s';
    if (totalSubmissions > 0) {
      // Look for matched view to submission intervals if available
      const durations: number[] = [];
      submissions.forEach((sub) => {
        if (sub.ipHash) {
          const matchedView = viewEvents.find(
            (v) => v.visitorHash === sub.ipHash && new Date(v.viewedAt) <= new Date(sub.submittedAt)
          );
          if (matchedView) {
            const diffSec = Math.round(
              (new Date(sub.submittedAt).getTime() - new Date(matchedView.viewedAt).getTime()) / 1000
            );
            if (diffSec > 0 && diffSec < 3600) {
              durations.push(diffSec);
            }
          }
        }
      });

      if (durations.length > 0) {
        const avgSec = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
        responseTimeStr = avgSec >= 60 ? `${Math.floor(avgSec / 60)}m ${avgSec % 60}s` : `${avgSec}s`;
      } else {
        responseTimeStr = '0s';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalViews: calculatedTotalViews,
        totalSubmissions,
        avgConversion: overallConversion,
        avgResponseTime: responseTimeStr,
        timeSeries: buckets,
      },
    });
  } catch (error: any) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve analytics', error: error.message },
      { status: 500 }
    );
  }
}
