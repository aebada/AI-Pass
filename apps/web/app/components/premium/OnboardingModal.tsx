'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useApp } from './AppProviders';
import styles from './onboarding.module.css';

const STEPS = [
  {
    title: 'Welcome to AI Pass',
    body: 'Build complete business solutions from requirements — web, mobile, workflows, and AI agents in one platform.',
    icon: '✨',
  },
  {
    title: 'Describe your needs',
    body: 'Use the Requirements Wizard to capture actors, data, screens, and integrations in plain language.',
    icon: '📝',
  },
  {
    title: 'Build in Studio',
    body: 'Generate solutions visually, assign agents to workflow steps, and preview web + mobile layouts.',
    icon: '🎨',
  },
  {
    title: 'Deploy with governance',
    body: 'One-click deploy with Trust Engine checks, audit trails, and approval flows built in.',
    icon: '🚀',
  },
];

export function OnboardingModal() {
  const { showOnboarding, completeOnboarding } = useApp();
  const [step, setStep] = useState(0);

  if (!showOnboarding) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className={styles.overlay} role="dialog" aria-modal aria-labelledby="onboarding-title">
      <div className={styles.modal}>
        <div className={styles.glow} aria-hidden />
        <div className={styles.progress}>
          {STEPS.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i <= step ? styles.dotActive : ''}`} />
          ))}
        </div>
        <div className={styles.icon}>{current?.icon}</div>
        <h2 id="onboarding-title" className={styles.title}>{current?.title}</h2>
        <p className={styles.body}>{current?.body}</p>
        <div className={styles.actions}>
          {step > 0 && (
            <button type="button" className={styles.btnSecondary} onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button type="button" className={styles.btnGhost} onClick={completeOnboarding}>
            Skip
          </button>
          {isLast ? (
            <>
              <Link href="/dashboard" className={styles.btnPrimary} onClick={completeOnboarding}>
                Go to Dashboard →
              </Link>
              <Link href="/requirements" className={styles.btnSecondary} onClick={completeOnboarding}>
                Start building
              </Link>
            </>
          ) : (
            <button type="button" className={styles.btnPrimary} onClick={() => setStep(step + 1)}>
              Next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
