'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SignInCard } from '../../components/auth/SignInCard';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { useAuthSession } from '@/lib/use-auth-session';
import {
  DEMO_EVENTS,
  type CalendarEvent,
  type TwinMessage,
  twinChatApi,
} from '@/lib/twin-chat-client';
import { useApp } from '../../components/premium/AppProviders';
import styles from './twin.module.css';
import { ModuleIcon } from '@ai-pass/ui';

type Message = TwinMessage;

type TwinMemoryCategory = 'private' | 'business' | 'medical' | 'connections' | 'integrations';

interface TwinMemoryEntry {
  id: string;
  category: TwinMemoryCategory;
  key: string;
  value: string;
  updatedAt: string;
  consentGranted: boolean;
}

interface TwinLimits {
  speech: boolean;
  calendarSync: boolean;
  memoryCategories: boolean;
  monthlyMessages: number | null;
}

const MEMORY_LABELS: Record<TwinMemoryCategory, string> = {
  private: 'Private',
  business: 'Business',
  medical: 'Medical',
  connections: 'Connections',
  integrations: 'Integrations',
};

const QUICK_ACTIONS = [
  { label: 'Plan my day', message: 'Plan my day based on my calendar and priorities.' },
  { label: 'Next meeting', message: 'What is my next meeting today?' },
  { label: 'Focus time', message: 'When do I have focus time today?' },
];

