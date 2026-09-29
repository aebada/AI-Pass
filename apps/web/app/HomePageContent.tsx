'use client';

import Link from 'next/link';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import { FOOTER_COLUMNS } from './lib/site-nav';
import styles from './page.module.css';

const DEMO_MAILTO =
  'mailto:contact@ehopn.com?subject=AI-Pass%20Enterprise%20Demo%20(HOPn)';

const TRUST = [
  'Manufacturing',
  'Banking',
  'Healthcare',
  'Government',
  'Defence',
  'Logistics',
  'Retail',
  'Energy',
];

const PILLARS = [
  {
    title: 'Model routing',
    copy: 'Direct traffic across GPT, Claude, Gemini, and private endpoints under shared spend and policy controls.',
  },
  {
    title: 'Built-in governance',
    copy: 'Inventory, approvals, and audit trails are part of the runtime — not bolted on after deployment.',
  },
  {
    title: 'Semantic grounding',
    copy: 'Agents answer from your enterprise knowledge graph with multi-hop provenance, not free-form recall.',
  },
  {
    title: 'Trust certification',
    copy: 'Score, monitor, and evidence AI systems for ISO 42001, SOC 2, and sector-specific oversight.',
  },
];

type FeatureVisual =
  | {
      kind: 'workspace';
      rows: { label: string; status: string; meta: string }[];
    }
  | {
      kind: 'trust';
      score: string;
      items: { label: string; value: string }[];
    }
  | {
      kind: 'store';
      apps: { name: string; score: string; tag: string }[];
    };

const FEATURES: {
  eyebrow: string;
  title: string;
  copy: string;
  points: string[];
  href: string;
  cta: string;
  visual: FeatureVisual;
}[] = [
  {
    eyebrow: 'Workspace',
    title: 'One operating layer for enterprise AI',
    copy: 'Agents, workflows, knowledge, and applications share identity, budget, and policy — so teams ship without fragmenting control.',
    points: [
      'Unified command center for models and agents',
      'Shared AI wallet with cost visibility',
      'Role-based access across business units',
    ],
    href: '/workspace',
    cta: 'Open workspace',
    visual: {
      kind: 'workspace',
      rows: [
        { label: 'Claims Triage Agent', status: 'Governed', meta: 'Banking · Human gate' },
        { label: 'Quality Twin Agent', status: 'Certified', meta: 'Manufacturing · Graph RAG' },
        { label: 'Clinical Intake Agent', status: 'Monitored', meta: 'Healthcare · HIPAA filter' },
      ],
    },
  },
  {
    eyebrow: 'Trust Engine',
    title: 'Evidence your AI systems can stand on',
    copy: 'Certify production systems, monitor live runs, and retain an explainable trail for auditors and regulators.',
    points: [
      'Certification workflows before go-live',
      'Continuous monitoring of risk and drift',
      'Public verification for certified systems',
    ],
    href: '/workspace/trust',
    cta: 'Explore Trust Engine',
    visual: {
      kind: 'trust',
      score: '94',
      items: [
        { label: 'ISO 42001 inventory', value: 'Covered' },
        { label: 'Decision lineage', value: 'Active' },
        { label: 'Impact assessment', value: 'Partial' },
      ],
    },
  },
  {
    eyebrow: 'App Store',
    title: 'Deploy certified business applications',
    copy: 'Install finance, operations, compliance, and industry solutions that already meet your governance bar.',
    points: [
      'Scored catalog with trust badges',
      'One-click install into the workspace',
      'Enterprise admin and residency controls',
    ],
    href: '/workspace/store',
    cta: 'Browse App Store',
    visual: {
      kind: 'store',
      apps: [
        { name: 'Invoice AI', score: 'A', tag: 'Finance' },
        { name: 'Compliance AI', score: 'A', tag: 'Risk' },
        { name: 'Supply Chain AI', score: 'B+', tag: 'Ops' },
      ],
    },
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    who: 'Evaluate the platform with core workspace access',
    features: ['Core workspace access', 'Limited daily requests', 'Discovery browsing', 'Community support'],
    cta: 'Start free',
    href: '/login',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/mo',
    who: 'Teams operating governed AI in production',
    features: ['Multi-model routing', 'Agent Studio', 'AI Wallet credits', 'Email support'],
    cta: 'Choose Professional',
    href: '/workspace/membership',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    who: 'Regulated, private-cloud, and air-gapped deployments',
    features: ['Air-gapped / private cloud', 'SSO · SCIM · SAML', 'Trust & compliance packs', 'Dedicated success'],
    cta: 'Talk to sales',
    href: DEMO_MAILTO,
    popular: false,
  },
];

