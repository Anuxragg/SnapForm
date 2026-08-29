import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import FormTemplate, { IFormTemplate } from '@/models/FormTemplate';
import { PREDEFINED_TEMPLATES, ISeedFormTemplate } from '@/lib/templates';
import { generateShortId, getDeterministicShortId } from '@/lib/utils';

export interface ResolvedFormResult {
  found: boolean;
  isPredefined: boolean;
  id: string; // The canonical shortId (or blueprint slug)
  dbId?: string; // MongoDB _id if from database
  name: string;
  category: string;
  description: string;
  fields: any[];
  styling: {
    theme: 'minimal' | 'modern' | 'corporate';
    primaryColor: string;
  };
  rawDoc?: IFormTemplate | null;
}

/**
 * Robust, universal Form Resolver Pipeline.
 * Handles Short IDs (sf_k9x2m4), ObjectIds (6a932...), Blueprints (contact, payment...), and legacy prefixes.
 */
export async function resolveForm(
  idOrSlug: string,
  options: {
    incrementViews?: boolean;
    requireOwnerId?: string;
  } = {}
): Promise<ResolvedFormResult | null> {
  if (!idOrSlug || typeof idOrSlug !== 'string') {
    return null;
  }

  const rawId = idOrSlug.trim();
  const normalizedId = rawId.toLowerCase();
  const cleanId = rawId.replace(/^sf_/, '');

  // ─── 1. Check Predefined Blueprint Catalog ────────────────────────────────────
  const predefined = PREDEFINED_TEMPLATES.find(
    (t) =>
      t.id?.toLowerCase() === normalizedId ||
      t.category?.toLowerCase() === normalizedId ||
      `${t.category}-starter`.toLowerCase() === normalizedId ||
      t.id?.replace('-starter', '').toLowerCase() === normalizedId ||
      t.name?.toLowerCase().replace(/\s+/g, '-') === normalizedId
  );

  if (predefined) {
    return {
      found: true,
      isPredefined: true,
      id: predefined.id || `${predefined.category}-starter`,
      name: predefined.name,
      category: predefined.category,
      description: predefined.description,
      fields: predefined.fields || [],
      styling: predefined.styling || { theme: 'modern', primaryColor: '#ff4f19' },
      rawDoc: null,
    };
  }

  // ─── 2. Database Lookup via Multi-Key Match ─────────────────────────────────
  await connectToDatabase();

  const queryConditions: any[] = [
    { shortId: rawId },
    { shortId: normalizedId },
  ];

  if (mongoose.Types.ObjectId.isValid(rawId)) {
    queryConditions.push({ _id: rawId });
  }

  if (mongoose.Types.ObjectId.isValid(cleanId)) {
    queryConditions.push({ _id: cleanId });
  }

  const finalQuery: any = { $or: queryConditions };
  if (options.requireOwnerId) {
    finalQuery.userId = options.requireOwnerId;
  }

  let template: IFormTemplate | null = null;

  if (options.incrementViews) {
    template = await FormTemplate.findOneAndUpdate(
      finalQuery,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();
  } else {
    template = await FormTemplate.findOne(finalQuery).lean();
  }

  // ─── 3. Fallback: Prefix Match on legacy ObjectIds ────────────────────────────
  if (!template && cleanId.length >= 4) {
    const ownerFilter = options.requireOwnerId ? { userId: options.requireOwnerId } : {};
    const candidates = await FormTemplate.find(ownerFilter).limit(50).lean();
    const matched = candidates.find((t) =>
      t._id.toString().toLowerCase().startsWith(cleanId.toLowerCase())
    );

    if (matched) {
      template = matched as any;
      if (options.incrementViews && template) {
        await FormTemplate.updateOne({ _id: matched._id }, { $inc: { views: 1 } });
      }
    }
  }

  if (!template) {
    return null;
  }

  // Ensure shortId is permanently backfilled if missing
  let canonicalShortId = template.shortId;
  if (!canonicalShortId) {
    canonicalShortId = getDeterministicShortId(template._id.toString());
    FormTemplate.updateOne(
      { _id: template._id },
      { $set: { shortId: canonicalShortId } }
    ).catch(() => {});
  }

  return {
    found: true,
    isPredefined: false,
    id: canonicalShortId,
    dbId: template._id.toString(),
    name: template.name,
    category: template.category,
    description: template.description,
    fields: template.fields || [],
    styling: template.styling || { theme: 'modern', primaryColor: '#ff4f19' },
    rawDoc: template,
  };
}
