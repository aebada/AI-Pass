'use client';

import Link from 'next/link';
import { Card } from '@ai-pass/ui';
import { BusinessShell } from '../components/business/BusinessShell';
import styles from './help.module.css';

const DOCS = [
  { title: 'Getting started', desc: 'Requirements wizard → Studio → Deploy in 3 steps', href: '/requirements' },
  { title: 'Solution Studio', desc: 'Visual builder, workflow canvas, and previews', href: '/studio' },
  { title: 'Marketplace templates', desc: 'Install Invoice AI, Support, Supply Chain', href: '/marketplace' },
  { title: 'Platform modules', desc: 'Governance, Trust, LiveSync, Knowledge Pipeline', href: '/platform' },
  { title: 'AI Pass Platform', desc: 'Monaco editor, chat, agent mode, terminal', href: '/ide' },
  { title: 'Settings & API keys', desc: 'Theme, model selector, local key storage', href: '/settings' },
];

const FAQ = [
  { q: 'What makes AI Pass different?', a: 'AI Pass is an enterprise AI operating system — not just a chatbot or IDE. Describe requirements in plain language, generate apps and workflows, and deploy with governance, trust, and compliance built in.' },
  { q: 'Where are API keys stored?', a: 'Locally in your browser via localStorage. Production should use a secure vault.' },
  { q: 'Can I deploy on-prem?', a: 'Enterprise plan supports VPC and on-prem deployments (contact sales).' },
];

export default function HelpPage() {
  return (
    <BusinessShell title="Help & Documentation" subtitle="Guides, FAQs, and platform references">
      <div className={styles.grid}>
        {DOCS.map((doc) => (
          <Link key={doc.title} href={doc.href} className={styles.docLink}>
            <Card variant="glass" hover padding="md">
              <h3 className={styles.docTitle}>{doc.title}</h3>
              <p className={styles.docDesc}>{doc.desc}</p>
              <span className={styles.docArrow}>Read guide →</span>
            </Card>
          </Link>
        ))}
      </div>

      <section className={styles.faq}>
        <h2 className={styles.faqTitle}>Frequently asked questions</h2>
        {FAQ.map((item) => (
          <details key={item.q} className={styles.faqItem}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
    </BusinessShell>
  );
}
