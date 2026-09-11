'use client';

import Link from 'next/link';
import { useState } from 'react';
import { STORE_ROUTES } from '@ai-pass/routes';
import { Button, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../store.module.css';

const WIZARD_STEPS = [
  'App type', 'Metadata', 'Skills', 'Pricing', 'Permissions', 'Security review', 'Publish',
];

export default function PublishAppWizardPage() {
  const [step, setStep] = useState(0);

  return (
    <WorkspaceLayoutClient title="Publish App" subtitle="7-step wizard - reuses marketplace publish flow">
      <Link href={STORE_ROUTES.developer} className={styles.navLink}>← Developer Dashboard</Link>
      <div className={styles.wizard} style={{ marginTop: 16 }}>
        <div className={styles.wizardSteps}>
          {WIZARD_STEPS.map((s, i) => (
            <span key={s} className={`${styles.wizardStep} ${i === step ? styles.wizardStepActive : ''}`}>
              {i + 1}. {s}
            </span>
          ))}
        </div>
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Step {step + 1}: {WIZARD_STEPS[step]}</h3>
          <p className={styles.cardDesc}>
            Configure your app for the AI Pass Store. Apps are registered in marketplace-core
            and distributed via store-core install flow.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {step > 0 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
            {step < WIZARD_STEPS.length - 1 ? (
              <Button variant="primary" onClick={() => setStep(step + 1)}>Next</Button>
            ) : (
              <Button variant="primary">Submit for review</Button>
            )}
          </div>
        </Card>
      </div>
    </WorkspaceLayoutClient>
  );
}
