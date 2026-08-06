'use client';

import { useEffect, useState } from 'react';
import { ComplianceShell, SeverityBadge } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function ControlsPage() {
  const [controls, setControls] = useState<{ id: string; controlRef: string; title: string; frameworkCode: string; status: string; progress: number; ownerName: string }[]>([]);
  const [tasks, setTasks] = useState<{ id: string; title: string; status: string; assigneeName: string; dueDate: string; priority: string }[]>([]);

  useEffect(() => {
    fetch('/api/v1/compliance-ai/controls')
      .then((r) => r.json())
      .then((d) => {
        setControls(d.controls ?? []);
        setTasks(d.tasks ?? []);
      })
      .catch(() => {});
  }, []);

  return (
    <ComplianceShell>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Controls ({controls.length})</p>
        <table className={styles.table}>
          <thead>
            <tr><th>Ref</th><th>Title</th><th>Framework</th><th>Status</th><th>Progress</th><th>Owner</th></tr>
          </thead>
          <tbody>
            {controls.map((c) => (
              <tr key={c.id}>
                <td>{c.controlRef}</td>
                <td>{c.title}</td>
                <td>{c.frameworkCode}</td>
                <td>{c.status.replace(/_/g, ' ')}</td>
                <td>{c.progress}%</td>
                <td>{c.ownerName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.card} style={{ marginTop: 16 }}>
        <p className={styles.cardTitle}>Tasks</p>
        <table className={styles.table}>
          <thead>
            <tr><th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due</th></tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.status}</td>
                <td><SeverityBadge severity={t.priority} /></td>
                <td>{t.assigneeName}</td>
                <td>{new Date(t.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComplianceShell>
  );
}
