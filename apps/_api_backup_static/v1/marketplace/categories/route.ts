import { MARKETPLACE_CATEGORIES, CATEGORY_LABELS } from '@ai-pass/marketplace-core';
import { jsonOk, getPlatform } from '@/src/lib/marketplace-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const platform = getPlatform();
  const counts = MARKETPLACE_CATEGORIES.map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
    count: platform.search.getByCategory(cat).length,
  }));

  return jsonOk({ categories: counts });
}
