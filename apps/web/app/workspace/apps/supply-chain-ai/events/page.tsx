import Link from 'next/link';
import { defaultSupplyChainAIService, DEMO_TENANT_ID } from '@ai-pass/supply-chain-ai';
import styles from '../supply-chain-shell.module.css';

export default function SourcingEventsPage() {
  const { events } = defaultSupplyChainAIService.listEvents(DEMO_TENANT_ID);

  return (
    <div>
      <header className={styles.header}>
        <h1>Sourcing Events</h1>
        <div className={styles.actions}>
          <Link href="/workspace/apps/supply-chain-ai/events/create" className={styles.btnPrimary}>+ Create Event</Link>
        </div>
      </header>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Department</th>
              <th>Budget</th>
              <th>Status</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.category}</td>
                <td>{e.department}</td>
                <td>{e.budgetCap ? `€${e.budgetCap.toLocaleString()}` : '-'}</td>
                <td><span className={styles.badgeInfo}>{e.status}</span></td>
                <td>{e.deadline}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
