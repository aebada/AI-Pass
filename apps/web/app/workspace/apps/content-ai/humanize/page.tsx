'use client';

import { useState } from 'react';
import {
  DEMO_SAMPLE_TEXTS,
  DEMO_TENANT_ID,
  HUMANIZE_MODELS,
  type HumanizeResult,
} from '@ai-pass/content-ai';
import { ContentAIShell } from '../components/ContentAIShell';
import styles from '../content-ai.module.css';

export default function HumanizePage() {
  const [text, setText] = useState<string>(DEMO_SAMPLE_TEXTS.ai);
  const [tone, setTone] = useState<'professional' | 'casual' | 'academic'>('professional');
  const [modelId, setModelId] = useState<string>(HUMANIZE_MODELS[0].id);
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runHumanize() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/content-ai/humanize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': DEMO_TENANT_ID,
          'x-membership-tier': 'professional',
        },
        body: JSON.stringify({ text, tone, modelId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Humanization failed');
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Humanization failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ContentAIShell>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Original text</h2>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste AI-generated text to humanize…"
        />
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: 13 }}>
            Tone{' '}
            <select className={styles.select} value={tone} onChange={(e) => setTone(e.target.value as typeof tone)}>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="academic">Academic</option>
            </select>
          </label>
          <label style={{ fontSize: 13 }}>
            Model{' '}
            <select className={styles.select} value={modelId} onChange={(e) => setModelId(e.target.value)}>
              {HUMANIZE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.button} onClick={runHumanize} disabled={loading || !text.trim()}>
            {loading ? 'Humanizing…' : 'Humanize'}
          </button>
        </div>
        {error && <p style={{ color: '#f85149', fontSize: 13, marginTop: 12 }}>{error}</p>}
      </section>

      {result && (
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Before / After</h2>
          <div className={styles.compareCol}>
            <div>
              <p className={styles.cardTitle}>Before</p>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{result.originalText}</p>
            </div>
            <div>
              <p className={styles.cardTitle}>After ({result.tone})</p>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>{result.humanizedText}</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--ai-text-muted)', marginTop: 16 }}>
            Model: {result.modelId} · Trust: {result.trustScore} · Credits: {result.creditsUsed}
          </p>
        </section>
      )}
    </ContentAIShell>
  );
}
