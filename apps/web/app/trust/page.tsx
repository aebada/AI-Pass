import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import styles from './trust-landing.module.css';

const CAPABILITIES = [
  {
    icon: '🔬',
    title: 'AI Validation',
    text: 'Automated test suites validate reliability, accuracy, and safety before deployment.',
    href: '/workspace/trust/runs',
  },
  {
    icon: '🏅',
    title: 'Certification',
    text: 'Bronze through Platinum tiers with public verification badges and audit reports.',
    href: '/workspace/trust/certify',
  },
  {
    icon: '📡',
    title: 'Continuous Monitoring',
    text: 'Detect model drift, risk changes, and compliance gaps in production.',
    href: '/workspace/trust/monitoring',
  },
  {
    icon: '🔍',
    title: 'Public Verification',
    text: 'Anyone can verify certification status via URL, QR code, or API.',
    href: '/verify/AIP-INV2026',
  },
  {
    icon: '🏛️',
    title: 'AI Governance',
    text: 'Inventory, policies, and approval workflows for enterprise AI programs.',
    href: '/workspace/governance',
  },
  {
    icon: '📋',
    title: 'Compliance',
    text: 'Map AI systems to GDPR, EU AI Act, SOC 2, and industry frameworks.',
    href: '/workspace/apps/compliance-ai',
  },
];

export default function TrustLandingPage() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <header className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>AI-Pass Trust Layer</span>
          <h1 className={styles.title}>The TÜV for Enterprise AI</h1>
          <p className={styles.subtitle}>
            Validate, certify, monitor, and publicly verify AI systems - before and after deployment.
            Built into the AI-Pass Enterprise Operating System, not bolted on.
          </p>
          <div className={styles.ctas}>
            <Link href="/workspace/trust" className={styles.btnPrimary}>
              Open Trust Center →
            </Link>
            <Link href="/workspace/trust/certify" className={styles.btnSecondary}>
              Start Certification
            </Link>
            <Link href="/#trust-layer" className={styles.btnSecondary}>
              See Platform Overview
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Certification Levels</h2>
        <div className={styles.tiers}>
          <div className={`${styles.tier} ${styles.tierBronze}`}>Bronze</div>
          <div className={`${styles.tier} ${styles.tierSilver}`}>Silver</div>
          <div className={`${styles.tier} ${styles.tierGold}`}>Gold</div>
          <div className={`${styles.tier} ${styles.tierPlatinum}`}>Platinum</div>
        </div>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9375rem', lineHeight: 1.65, maxWidth: 640, margin: '0 auto' }}>
          Every certified AI system receives a trust score, risk assessment, public verification URL,
          and continuous monitoring - integrated with Invoice AI, Agent Studio, and the full platform.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Trust Engine Capabilities</h2>
        <div className={styles.grid}>
          {CAPABILITIES.map((cap) => (
            <div key={cap.title} className={styles.card}>
              <div className={styles.cardIcon}>{cap.icon}</div>
              <h3 className={styles.cardTitle}>{cap.title}</h3>
              <p className={styles.cardText}>{cap.text}</p>
              <Link href={cap.href} className={styles.cardLink}>
                Learn more →
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.ctaBand}>
        <h2 className={styles.ctaTitle}>Ready to Certify Your AI?</h2>
        <p className={styles.ctaText}>
          Join enterprises that trust AI-Pass to validate AI before it makes business-critical decisions.
        </p>
        <div className={styles.ctas}>
          <Link href="/workspace/trust/certify" className={styles.btnPrimary}>
            Start Validation →
          </Link>
          <Link href="/about#contact" className={styles.btnSecondary}>
            Book Enterprise Assessment
          </Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <p>
          Part of the <Link href="/">AI-Pass Enterprise AI Operating System</Link>
          {' · '}
          <Link href="/workspace/trust">Trust Center</Link>
          {' · '}
          <Link href="/verify/AIP-INV2026">Demo Verification</Link>
        </p>
      </footer>
    </div>
  );
}
