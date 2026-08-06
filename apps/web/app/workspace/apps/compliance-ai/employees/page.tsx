'use client';

import { DEMO_EMPLOYEES } from '@ai-pass/compliance-ai';
import { ComplianceShell } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function EmployeesPage() {
  const employees = DEMO_EMPLOYEES;

  return (
    <ComplianceShell>
      <p className={styles.hint}>Onboarding, training, policy acceptance, access reviews, and reminders.</p>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Employee</th><th>Department</th><th>Status</th><th>Training</th><th>Policies</th></tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>{e.employeeName}</td>
                <td>{e.department}</td>
                <td>{e.status}</td>
                <td>{e.trainingCompleted.length} done / {e.trainingPending.length} pending</td>
                <td>{e.policiesAccepted.length} accepted / {e.policiesPending.length} pending</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ComplianceShell>
  );
}
