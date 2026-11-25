'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from '../connect/connect.module.css';

type Snapshot = {
  features: { id: string; name: string; instinctCue: string; aipass: string; status: string }[];
  twins: { id: string; kind: string; displayName: string; channels: string[] }[];
  vault: { id: string; label: string; service: string; secretRef: string }[];
  trustedPeers: { id: string; displayName: string; approved: boolean; twinId: string }[];
  conciergeCalls: { id: string; to: string; purpose: string; status: string }[];
  payments: { id: string; merchant: string; amountCents: number; currency: string; status: string }[];
  proactive: { id: string; title: string; reason: string; status: string }[];
  whatsapp: { configured: boolean };
};

export default function TwinAutopilotPage() {
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [msg, setMsg] = useState('');
  const twinId = snap?.twins[0]?.id;

  const refresh = useCallback(async () => {
    const res = await fetch('/api/v1/twin-autopilot');
    setSnap((await res.json()) as Snapshot);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function demoVault() {
    if (!twinId) return;
    await fetch('/api/v1/twin-autopilot/vault', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        twinId,
        label: 'Google Workspace',
        service: 'google-workspace',
        secretRef: 'vault://host/GOOGLE_WORKSPACE_OAUTH',
      }),
    });
    setMsg('Vault ref added (secret stays on host — never in prompts).');
    await refresh();
  }

  async function demoTrusted() {
    if (!twinId || !snap?.twins[1]) return;
    const res = await fetch('/api/v1/twin-autopilot/trusted', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        twinId,
        displayName: snap.twins[1].displayName,
        peerTwinId: snap.twins[1].id,
        channel: 'in_app',
      }),
    });
    const json = (await res.json()) as { peer?: { id: string } };
    if (json.peer?.id) {
      await fetch('/api/v1/twin-autopilot/trusted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', peerId: json.peer.id }),
      });
    }
    setMsg('Trusted twin peer added and approved.');
    await refresh();
  }

  async function demoConcierge() {
    if (!twinId) return;
    const res = await fetch('/api/v1/twin-autopilot/concierge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request',
        twinId,
        to: '+49891234567',
        purpose: 'Book a demo slot with the research lab receptionist',
      }),
    });
    const json = (await res.json()) as { call?: { id: string } };
    if (json.call?.id) {
      await fetch('/api/v1/twin-autopilot/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', callId: json.call.id }),
      });
    }
    setMsg('Concierge call requested and approved (voice provider stub).');
    await refresh();
  }

  async function demoPayment() {
    if (!twinId) return;
    const res = await fetch('/api/v1/twin-autopilot/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'request',
        twinId,
        amountCents: 4900,
        currency: 'EUR',
        merchant: 'Airline booking',
      }),
    });
    const json = (await res.json()) as { payment?: { id: string } };
    if (json.payment?.id) {
      await fetch('/api/v1/twin-autopilot/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decide',
          paymentId: json.payment.id,
          approve: true,
        }),
      });
    }
    setMsg('Payment gate: twin asked, human approved.');
    await refresh();
  }

  async function demoProactive() {
    if (!twinId) return;
    await fetch('/api/v1/twin-autopilot/proactive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'enqueue',
        twinId,
        title: 'Calendar conflict tomorrow 10:00',
        reason: 'Your twin noticed an overlap with the supplier call.',
        channel: 'whatsapp',
      }),
    });
    setMsg('Proactive follow-up queued.');
    await refresh();
  }

  return (
    <WorkspaceLayoutClient
      title="Twin Autopilot"
      subtitle="Instinct-class personal and employee twins — first-party in AI-Pass."
    >
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <h2>Own the Instinct functions inside the twin</h2>
          <p>
            Chat channels, vault, trusted twins, concierge calls, payment gates, proactive
            follow-ups, and Connect — with Company Harness approvals. Better than a consumer agent
            alone: the twin is tied to your company graph.
          </p>
          <div className={styles.actions}>
            <Link href="/workspace/connect/whatsapp" className={styles.btn}>
              WhatsApp channel
            </Link>
            <Link href="/workspace/connect" className={styles.btnGhost}>
              Connect apps
            </Link>
            <Link href="/twin-autopilot" className={styles.btnGhost}>
              Product page
            </Link>
          </div>
        </section>

        {msg ? <div className={styles.success}>{msg}</div> : null}

        <section className={styles.panel}>
          <h3>Feature parity</h3>
          <div className={styles.grid}>
            {(snap?.features || []).map((f) => (
              <article key={f.id} className={styles.card}>
                <span className={styles.badge}>{f.status}</span>
                <h4>{f.name}</h4>
                <p className={styles.meta}>Instinct: {f.instinctCue}</p>
                <p>{f.aipass}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.panel}>
          <h3>Twins</h3>
          <div className={styles.connected}>
            {(snap?.twins || []).map((t) => (
              <div key={t.id} className={styles.connectedItem}>
                <div>
                  <strong>{t.displayName}</strong>
                  <span>
                    {t.kind} · {t.channels.join(', ')}
                  </span>
                </div>
                <span className={styles.statusOk}>Active</span>
              </div>
            ))}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btn} onClick={() => void demoVault()}>
              Add vault ref
            </button>
            <button type="button" className={styles.btn} onClick={() => void demoTrusted()}>
              Trust peer twin
            </button>
            <button type="button" className={styles.btn} onClick={() => void demoConcierge()}>
              Concierge call
            </button>
            <button type="button" className={styles.btn} onClick={() => void demoPayment()}>
              Payment gate
            </button>
            <button type="button" className={styles.btn} onClick={() => void demoProactive()}>
              Proactive task
            </button>
            <button type="button" className={styles.btnGhost} onClick={() => void refresh()}>
              Refresh
            </button>
          </div>
          <p className={styles.meta} style={{ marginTop: '0.75rem' }}>
            WhatsApp API: {snap?.whatsapp.configured ? 'configured' : 'stub (set tokens to go live)'}
          </p>
        </section>

        <section className={styles.panel}>
          <h3>Live state</h3>
          <p>
            Vault refs: {snap?.vault.length ?? 0} · Trusted peers:{' '}
            {snap?.trustedPeers.length ?? 0} · Calls: {snap?.conciergeCalls.length ?? 0} · Payments:{' '}
            {snap?.payments.length ?? 0} · Proactive: {snap?.proactive.length ?? 0}
          </p>
        </section>
      </div>
    </WorkspaceLayoutClient>
  );
}
