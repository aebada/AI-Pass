import { jsonOk, jsonError, getKnowledge } from '@/src/lib/knowledge-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      sourceId?: string;
      force?: boolean;
      content?: string;
      title?: string;
    };

    if (!body.sourceId) {
      return jsonError('sourceId required');
    }

    const kp = getKnowledge();
    const event = await kp.sync.syncSource({
      sourceId: body.sourceId,
      force: body.force,
      documentContent: body.content,
      documentTitle: body.title,
    });

    return jsonOk(event);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Sync failed');
  }
}
