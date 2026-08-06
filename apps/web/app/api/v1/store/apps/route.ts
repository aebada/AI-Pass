import { handleListApps, handleCreateApp } from '@ai-pass/store-api';
import { jsonOk, jsonError } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const result = handleListApps();
  return jsonOk(result.data);
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const result = handleCreateApp(body);
    return jsonOk(result.data, 201);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Registration failed');
  }
}
