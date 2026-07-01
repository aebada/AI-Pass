'use client';

import { useState } from 'react';
import { defaultSupplyChainAIService, DEMO_TENANT_ID } from '@ai-pass/supply-chain-ai';
import styles from '../supply-chain-shell.module.css';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState(
    defaultSupplyChainAIService.listApprovals(DEMO_TENANT_ID, 'pending'),
  );
  const events = defaultSupplyChainAIService.listEvents(DEMO_TENANT_ID).events;

  async function handleAction(approvalId: string, action: 'approve' | 'reject') {
    await fetch('/api/v1/supply-chain-ai/approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvalId, action, approverName: 'Demo Approver' }),
    });
    setApprovals(defaultSupplyChainAIService.listApprovals(DEMO_TENANT_ID, 'pending'));
  }

  return (
    <div>
      <header className={styles.header}>
        <h1>Approvals Queue</h1>
      </header>

      <div className={styles.card}>
        {approvals.length === 0 ? (
          <p className={styles.muted}>No pending approvals</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr><th>Event</th><th>Approver</th><th>Requested</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {approvals.map((a) => {
                const event = events.find((e) => e.id === a.eventId);
                return (
                  <tr key={a.id}>
                    <td>{event?.title ?? a.eventId}</td>
                    <td>{a.approverName}</td>
                    <td>{new Date(a.requestedAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <button type="button" className={styles.btnPrimary} onClick={() => handleAction(a.id, 'approve')}>Approve</button>
                        <button type="button" className={styles.btn} onClick={() => handleAction(a.id, 'reject')}>Reject</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
