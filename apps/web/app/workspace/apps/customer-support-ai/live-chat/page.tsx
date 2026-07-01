'use client';

import { useState } from 'react';
import { defaultCustomerSupportAIService, DEMO_TENANT_ID, isRtl } from '@ai-pass/customer-support-ai';
import type { Message } from '@ai-pass/customer-support-ai';
import { SupportAppShell } from '../SupportAppShell';
import styles from '../support.module.css';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ar', label: 'العربية' },
];

export default function LiveChatPage() {
  const [language, setLanguage] = useState('en');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function startChat() {
    const result = await defaultCustomerSupportAIService.startConversation({
      tenantId: DEMO_TENANT_ID,
      userId: 'demo-user',
      tier: 'professional',
      channel: 'web',
      language,
    });
    setConversationId(result.conversation.id);
    setMessages([result.welcomeMessage]);
  }

  async function sendMessage() {
    if (!conversationId || !input.trim()) return;
    setLoading(true);
    try {
      const result = await defaultCustomerSupportAIService.sendMessage({
        conversationId,
        tenantId: DEMO_TENANT_ID,
        userId: 'demo-user',
        tier: 'professional',
        content: input,
        language,
      });
      setMessages((prev) => [...prev, result.message, result.response]);
      setInput('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SupportAppShell title="Live Chat" subtitle="Multilingual chat with knowledge citations">
      <div className={styles.actions}>
        <select
          className={styles.input}
          style={{ width: 160 }}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        {!conversationId && (
          <button type="button" className={styles.sendBtn} onClick={startChat}>
            Start Conversation
          </button>
        )}
      </div>

      <div className={styles.chatLayout}>
        <div className={styles.chatPanel}>
          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 40 }}>
                Start a conversation to begin multilingual support chat.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.message} ${m.role === 'customer' ? styles.messageUser : styles.messageAi} ${isRtl(m.language) ? styles.rtl : ''}`}
              >
                {m.content}
                {m.citations && m.citations.length > 0 && (
                  <div className={styles.citations}>
                    Sources:
                    {m.citations.map((c) => (
                      <span key={c.id} className={styles.citation}>
                        [{c.type}] {c.title} — {c.excerpt.slice(0, 60)}…
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {conversationId && (
            <div className={styles.chatInput}>
              <input
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message…"
                dir={isRtl(language) ? 'rtl' : 'ltr'}
              />
              <button type="button" className={styles.sendBtn} onClick={sendMessage} disabled={loading}>
                Send
              </button>
            </div>
          )}
        </div>
        <aside className={styles.sidePanel}>
          <h3 className={styles.cardTitle}>Session Info</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Conversation: {conversationId ?? 'Not started'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            Language: {language.toUpperCase()}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            Citations powered by Knowledge Pipeline (stub).
          </p>
        </aside>
      </div>
    </SupportAppShell>
  );
}
