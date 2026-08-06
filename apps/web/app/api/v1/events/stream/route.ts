import { getLiveSyncEngine } from '@ai-pass/livesync';
import type { LiveSyncChannelTopic } from '@ai-pass/shared';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topicsParam = searchParams.get('topics');
  const topics = topicsParam
    ? (topicsParam.split(',') as LiveSyncChannelTopic[])
    : undefined;

  const engine = getLiveSyncEngine();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      // Replay recent history
      for (const msg of engine.channels.getHistory(undefined, topics?.[0])) {
        if (!topics || topics.includes(msg.topic)) send(msg);
      }

      const unsubscribe = engine.channels.subscribe((message) => {
        if (!topics || topics.includes(message.topic)) {
          send(message);
        }
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': heartbeat\n\n'));
      }, 15_000);

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
