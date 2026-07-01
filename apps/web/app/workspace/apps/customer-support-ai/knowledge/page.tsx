'use client';

import { useState } from 'react';
import { KnowledgeService } from '@ai-pass/customer-support-ai';
import { SupportAppShell } from '../SupportAppShell';
import styles from '../support.module.css';

const knowledge = new KnowledgeService();

export default function KnowledgeSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReturnType<KnowledgeService['retrieve']>>([]);

  function search() {
    setResults(knowledge.retrieve(query));
  }

  return (
    <SupportAppShell title="Knowledge Search" subtitle="FAQ, policies, orders, and products via Knowledge Pipeline">
      <div className={styles.chatInput} style={{ border: 'none', padding: 0, marginBottom: 20 }}>
        <input
          className={styles.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Search knowledge base…"
        />
        <button type="button" className={styles.sendBtn} onClick={search}>Search</button>
      </div>

      {results.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>Try &quot;return policy&quot;, &quot;shipping&quot;, or &quot;ORD-1042&quot;</p>
      ) : (
        results.map((r) => (
          <div key={r.id} className={styles.card} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong>[{r.type}] {r.title}</strong>
              <span className={styles.badge}>{Math.round(r.score * 100)}% match</span>
            </div>
            <p style={{ fontSize: 13, margin: 0 }}>{r.excerpt}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Source: {r.sourceId}</p>
          </div>
        ))
      )}
    </SupportAppShell>
  );
}
