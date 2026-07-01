'use client';

import { useState } from 'react';
import styles from '../compliance-ai.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ComplianceCopilotPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Ask about ISO readiness, gaps, remediation, policies, or audit prep. Responses are grounded on your org data.' },
  ]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>();
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: userMessage }]);
    setLoading(true);
    try {
      const res = await fetch('/api/v1/compliance-ai/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-membership-tier': 'power',
        },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });
      const data = await res.json();
      if (data.message) {
        setSessionId(data.sessionId);
        setMessages((m) => [...m, { role: 'assistant', content: data.message.content }]);
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.error ?? 'Request failed' }]);
      }
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network error' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.chatPanel}>
      <div className={styles.chatHeader}>AI Compliance Copilot</div>
      <div className={styles.chatMessages}>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`${styles.chatBubble} ${m.role === 'user' ? styles.chatUser : styles.chatAssistant}`}
          >
            {m.content}
          </div>
        ))}
      </div>
      <div className={styles.chatInput}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Explain ISO 42001 control 6.1.2..."
          disabled={loading}
        />
        <button type="button" className={styles.btnPrimary} onClick={send} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
