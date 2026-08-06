'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SignInCard } from '@/app/components/auth/SignInCard';
import { useApp } from '@/app/components/premium/AppProviders';
import { useAuthSession } from '@/lib/use-auth-session';
import { type TwinMessage, twinChatApi } from '@/lib/twin-chat-client';
import styles from './twin-widget.module.css';
import { ModuleIcon } from '@ai-pass/ui';

type Message = TwinMessage;

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((e: { results: Array<Array<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

const TIER_LABEL: Record<string, string> = {
  free: 'Free',
  pro: 'Professional',
  professional: 'Professional',
  power: 'Power',
  enterprise: 'Enterprise',
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
        const transcript = e.results[0]?.[0]?.transcript ?? '';
        if (transcript) onResult(transcript);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      rec.start();
    },
    [supported],
  );

  return { listen, listening, supported };
}

function TwinIcon() {
  return (
    <svg className={styles.fabIcon} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <circle cx="17" cy="7" r="2" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

export function DigitalTwinWidget() {
  const { isAuthenticated, isLoading } = useAuthSession();
  const { user } = useApp();
  const tierLabel = TIER_LABEL[user?.plan ?? 'free'] ?? 'Free';

  const [open, setOpen] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi — I'm your Digital Twin. Ask about your schedule or open the full workspace for calendar and memory controls.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { listen, listening, supported: speechSupported } = useSpeech();

  const scrollToEnd = useCallback(() => {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      const priorTurns = messages.filter((m) => m.role === 'user' || m.role === 'assistant');
      setMessages((m) => [...m, { role: 'user', content: text }]);
      setInput('');
      setLoading(true);

      try {
        const { reply, demo } = await twinChatApi(text, priorTurns);
        if (demo) setDemoMode(true);
        setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      } catch {
        setDemoMode(true);
      } finally {
        setLoading(false);
        scrollToEnd();
      }
    },
    [loading, scrollToEnd, messages],
  );

  useEffect(() => {
    if (open) scrollToEnd();
  }, [open, messages.length, scrollToEnd]);

  return (
    <div className={styles.root} aria-live="polite">
      <div
        className={`${styles.panel} ${open ? styles.panelOpen : ''}`}
        role="dialog"
        aria-label="Digital Twin chat"
        aria-hidden={!open}
      >
        <header className={styles.header}>
          <h2 className={styles.headerTitle}>
            <TwinIcon />
            Digital Twin
          </h2>
          <div className={styles.headerActions}>
            <Link href="/workspace/twin" className={styles.fullLink}>
              Full workspace
            </Link>
            <button
              type="button"
              className={styles.iconAction}
              onClick={() => setOpen(false)}
              aria-label="Minimize"
              title="Minimize"
            >
              −
            </button>
          </div>
        </header>

        {demoMode && (
          <div className={styles.demoBanner}>
            Offline fallback — live twin API unreachable. Sign in and set OPENAI_API_KEY in laravel-auth/.env.
          </div>
        )}

        {isLoading ? (
          <div className={styles.loading}>Loading session…</div>
        ) : !isAuthenticated ? (
          <div className={styles.signInWrap}>
            <SignInCard variant="gate" usePopup />
          </div>
        ) : (
          <>
            {tierLabel !== 'Free' && (
              <div className={styles.demoBanner} style={{ borderBottom: 'none' }}>
                Plan: {tierLabel}
              </div>
            )}
            <div className={styles.messages}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`${styles.bubble} ${m.role === 'user' ? styles.userBubble : styles.assistantBubble}`}
                >
                  {m.content}
                </div>
              ))}
              {loading && <div className={`${styles.bubble} ${styles.assistantBubble}`}>Thinking…</div>}
              <div ref={endRef} />
            </div>
            <form
              className={styles.inputRow}
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              {speechSupported && (
                <button
                  type="button"
                  className={`${styles.micBtn} ${listening ? styles.micBtnActive : ''}`}
                  onClick={() => listen((text) => send(text))}
                  disabled={loading}
                  title="Voice input"
                  aria-label="Voice input"
                >
                  <ModuleIcon name="mic" size={18} />
                </button>
              )}
              <textarea
                className={styles.textInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your twin…"
                rows={1}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <button type="submit" className={styles.sendBtn} disabled={loading || !input.trim()}>
                Send
              </button>
            </form>
          </>
        )}
      </div>

      <button
        type="button"
        className={`${styles.fab} ${open ? styles.fabOpen : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Minimize Digital Twin' : 'Open Digital Twin'}
        aria-expanded={open}
        title="Digital Twin"
      >
        <TwinIcon />
      </button>
    </div>
  );
}
