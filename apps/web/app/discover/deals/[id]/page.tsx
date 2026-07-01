'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import styles from '../../discover.module.css';

export default function DealDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [deal, setDeal] = useState<{
    id: string;
    title: string;
    description: string;
    dealPrice?: number;
    originalPrice?: number;
    savingsPercent: number;
    countdownEndsAt: string;
    code?: string;
    toolIds: string[];
  } | null>(null);
  const [tools, setTools] = useState<Array<{ id: string; name: string; slug: string; storeRoute: string }>>([]);
  const [daysLeft, setDaysLeft] = useState(0);
  const [activated, setActivated] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/v1/discovery/deals?id=${id}`)
      .then((r) => r.json())
      .then((json) => {
        setDeal(json.data?.deal ?? null);
        setTools(json.data?.tools ?? []);
        if (json.data?.deal?.countdownEndsAt) {
          const ends = new Date(json.data.deal.countdownEndsAt);
          setDaysLeft(Math.max(0, Math.ceil((ends.getTime() - Date.now()) / 86400000)));
        }
      });
  }, [id]);

  async function activate() {
    const res = await fetch('/api/v1/discovery/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealId: id, userId: 'demo-user' }),
    });
    const json = await res.json();
    setActivated(json.data?.message ?? 'Activated');
  }

  if (!deal) {
    return <p className={styles.heroSub}>Loading deal…</p>;
  }

  return (
    <>
      <h1 className={styles.heroTitle}>{deal.title}</h1>
      <p className={styles.heroSub}>{deal.description}</p>

      <div className={styles.card} style={{ maxWidth: 400 }}>
        {deal.dealPrice !== undefined && (
          <p className={styles.dealPrice}>
            ${deal.dealPrice}
            {deal.originalPrice !== undefined && (
              <span style={{ textDecoration: 'line-through', opacity: 0.5, marginLeft: 8, fontSize: '1rem' }}>
                ${deal.originalPrice}
              </span>
            )}
          </p>
        )}
        <p className={styles.dealSavings}>Save {deal.savingsPercent}%</p>
        <p className={styles.countdown}>{daysLeft} days remaining</p>
        {deal.code && <p className={styles.cardMeta}>Code: {deal.code}</p>}
        <button type="button" className={styles.btnPrimary} onClick={activate} style={{ marginTop: 12 }}>
          Activate Deal
        </button>
        {activated && <p className={styles.cardMeta}>{activated}</p>}
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Included Tools</h2>
        <ul>
          {tools.map((t) => (
            <li key={t.id} className={styles.cardMeta}>
              <Link href={`/discover/tools/${t.slug}`}>{t.name}</Link>
              {' · '}
              <Link href={t.storeRoute}>Install</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
