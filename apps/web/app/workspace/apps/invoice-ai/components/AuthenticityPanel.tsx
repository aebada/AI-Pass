'use client';

import type { FakeInvoiceDetection, FakeInvoiceVerdict } from '@ai-pass/invoice-ai';
import styles from '../invoice-ai.module.css';

function verdictColor(verdict: FakeInvoiceVerdict): string {
  switch (verdict) {
    case 'Authentic':
      return '#3fb950';
    case 'Suspicious':
      return '#d29922';
    case 'Likely Fake':
      return '#f85149';
  }
}

function riskBarColor(score: number): string {
  if (score < 40) return '#3fb950';
  if (score <= 70) return '#d29922';
  return '#f85149';
}

export function AuthenticityScoreBar({
  score,
  compact = false,
}: {
  score: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? styles.authenticityBarCompact : styles.authenticityBar}>
      <div className={styles.authenticityBarTrack}>
        <div
          className={styles.authenticityBarFill}
          style={{ width: `${Math.min(100, Math.max(0, score))}%`, background: riskBarColor(score) }}
        />
      </div>
      <span className={styles.authenticityBarLabel}>{score}% risk</span>
    </div>
  );
}

export function AuthenticityPanel({
  detection,
  onRescan,
  rescanning = false,
  showRescan = false,
  title = 'Document authenticity',
}: {
  detection: FakeInvoiceDetection;
  onRescan?: () => void;
  rescanning?: boolean;
  showRescan?: boolean;
  title?: string;
}) {
  const borderColor =
    detection.verdict === 'Likely Fake'
      ? 'rgba(248,81,73,0.45)'
      : detection.verdict === 'Suspicious'
        ? 'rgba(210,153,34,0.4)'
        : 'rgba(63,185,80,0.35)';

  return (
    <section className={styles.card} style={{ marginBottom: 16, borderColor }}>
      <div className={styles.authenticityHeader}>
        <h3 className={styles.cardTitle}>{title}</h3>
        {showRescan && onRescan ? (
          <button
            type="button"
            className={styles.linkBtn}
            onClick={onRescan}
            disabled={rescanning}
          >
            {rescanning ? 'Scanning…' : 'Rescan document'}
          </button>
        ) : null}
      </div>

      <div className={styles.authenticityVerdictRow}>
        <span
          className={styles.authenticityVerdict}
          style={{ color: verdictColor(detection.verdict) }}
        >
          {detection.verdict}
        </span>
        <span className={styles.authenticityScoreText}>
          {(detection.authenticityScore)}% authenticity risk
        </span>
      </div>

      <AuthenticityScoreBar score={detection.authenticityScore} />

      {detection.signals.length > 0 ? (
        <ul className={styles.authenticitySignals}>
          {detection.signals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      ) : (
        <p className={styles.authenticityNoSignals}>No tamper signals detected.</p>
      )}
    </section>
  );
}

export function AuthenticityInline({
  detection,
}: {
  detection: FakeInvoiceDetection;
}) {
  return (
    <div className={styles.authenticityInline}>
      <div className={styles.authenticityInlineHeader}>
        <span
          className={styles.authenticityVerdictBadge}
          style={{
            background: `${verdictColor(detection.verdict)}22`,
            color: verdictColor(detection.verdict),
          }}
        >
          {detection.verdict}
        </span>
      </div>
      <AuthenticityScoreBar score={detection.authenticityScore} compact />
      {detection.signals.length > 0 ? (
        <ul className={styles.authenticitySignalsCompact}>
          {detection.signals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
