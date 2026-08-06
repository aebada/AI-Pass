'use client';

import Link from 'next/link';
import { ContentAIShell } from '../components/ContentAIShell';
import styles from '../content-ai.module.css';

const ENDPOINTS = [
  { method: 'POST', path: '/api/v1/content-ai/detect', desc: 'Analyze text for AI probability' },
  { method: 'POST', path: '/api/v1/content-ai/humanize', desc: 'Rewrite text with tone and model options' },
  { method: 'GET', path: '/api/v1/content-ai/history', desc: 'List past detections and humanizations' },
  { method: 'GET', path: '/api/v1/content-ai/usage', desc: 'Monthly usage and limits' },
];

export default function ApiPage() {
  return (
    <ContentAIShell>
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Enterprise API</h2>
        <p style={{ fontSize: 14, color: 'var(--ai-text-muted)', marginBottom: 16 }}>
          API access is available on the Enterprise plan. Use your API key in the <code>Authorization</code> header.
        </p>
        <div className={styles.card} style={{ marginBottom: 16, background: 'var(--ai-bg)' }}>
          <p className={styles.cardTitle}>API Key (demo stub)</p>
          <code style={{ fontSize: 13 }}>aip_content_demo_••••••••••••4f2a</code>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Method</th>
              <th>Endpoint</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {ENDPOINTS.map((ep) => (
              <tr key={ep.path}>
                <td><span className={styles.badge}>{ep.method}</span></td>
                <td><code>{ep.path}</code></td>
                <td>{ep.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 13, marginTop: 16 }}>
          <Link href="/api/docs" style={{ color: 'var(--ai-accent)' }}>OpenAPI reference →</Link>
        </p>
      </section>
    </ContentAIShell>
  );
}
