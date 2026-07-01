'use client';

import { ComplianceCopilotPanel } from '../components/ComplianceCopilotPanel';
import { ComplianceShell } from '../components/ComplianceShell';
import styles from '../compliance-ai.module.css';

export default function CopilotPage() {
  return (
    <ComplianceShell>
      <p className={styles.hint}>
        AI Compliance Copilot grounded on policies, frameworks, evidence, risks, and governance data via Provider Hub.
      </p>
      <div style={{ maxWidth: 720 }}>
        <ComplianceCopilotPanel />
      </div>
    </ComplianceShell>
  );
}
