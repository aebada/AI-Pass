'use client';

import { useState } from 'react';
import styles from '../supply-chain-shell.module.css';

export default function ChatPage() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; sources?: string[] }>>([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!query.trim()) return;
    const userMsg = query;
    setQuery('');
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);

    const res = await fetch('/api/v1/supply-chain-ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: userMsg, language: userMsg.match(/[äöüß]/) ? 'de' : 'en' }),
    });
    const data = await res.json();
    setMessages((m) => [...m, {
      role: 'assistant',
      text: data.answer,
      sources: data.sources?.map((s: { label: string }) => s.label),
    }]);
    setLoading(false);
  }

  return (
    <div>
      <header className={styles.header}>
        <h1>Procurement Chat</h1>
        <p className={styles.muted}>Compare suppliers, explain scoring, policy violations - multilingual stub</p>
      </header>

      <div className={styles.card} style={{ maxWidth: 720, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
          {messages.length === 0 && (
            <p className={styles.muted}>Try: &quot;Compare suppliers&quot;, &quot;Why did Nordic score highest?&quot;, &quot;Welche Richtlinien gelten?&quot;</p>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 16, textAlign: m.role === 'user' ? 'right' : 'left' }}>
              <div style={{
                display: 'inline-block',
                padding: '10px 14px',
                borderRadius: 10,
                background: m.role === 'user' ? 'var(--accent-muted)' : 'var(--bg)',
                fontSize: 13,
                maxWidth: '85%',
                textAlign: 'left',
              }}>
                {m.text}
                {m.sources && m.sources.length > 0 && (
                  <div className={styles.muted} style={{ marginTop: 6, fontSize: 11 }}>
                    Sources: {m.sources.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about suppliers, scoring, policies…"
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          />
          <button type="button" className={styles.btnPrimary} onClick={send} disabled={loading}>
            {loading ? '…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
