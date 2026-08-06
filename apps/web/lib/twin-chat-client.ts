export interface TwinMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
}

export const DEMO_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'Team standup', start: '09:00', end: '09:30' },
  { id: '2', title: 'Focus block', start: '11:00', end: '12:30' },
  { id: '3', title: 'Client review', start: '14:00', end: '15:00', location: 'Zoom' },
];

export function apiUnavailable(res: Response): boolean {
  if (res.status === 404 || res.status === 405) return true;
  const ct = res.headers.get('content-type') ?? '';
  return ct.includes('text/html');
}

export function demoTwinReply(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('plan my day') || lower.includes('plan today') || (lower.includes('plan') && lower.includes('day'))) {
    return [
      '[Offline fallback]',
      '',
      "Good morning! Here's a suggested plan based on today's schedule:",
      '',
      '• 09:00 — Team standup (30 min)',
      '• 11:00–12:30 — Focus block — tackle highest-priority approvals',
      '• 14:00 — Client review (Zoom)',
      '• 15:30 — Email & follow-ups',
      '',
      'Sign in and ensure the Laravel AI proxy is deployed for live calendar-aware replies.',
    ].join('\n');
  }
  if (lower.includes('next meeting')) {
    return `[Offline fallback]\n\nYour next meeting is **Team standup** at 09:00–09:30.\n\nLive calendar sync requires Starter plan + backend API.`;
  }
  if (lower.includes('focus')) {
    return `[Offline fallback]\n\nYou have a focus block today from 11:00–12:30. I'd suggest tackling your highest-priority approvals first.`;
  }
  return `[Offline fallback]\n\nYou asked: "${message.slice(0, 200)}${message.length > 200 ? '…' : ''}"\n\nI'm your Digital Twin — the live API is unreachable. Check that OPENAI_API_KEY is set in laravel-auth/.env on the server.`;
}

export async function typewriterReveal(
  text: string,
  onChunk: (text: string) => void,
): Promise<void> {
  let shown = '';
  for (const word of text.split(' ')) {
    shown += (shown ? ' ' : '') + word;
    onChunk(shown);
    await new Promise((r) => setTimeout(r, 14));
  }
}

export async function twinChatApi(
  message: string,
  history: TwinMessage[] = [],
  onChunk?: (text: string) => void,
): Promise<{ reply: string; demo: boolean; messagesRemaining?: number | null; error?: string }> {
  const reveal = async (reply: string) => {
    if (onChunk) await typewriterReveal(reply, onChunk);
    return reply;
  };

  try {
    const res = await fetch('/api/v1/twin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message, history }),
    });

    if (apiUnavailable(res)) {
      const reply = await reveal(demoTwinReply(message));
      return { reply, demo: true, error: 'API unreachable (static hosting returned HTML)' };
    }

    const data = (await res.json().catch(() => ({}))) as {
      reply?: string;
      messagesRemaining?: number | null;
      error?: { message?: string } | string;
    };

    if (res.status === 401) {
      return {
        reply: 'Sign in to chat with your Digital Twin.',
        demo: false,
        error: 'unauthorized',
      };
    }

    const errMsg =
      typeof data.error === 'string'
        ? data.error
        : data.error?.message;

    const replyText = data.reply?.trim();
    if (!res.ok || !replyText) {
      if (errMsg) {
        return { reply: errMsg, demo: false, error: errMsg };
      }
      const reply = await reveal(demoTwinReply(message));
      return { reply, demo: true, error: `Request failed (${res.status})` };
    }

    if (onChunk) onChunk(replyText);
    return {
      reply: replyText,
      demo: false,
      messagesRemaining: data.messagesRemaining,
    };
  } catch (err) {
    const reply = await reveal(demoTwinReply(message));
    return {
      reply,
      demo: true,
      error: err instanceof Error ? err.message : 'Network error',
    };
  }
}
