'use client';

import { DEMO_TENANT_ID, defaultContentAIPlatform } from '@ai-pass/content-ai';
import { ContentAIShell, ScoreBadge } from '../components/ContentAIShell';
import styles from '../content-ai.module.css';

const history = defaultContentAIPlatform.history.list(DEMO_TENANT_ID);

export default function HistoryPage() {
  return (
    <ContentAIShell>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Scan & rewrite history</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Preview</th>
              <th>Score / Tone</th>
              <th>Trust</th>
              <th>Credits</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.type}</td>
                <td>{entry.preview}</td>
                <td>
                  {entry.type === 'detect' && entry.aiScore !== undefined ? (
                    <ScoreBadge
                      label={entry.aiScore >= 70 ? 'ai' : entry.aiScore <= 30 ? 'human' : 'mixed'}
                      score={entry.aiScore}
                    />
                  ) : (
                    entry.tone ?? '—'
                  )}
                </td>
                <td>{entry.trustScore}</td>
                <td>{entry.creditsUsed}</td>
                <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </ContentAIShell>
  );
}
