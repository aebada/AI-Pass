'use client';

import type { InvoiceDetailResponse } from '@ai-pass/invoice-ai';
import {
  computeLifecycleStages,
  type LifecycleStageState,
} from './invoice-lifecycle-utils';
import styles from '../invoice-ai.module.css';

function formatTimestamp(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

function stageClass(state: LifecycleStageState): string {
  switch (state) {
    case 'completed':
      return styles.lifecycleStageCompleted;
    case 'current':
      return styles.lifecycleStageCurrent;
    case 'failed':
      return styles.lifecycleStageFailed;
    default:
      return styles.lifecycleStagePending;
  }
}

export function InvoiceLifecyclePanel({ detail }: { detail: InvoiceDetailResponse }) {
  const stages = computeLifecycleStages(detail);

  return (
    <section className={styles.lifecyclePanel} aria-label="Invoice lifecycle">
      <div className={styles.lifecycleHeader}>
        <h3 className={styles.cardTitle}>Lifecycle</h3>
        <span className={styles.lifecycleHint}>End-to-end processing pipeline</span>
      </div>

      <div className={styles.lifecycleTrack}>
        {stages.map((stage, index) => (
          <div key={stage.id} className={styles.lifecycleSegment}>
            <div className={`${styles.lifecycleNode} ${stageClass(stage.state)}`}>
              <span className={styles.lifecycleNodeDot} aria-hidden />
              <span className={styles.lifecycleNodeLabel}>{stage.label}</span>
              {stage.timestamp && (
                <time className={styles.lifecycleNodeTime} dateTime={stage.timestamp}>
                  {formatTimestamp(stage.timestamp)}
                </time>
              )}
            </div>
            {index < stages.length - 1 ? (
              <span
                className={`${styles.lifecycleConnector} ${
                  stage.state === 'completed' ? styles.lifecycleConnectorDone : ''
                }`}
                aria-hidden
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

/** Compact dot progress for portfolio cards */
export function InvoiceLifecycleMini({ detail }: { detail: InvoiceDetailResponse }) {
  const stages = computeLifecycleStages(detail);
  const simplified = [
    stages[0],
    stages[2],
    stages[4],
    stages[5],
    stages[6],
    stages[9],
  ];

  return (
    <div className={styles.lifecycleMini} aria-label="Processing progress">
      {simplified.map((stage) => (
        <span
          key={stage.id}
          className={`${styles.lifecycleMiniDot} ${stageClass(stage.state)}`}
          title={stage.label}
        />
      ))}
    </div>
  );
}

/** Mini indicator from invoice status only (when full detail unavailable) */
export function InvoiceLifecycleMiniFromStatus({
  status,
}: {
  status: string;
}) {
  const idx =
    status === 'draft'
      ? 0
      : status === 'processing'
        ? 1
        : status === 'validated'
          ? 2
          : status === 'flagged'
            ? 3
            : status === 'pending_approval'
              ? 4
              : status === 'rejected'
                ? 5
                : status === 'approved'
                  ? 5
                  : status === 'paid'
                    ? 6
                    : 2;

  const labels = ['Uploaded', 'Validate', 'Compliance', 'Review', 'Decision', 'Paid'];

  return (
    <div className={styles.lifecycleMini} aria-label="Processing progress">
      {labels.map((label, i) => (
        <span
          key={label}
          className={`${styles.lifecycleMiniDot} ${
            i < idx
              ? styles.lifecycleStageCompleted
              : i === idx
                ? styles.lifecycleStageCurrent
                : styles.lifecycleStagePending
          } ${status === 'rejected' && i === 4 ? styles.lifecycleStageFailed : ''}`}
          title={label}
        />
      ))}
    </div>
  );
}
