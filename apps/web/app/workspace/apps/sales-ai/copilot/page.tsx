'use client';

import { useState } from 'react';
import { SalesAppShell } from '../SalesAppShell';
import styles from '../sales-ai.module.css';

interface Message { role: 'user' | 'ai'; content: string }

export default function SalesCopilotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'I\'m your Sales Copilot. Ask about objections, deal insights, meeting prep, or next-best actions.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  async function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch('/api/sales/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, leadId: 'lead_001' }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'ai', content: data.reply }]);
      if (data.suggestions) setSuggestions(data.suggestions);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SalesAppShell title="Sales Copilot" subtitle="Objections, next-best action, deal insights, and follow-ups">
      <div className={styles.chatLayout}>
        <div className={styles.chatPanel}>
          <div className={styles.chatMessages}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.message} ${m.role === 'user' ? styles.messageUser : styles.messageAi}`}>
                {m.content}
              </div>
            ))}
          </div>
          <div className={styles.chatInput}>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask about objections, deals, or follow-ups…"
            />
            <button className={styles.sendBtn} onClick={send} disabled={loading}>Send</button>
          </div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Suggestions</h3>
          <ul style={{ fontSize: 13, paddingLeft: 16 }}>
            {suggestions.map((s) => <li key={s} style={{ marginBottom: 8 }}>{s}</li>)}
          </ul>
        </div>
      </div>
    </SalesAppShell>
  );
}
