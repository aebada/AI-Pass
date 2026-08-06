'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../agents.module.css';

export default function AgentPublishPage() {
  const [agents, setAgents] = useState<Array<{ id: string; name: string; status: string; publishedVersion?: number }>>([]);
  const [listings, setListings] = useState<Array<{ listingId: string; agentId: string; revenue: number; usageCount: number }>>([]);
  const [publishing, setPublishing] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/agents').then((r) => r.json()).then((d) => setAgents(d.agents ?? []));
    fetch('/api/v1/agents/analytics').then((r) => r.json()).then((d) => setListings(d.listings ?? []));
  }, []);

  const publish = async (agentId: string) => {
    setPublishing(agentId);
    await fetch(`/api/v1/agents/${agentId}/publish`, { method: 'POST', body: '{}' });
    const analytics = await fetch('/api/v1/agents/analytics').then((r) => r.json());
    setListings(analytics.listings ?? []);
    setPublishing(null);
  };

  return (
    <>
      <p className={styles.meta}>Publish agents to the marketplace. Track usage and revenue.</p>

      <h3 className={styles.sectionTitle}>Publish Agent</h3>
      <div className={styles.grid}>
        {agents.filter((a) => a.status !== 'archived').map((a) => (
          <div key={a.id} className={styles.card}>
            <h3>{a.name}</h3>
            <p className={styles.meta}>
              {a.status}
              {a.publishedVersion != null && ` · v${a.publishedVersion} published`}
            </p>
            <button
              type="button"
              className={styles.btnPrimary}
              disabled={publishing === a.id}
              onClick={() => publish(a.id)}
            >
              {publishing === a.id ? 'Publishing…' : 'Publish to Marketplace'}
            </button>
          </div>
        ))}
      </div>

      <h3 className={styles.sectionTitle}>Listings</h3>
      {listings.length === 0 ? (
        <p className={styles.meta}>No published listings yet.</p>
      ) : (
        listings.map((l) => (
          <div key={l.listingId} className={styles.card} style={{ marginBottom: 12 }}>
            <strong>{l.listingId}</strong>
            <p className={styles.meta}>{l.usageCount} runs · ${l.revenue.toFixed(2)} revenue</p>
            <Link href="/workspace/marketplace" className={styles.btn}>View in Marketplace</Link>
          </div>
        ))
      )}
    </>
  );
}
