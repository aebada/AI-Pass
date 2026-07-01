import { handleCategories } from '@ai-pass/store-api';
import { jsonOk } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  return jsonOk(handleCategories().data);
}
