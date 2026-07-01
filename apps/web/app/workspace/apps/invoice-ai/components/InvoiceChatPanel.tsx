'use client';

import { useCallback, useState } from 'react';
import { defaultInvoiceAIService, DEMO_TENANT_ID } from '@ai-pass/invoice-ai';
import { useApp } from '../../../../components/premium/AppProviders';
import styles from '../invoice-ai.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'What is our total spend?',
  'Show pending approvals',
  'Any open fraud alerts?',
  'List top vendors',
];

export function InvoiceChatPanel() {
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Ask me about invoices, spend, approvals, fraud alerts, or vendors.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (query: string) => {
      if (!query.trim()) return;
      setMessages((m) => [...m, { role: 'user', content: query }]);
      setInput('');
      setLoading(true);

      try {
        const res = await fetch('/api/v1/invoice-ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id ?? 'demo-user',
            'x-tenant-id': DEMO_TENANT_ID,
          },
          body: JSON.stringify({ query, tenantId: DEMO_TENANT_ID }),
        });

        if (res.ok) {
          const data = (await res.json()) as { answer: string };
          setMessages((m) => [...m, { role: 'assistant', content: data.answer }]);
        } else {
          const result = defaultInvoiceAIService.chat({
            tenantId: DEMO_TENANT_ID,
            userId: user?.id ?? 'demo-user',
            query,
          });
          setMessages((m) => [...m, { role: 'assistant', content: result.answer }]);
        }
      } catch {
        const result = defaultInvoiceAIService.chat({
          tenantId: DEMO_TENANT_ID,
          userId: user?.id ?? 'demo-user',
          query,
        });
        setMessages((m) => [...m, { role: 'assistant', content: result.answer }]);
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  return (
    <aside className={styles.chatPanel}>
      <div className={styles.chatHeader}>Semantic queries</div>
      <div className={styles.chatMessages}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.chatBubble} ${m.role === 'user' ? styles.chatUser : styles.chatAssistant}`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className={`${styles.chatBubble} ${styles.chatAssistant}`}>Thinking…</div>
        )}
      </div>
      <div style={{ padding: '0 12px 8px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className={`${styles.btn} ${styles.btnSecondary}`}
            style={{ fontSize: 11, padding: '4px 8px' }}
            onClick={() => send(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <form
        className={styles.chatInput}
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about invoices…"
          disabled={loading}
        />
        <button type="submit" className={styles.btn} disabled={loading}>
          Send
        </button>
      </form>
    </aside>
  );
}