const TIER_MAP: Record<string, string> = {
  free: 'free',
  pro: 'professional',
  professional: 'professional',
  power: 'power',
  enterprise: 'enterprise',
};

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((e: { results: Array<Array<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function useSpeech() {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    );
  }, []);

  const listen = useCallback(
    (onResult: (text: string) => void) => {
      if (!supported || typeof window === 'undefined') return;
      const w = window as Window & {
        SpeechRecognition?: new () => SpeechRec;
        webkitSpeechRecognition?: new () => SpeechRec;
      };
      const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
      if (!SR) return;

      const rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      setListening(true);
      rec.onresult = (e) => {
        const text = e.results[0]?.[0]?.transcript ?? '';
        if (text) onResult(text);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      rec.start();
    },
    [supported],
  );

  return { listen, listening, supported };
}

export default function DigitalTwinPage() {
  const { isAuthenticated, isLoading } = useAuthSession();
  const { user } = useApp();
  const tier = TIER_MAP[user?.plan ?? 'free'] ?? 'free';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [memoryEntries, setMemoryEntries] = useState<TwinMemoryEntry[]>([]);
  const [limits, setLimits] = useState<TwinLimits | null>(null);
  const [messagesRemaining, setMessagesRemaining] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { listen, listening, supported: speechSupported } = useSpeech();

  const refreshSidebar = useCallback(async () => {
    try {
      const [calRes, memRes] = await Promise.all([
        fetch('/api/v1/twin/calendar/events', { credentials: 'include' }),
        fetch('/api/v1/twin/memory', { credentials: 'include' }),
      ]);
      if (calRes.ok) {
        const cal = (await calRes.json()) as { events: CalendarEvent[] };
        setEvents(cal.events);
      } else if (calRes.status === 404 || calRes.status === 405) {
        setEvents(DEMO_EVENTS);
      }
      if (memRes.ok) {
        const mem = (await memRes.json()) as {
          entries: TwinMemoryEntry[];
          limits: TwinLimits;
          usage: { messagesThisMonth: number };
        };
        setMemoryEntries(mem.entries);
        setLimits(mem.limits);
        if (mem.limits.monthlyMessages !== null) {
          setMessagesRemaining(mem.limits.monthlyMessages - mem.usage.messagesThisMonth);
        }
      }
    } catch {
      setEvents(DEMO_EVENTS);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) refreshSidebar();
  }, [isAuthenticated, refreshSidebar]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, streamingText]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const priorTurns = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
      setMessages((m) => [...m, { role: 'user', content: trimmed }]);
      setInput('');
      setLoading(true);
      let accumulated = '';

      try {
        const { reply, demo, messagesRemaining: remaining } = await twinChatApi(
          trimmed,
          priorTurns,
          (chunk) => {
            accumulated = chunk;
            setStreamingText(chunk);
          },
        );
        if (demo) setDemoMode(true);
        setMessages((m) => [...m, { role: 'assistant', content: reply || accumulated }]);
        if (remaining !== undefined) setMessagesRemaining(remaining);
        setStreamingText('');
      } catch {
        setDemoMode(true);
        setStreamingText('');
      } finally {
        setLoading(false);
      }
    },
    [loading, messages],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  if (isLoading) {
    return (
      <WorkspaceLayoutClient title="Digital Twin" subtitle="Loading…" showSearch={false}>
        <p className={styles.hint}>Loading session…</p>
      </WorkspaceLayoutClient>
    );
  }

  if (!isAuthenticated) {
    return (
      <WorkspaceLayoutClient
        title="Digital Twin"
        subtitle="Your personal AI assistant"
        showSearch={false}
      >
        <div className={styles.gateWrap}>
          <SignInCard returnUrl="/workspace/twin" variant="gate" />
        </div>
        <p className={styles.hint}>
          Already have an account?{' '}
          <Link href="/login?returnUrl=%2Fworkspace%2Ftwin">Sign in</Link>
        </p>
      </WorkspaceLayoutClient>
    );
  }

  const showEmpty = messages.length === 0 && !loading && !streamingText;
  const displayEvents = events.length > 0 ? events : demoMode ? DEMO_EVENTS : [];

  return (
    <WorkspaceLayoutClient
      title="Digital Twin"
      subtitle="Your personal AI assistant"
      showSearch={false}
    >
      <div className={styles.pageWrap}>
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={() => setSidebarOpen((o) => !o)}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
        </button>

        <div className={`${styles.twinLayout} ${sidebarOpen ? '' : styles.twinLayoutNoSidebar}`}>
          {sidebarOpen && (
            <aside className={styles.sidebar}>
              <section className={styles.panel}>
                <h3 className={styles.panelTitle}>Today&apos;s schedule</h3>
                {displayEvents.length === 0 ? (
                  <p className={styles.muted}>No events loaded.</p>
                ) : (
                  <ul className={styles.eventList}>
                    {displayEvents.map((e) => (
                      <li key={e.id} className={styles.eventItem}>
                        <div className={styles.eventTime}>
                          {e.start}–{e.end}
                        </div>
                        <div>{e.title}</div>
                        {e.location && <div className={styles.muted}>{e.location}</div>}
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className={styles.panel}>
                <h3 className={styles.panelTitle}>Memory</h3>
                {(Object.keys(MEMORY_LABELS) as TwinMemoryCategory[]).map((cat) => {
                  const count = memoryEntries.filter((e) => e.category === cat).length;
                  return (
                    <div key={cat} className={styles.memoryRow}>
                      <span>{MEMORY_LABELS[cat]}</span>
                      <span className={styles.muted}>{count > 0 ? count : '—'}</span>
                    </div>
                  );
                })}
              </section>

              <section className={styles.panel}>
                <h3 className={styles.panelTitle}>Quick actions</h3>
                <div className={styles.sidebarActions}>
                  {QUICK_ACTIONS.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      className={styles.sidebarActionBtn}
                      onClick={() => void send(a.message)}
                      disabled={loading}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          )}

          <main className={styles.shell}>
            <header className={styles.header}>
              <div>
                <h2 className={styles.headerTitle}>Digital Twin</h2>
                <p className={styles.headerSubtitle}>Your personal AI assistant</p>
              </div>
              <div className={styles.headerMeta}>
                {messagesRemaining !== null && (
                  <span className={styles.badge}>{messagesRemaining} msgs left</span>
                )}
                <span className={styles.badge}>{tier} plan</span>
                <Link href="/workspace/membership" className={styles.upgradeLink}>
                  Upgrade
                </Link>
              </div>
            </header>

            {demoMode && (
              <div className={styles.demoBanner} role="status">
                Offline fallback — live twin API unreachable. Check Laravel proxy and OPENAI_API_KEY on the server.
              </div>
            )}

            <div className={styles.messages}>
              {showEmpty ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon} aria-hidden>
                    ◎
                  </span>
                  <h3 className={styles.emptyTitle}>Chat with your Digital Twin</h3>
                  <p className={styles.emptySubtitle}>
                    I help you plan your day, remember what you consent to share, and stay on top of your
                    schedule. Ask anything — or try a quick action below.
                  </p>
                  <div className={styles.suggestions}>
                    {QUICK_ACTIONS.map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        className={styles.suggestionBtn}
                        onClick={() => void send(a.message)}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`${styles.bubble} ${m.role === 'user' ? styles.userBubble : styles.assistantBubble}`}
                    >
                      {m.content}
                    </div>
                  ))}
                  {streamingText && (
                    <div className={`${styles.bubble} ${styles.assistantBubble}`}>{streamingText}</div>
                  )}
                  {loading && !streamingText && (
                    <div className={`${styles.bubble} ${styles.assistantBubble}`}>Thinking…</div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <form className={styles.inputRow} onSubmit={handleSubmit}>
                {speechSupported && (
                  <button
                    type="button"
                    className={`${styles.iconBtn} ${listening ? styles.iconBtnActive : ''}`}
                    onClick={() => listen((text) => void send(text))}
                    disabled={loading}
                    aria-label="Voice input"
                    title="Voice input"
                  >
                    <ModuleIcon name="mic" size={18} />
                  </button>
                )}
                <textarea
                  className={styles.textInput}
                  placeholder="Message your Digital Twin…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={loading}
                  aria-label="Chat message"
                />
                <button type="submit" className={styles.sendBtn} disabled={loading || !input.trim()}>
                  {loading ? '…' : 'Send'}
                </button>
              </form>
              <p className={styles.hint}>Enter to send · Shift+Enter for new line</p>
            </div>
          </main>
        </div>
      </div>
    </WorkspaceLayoutClient>
  );
}
