'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../../supply-chain-shell.module.css';

export default function CreateEventPage() {
  const router = useRouter();
  const [nlMode, setNlMode] = useState(false);
  const [preview, setPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const requirementsNL = nlMode ? String(form.get('requirementsNL') ?? '') : undefined;

    if (requirementsNL) {
      const lines = requirementsNL.split('\n').map((l) => l.trim()).filter(Boolean);
      setPreview(lines);
    }

    await fetch('/api/v1/supply-chain-ai/sourcing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'),
        category: form.get('category'),
        department: form.get('department'),
        deadline: form.get('deadline'),
        currency: form.get('currency'),
        budgetCap: Number(form.get('budgetCap')) || undefined,
        requirementsNL,
      }),
    });

    setLoading(false);
    router.push('/workspace/apps/supply-chain-ai/events');
  }

  return (
    <div>
      <header className={styles.header}>
        <h1>Create Sourcing Event</h1>
        <p className={styles.muted}>Structured requirements or natural language with AI parse preview</p>
      </header>

      <form onSubmit={handleSubmit} className={styles.card} style={{ maxWidth: 640 }}>
        <div className={styles.formGroup}>
          <label>Event Title</label>
          <input name="title" required placeholder="IT Hardware Refresh Q4" />
        </div>
        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label>Category</label>
            <input name="category" required placeholder="IT Equipment" />
          </div>
          <div className={styles.formGroup}>
            <label>Department</label>
            <input name="department" required placeholder="Information Technology" />
          </div>
        </div>
        <div className={styles.grid2}>
          <div className={styles.formGroup}>
            <label>Deadline</label>
            <input name="deadline" type="date" required />
          </div>
          <div className={styles.formGroup}>
            <label>Budget Cap (EUR)</label>
            <input name="budgetCap" type="number" placeholder="180000" />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label>Currency</label>
          <select name="currency" defaultValue="EUR">
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13 }}>
          <input type="checkbox" checked={nlMode} onChange={(e) => setNlMode(e.target.checked)} />
          Natural language requirements (AI parse preview)
        </label>

        {nlMode && (
          <div className={styles.formGroup}>
            <label>Requirements (one per line)</label>
            <textarea
              name="requirementsNL"
              rows={5}
              placeholder="- ISO 9001 certification required&#10;- Delivery within 45 days&#10;- * Must include 3-year warranty"
              onChange={(e) => {
                const lines = e.target.value.split('\n').map((l) => l.trim()).filter(Boolean);
                setPreview(lines);
              }}
            />
            {preview.length > 0 && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--bg)', borderRadius: 8 }}>
                <div className={styles.kpiLabel}>AI Parse Preview</div>
                <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 13 }}>
                  {preview.map((line, i) => (
                    <li key={i}>{line.replace(/^[-*•]\s*/, '')}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? 'Creating…' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}
