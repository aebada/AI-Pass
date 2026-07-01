'use client';

import { useState } from 'react';
import {
  DEMO_SAMPLE_TEXTS,
  DEMO_TENANT_ID,
  type DetectionResult,
} from '@ai-pass/content-ai';
import { ContentAIShell, ScoreBadge } from '../components/ContentAIShell';
import styles from '../content-ai.module.css';

export default function DetectPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScan() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/content-ai/detect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': DEMO_TENANT_ID,
          'x-membership-tier': 'professional',
        },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Detection failed');
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Detection failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ContentAIShell>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Paste or upload text</h2>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text to analyze for AI-generated content…"
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button type="button" className={styles.button} onClick={runScan} disabled={loading || !text.trim()}>
            {loading ? 'Scanning…' : 'Run AI scan'}
          </button>
          <button type="button" className={styles.select} onClick={() => setText(DEMO_SAMPLE_TEXTS.ai)}>
            Load AI sample
          </button>
          <button type="button" className={styles.select} onClick={() => setText(DEMO_SAMPLE_TEXTS.human)}>
            Load human sample
          </button>
          <button type="button" className={styles.select} onClick={() => setText(DEMO_SAMPLE_TEXTS.mixed)}>
            Load mixed sample
          </button>
        </div>
        {error && <p style={{ color: '#f85149', fontSize: 13, marginTop: 12 }}>{error}</p>}
      </section>

      {result && (
        <>
          <div className={styles.grid}>
            <div className={styles.card}>
              <p className={styles.cardTitle}>AI probability</p>
              <p className={styles.statValue}>{result.aiScore}%</p>
              <div className={styles.meter}>
                <div className={`${styles.meterFill} ${styles.meterAi}`} style={{ width: `${result.aiScore}%` }} />
              </div>
            </div>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Human probability</p>
              <p className={styles.statValue}>{result.humanScore}%</p>
              <div className={styles.meter}>
                <div className={`${styles.meterFill} ${styles.meterHuman}`} style={{ width: `${result.humanScore}%` }} />
              </div>
            </div>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Confidence</p>
              <p className={styles.statValue}>{Math.round(result.confidence * 100)}%</p>
            </div>
            <div className={styles.card}>
              <p className={styles.cardTitle}>Trust score</p>
              <p className={styles.statValue}>{result.trustScore}</p>
            </div>
          </div>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Sentence highlights</h2>
            {result.sentences.map((s) => (
              <div
                key={s.index}
                className={
                  s.label === 'ai' ? styles.highlightAi :
                  s.label === 'human' ? styles.highlightHuman : styles.highlightMixed
                }
              >
                <ScoreBadge label={s.label} score={s.aiProbability} />
                <p style={{ margin: '8px 0 0', fontSize: 14 }}>{s.text}</p>
              </div>
            ))}
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Model hints</h2>
            <p style={{ fontSize: 13, color: 'var(--ai-text-muted)' }}>
              {result.modelHints.join(' · ')}
            </p>
          </section>
        </>
      )}
    </ContentAIShell>
  );
}