const COMPLIANCE = ['ISO 42001', 'ISO 27001', 'GDPR', 'NIS2', 'SOC 2'];

function FeatureVisualPanel({ visual, eyebrow }: { visual: FeatureVisual; eyebrow: string }) {
  if (visual.kind === 'workspace') {
    return (
      <div className={styles.featurePanel}>
        <span className={styles.featureBadge}>{eyebrow}</span>
        <p className={styles.featurePanelTitle}>Live agent inventory</p>
        <div className={styles.mockList}>
          {visual.rows.map((row) => (
            <div key={row.label} className={styles.mockRow}>
              <div>
                <strong>{row.label}</strong>
                <span>{row.meta}</span>
              </div>
              <em>{row.status}</em>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.kind === 'trust') {
    return (
      <div className={styles.featurePanel}>
        <span className={styles.featureBadge}>{eyebrow}</span>
        <div className={styles.mockScore}>
          <strong>{visual.score}</strong>
          <span>Trust score</span>
        </div>
        <div className={styles.mockList}>
          {visual.items.map((item) => (
            <div key={item.label} className={styles.mockRow}>
              <div>
                <strong>{item.label}</strong>
              </div>
              <em>{item.value}</em>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.featurePanel}>
      <span className={styles.featureBadge}>{eyebrow}</span>
      <p className={styles.featurePanelTitle}>Certified catalog</p>
      <div className={styles.mockList}>
        {visual.apps.map((app) => (
          <div key={app.name} className={styles.mockRow}>
            <div>
              <strong>{app.name}</strong>
              <span>{app.tag}</span>
            </div>
            <em>{app.score}</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomePageContent() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <main>
        <section className={`${styles.hero} hero-presence`} aria-labelledby="hero-heading">
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroInner}>
            <p className={styles.brandMark}>AI-Pass</p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              Enterprise AI infrastructure.
              <span className={styles.heroTitleAccent}> Under control.</span>
            </h1>
            <p className={styles.heroSub}>
              Route, govern, ground, and certify AI across cloud and on-premises — one operating
              system for regulated industries.
            </p>
            <div className={styles.heroCtas}>
              <a href={DEMO_MAILTO} className={styles.btnPrimary}>
                Book enterprise demo
              </a>
              <Link href="/demo" className={styles.btnSecondary}>
                Try interactive demo
              </Link>
            </div>
            <p className={styles.heroNote}>No credit card · Enterprise-ready · On-prem options</p>
          </div>

          <div className={styles.heroVisual} aria-hidden>
            <div className={styles.productStage}>
              <div className={styles.productChrome}>
                <span>AI-Pass Workspace</span>
                <span className={styles.productMeta}>Governed · Grounded · Certified</span>
              </div>
              <div className={styles.productBody}>
                <div className={styles.productRail}>
                  {['Route', 'Govern', 'Graph', 'Trust'].map((item) => (
                    <span key={item} className={styles.productPill}>
                      {item}
                    </span>
                  ))}
                </div>
                <div className={styles.productPanels}>
                  <div>
                    <strong>Model router</strong>
                    <p>Policy-aware routing across public and private models.</p>
                  </div>
                  <div>
                    <strong>Knowledge graph</strong>
                    <p>Multi-hop answers with traceable enterprise provenance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.logoStrip} aria-label="Industries we support">
          {TRUST.map((name) => (
            <span key={name} className={styles.logoItem}>
              {name}
            </span>
          ))}
        </section>

        <section className={styles.section} aria-labelledby="pillars-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Platform</p>
            <h2 id="pillars-heading">The controls regulated operators require</h2>
            <p className={styles.sectionSub}>
              AI-Pass combines routing, governance, semantic context, and certification so production
              AI stays accountable from the first request to the audit trail.
            </p>
          </div>
          <div className={styles.pillarGrid}>
            {PILLARS.map((pillar) => (
              <article key={pillar.title} className={styles.pillar}>
                <h3>{pillar.title}</h3>
                <p>{pillar.copy}</p>
              </article>
            ))}
          </div>
        </section>

        {FEATURES.map((feature, index) => (
          <section
            key={feature.title}
            className={`${styles.featureBand} ${index % 2 === 1 ? styles.featureBandAlt : ''}`}
            aria-labelledby={`feature-${index}`}
          >
            <div className={styles.featureCopy}>
              <p className={styles.eyebrow}>{feature.eyebrow}</p>
              <h2 id={`feature-${index}`}>{feature.title}</h2>
              <p className={styles.sectionSub}>{feature.copy}</p>
              <ul className={styles.pointList}>
                {feature.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <Link href={feature.href} className={styles.linkAccent}>
                {feature.cta} →
              </Link>
            </div>
            <div className={styles.featureVisual} aria-hidden>
              <FeatureVisualPanel visual={feature.visual} eyebrow={feature.eyebrow} />
            </div>
          </section>
        ))}

        <section className={styles.section} id="pricing" aria-labelledby="pricing-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Pricing</p>
            <h2 id="pricing-heading">Plans matched to how you operate</h2>
            <p className={styles.sectionSub}>
              Begin on Free, expand with Professional, or deploy Enterprise with private-cloud and
              air-gapped options.
            </p>
          </div>
          <div className={styles.pricingGrid}>
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`${styles.priceCard} ${plan.popular ? styles.priceCardPopular : ''}`}
              >
                {plan.popular ? <span className={styles.popularBadge}>Most popular</span> : null}
                <h3>{plan.name}</h3>
                <p className={styles.priceWho}>{plan.who}</p>
                <p className={styles.priceAmount}>
                  {plan.price}
                  {plan.period ? <span>{plan.period}</span> : null}
                </p>
                <ul>
                  {plan.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {plan.href.startsWith('mailto:') ? (
                  <a
                    href={plan.href}
                    className={plan.popular ? styles.btnPrimary : styles.btnSecondary}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    href={plan.href}
                    className={plan.popular ? styles.btnPrimary : styles.btnSecondary}
                  >
                    {plan.cta}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.compliance} aria-label="Compliance posture">
          {COMPLIANCE.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </section>

        <section className={styles.finalCta} aria-labelledby="final-cta">
          <h2 id="final-cta">Ready to operate AI with confidence?</h2>
          <p>
            Speak with our team about your deployment, or explore the interactive semantic graph
            demo.
          </p>
          <div className={styles.heroCtas}>
            <a href={DEMO_MAILTO} className={styles.btnOnPurple}>
              Book enterprise demo
            </a>
            <Link href="/demo" className={styles.btnGhostOnPurple}>
              Try interactive demo
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <BrandLogoLink />
          <p className={styles.footerTag}>Enterprise AI Operating System · A HOPn company</p>
        </div>
        <div className={styles.footerGrid}>
          {FOOTER_COLUMNS.slice(0, 5).map((column) => (
            <div key={column.title} className={styles.footerCol}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.slice(0, 6).map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} AI-Pass · A HOPn company</span>
          <span>Secure · Governed · Deployable · contact@ehopn.com</span>
        </div>
      </footer>
    </div>
  );
}
