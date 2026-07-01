import Link from 'next/link';
import { defaultSupplyChainAIService, DEMO_TENANT_ID } from '@ai-pass/supply-chain-ai';
import styles from './supply-chain-shell.module.css';

export default function SupplyChainDashboard() {
  const { stats } = defaultSupplyChainAIService.getDashboard(DEMO_TENANT_ID);
  const events = defaultSupplyChainAIService.listEvents(DEMO_TENANT_ID).events;
  const approvals = defaultSupplyChainAIService.listApprovals(DEMO_TENANT_ID, 'pending');

  return (
    <div>
      <header className={styles.header}>
        <h1>Procurement Dashboard</h1>
        <p className={styles.muted}>Active sourcing events, evaluations, and risk alerts</p>
      </header>

      <div className={styles.grid4} style={{ marginBottom: 24 }}>
        {[
          { label: 'Active Events', value: stats.activeEvents },
          { label: 'Open Tenders', value: stats.openTenders },
          { label: 'Pending Evals', value: stats.pendingEvaluations },
          { label: 'Risk Alerts', value: stats.riskAlerts },
          { label: 'Pipeline Value', value: `€${stats.pipelineValue.toLocaleString()}` },
          { label: 'Total Spend', value: `€${stats.totalSpend.toLocaleString()}` },
        ].map((kpi) => (
          <div key={kpi.label} className={styles.card}>
            <div className={styles.kpiLabel}>{kpi.label}</div>
            <div className={styles.kpiValue}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        <section className={styles.card}>
          <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Active Sourcing Events</h2>
          <table className={styles.table}>
            <thead>
              <tr><th>Event</th><th>Status</th><th>Deadline</th></tr>
            </thead>
            <tbody>
              {events.filter((e) => e.status !== 'closed').map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td><span className={styles.badgeInfo}>{e.status}</span></td>
                  <td>{e.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.card}>
          <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Pending Approvals</h2>
          {approvals.length === 0 ? (
            <p className={styles.muted}>No pending approvals</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr><th>Approver</th><th>Event</th><th>Status</th></tr>
              </thead>
              <tbody>
                {approvals.map((a) => {
                  const event = events.find((e) => e.id === a.eventId);
                  return (
                    <tr key={a.id}>
                      <td>{a.approverName}</td>
                      <td>{event?.title ?? a.eventId}</td>
                      <td><span className={styles.badgeInfo}>{a.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <div className={styles.actions} style={{ marginTop: 24 }}>
        <Link href="/workspace/apps/supply-chain-ai/events/create" className={styles.btnPrimary}>+ Create Event</Link>
        <Link href="/workspace/apps/supply-chain-ai/offers" className={styles.btn}>Upload Offer</Link>
        <Link href="/workspace/apps/supply-chain-ai/evaluation" className={styles.btn}>Run Evaluation</Link>
        <Link href="/workspace/apps/supply-chain-ai/comparison" className={styles.btn}>Compare Suppliers</Link>
      </div>
    </div>
  );
}
