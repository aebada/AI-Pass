'use client';

import Link from 'next/link';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import { FOOTER_COLUMNS } from './lib/site-nav';
import styles from './page.module.css';

const DEMO_MAILTO =
  'mailto:hello@ai-pass.com?subject=Enterprise%20AI%20Infrastructure%20Demo';

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
    title: 'Route every model',
    copy: 'One control plane for GPT, Claude, Gemini, and private endpoints — with spend and policy attached.',
  },
  {
    title: 'Govern by default',
    copy: 'Approvals, inventory, and audit trails live in the infrastructure layer, not as an afterthought.',
  },
  {
    title: 'Deploy anywhere',
    copy: 'Cloud, private cloud, hybrid, or air-gapped patterns for regulated operators.',
  },
  {
    title: 'Certify trust',
    copy: 'Trust Engine scoring, monitoring, and compliance packs for ISO 42001 and SOC 2 paths.',
  },
];

const FEATURES = [
  {
    eyebrow: 'Workspace',
    title: 'One place to run enterprise AI',
    copy: 'Agents, workflows, knowledge, and apps share the same identity, wallet, and governance rules.',
    points: ['Unified command center', 'Shared AI wallet', 'Role-aware access'],
    href: '/workspace',
    cta: 'Open workspace',
  },
  {
    eyebrow: 'Trust Engine',
    title: 'Prove what your AI systems do',
    copy: 'Certify systems, monitor runs, and keep an evidence trail ready for audits and regulators.',
    points: ['Certification flows', 'Live monitoring', 'Public verification'],
    href: '/workspace/trust',
    cta: 'Explore Trust Engine',
  },
  {
    eyebrow: 'App Store',
    title: 'Install certified business AI',
    copy: 'Invoice, HR, supply chain, compliance, and more — scored apps ready for enterprise rollout.',
    points: ['Scored catalog', 'Install into workspace', 'Enterprise admin controls'],
    href: '/workspace/store',
    cta: 'Browse App Store',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '',
    who: 'Evaluate the infrastructure layer',
    features: ['Core workspace access', 'Limited daily requests', 'Discovery browsing', 'Community support'],
    cta: 'Start free',
    href: '/login',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/mo',
    who: 'Teams running governed AI daily',
    features: ['Multi-model routing', 'Agent Studio basics', 'AI Wallet credits', 'Email support'],
    cta: 'Choose Professional',
    href: '/workspace/membership',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    who: 'Government, Defence, and on-prem',
    features: ['Air-gapped / private cloud', 'SSO · SCIM · SAML', 'Trust & compliance packs', 'Dedicated success'],
    cta: 'Talk to sales',
    href: DEMO_MAILTO,
    popular: false,
  },
];

const COMPLIANCE = ['ISO 42001', 'ISO 27001', 'GDPR', 'NIS2', 'SOC 2'];

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
              <span className={styles.heroTitleAccent}> Made clear.</span>
            </h1>
            <p className={styles.heroSub}>
              Build, orchestrate, govern, and deploy secure AI across cloud and on-premises — one
              platform for regulated business operations.
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
                <span className={styles.productMeta}>Governed · Routed · Certified</span>
              </div>
              <div className={styles.productBody}>
                <div className={styles.productRail}>
                  {['Route', 'Govern', 'Trust', 'Store'].map((item) => (
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
                    <strong>Trust score</strong>
                    <p>Live certification status for production systems.</p>
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
            <h2 id="pillars-heading">Everything you need to put AI to work safely</h2>
            <p className={styles.sectionSub}>
              Clear product storytelling with one job per section — infrastructure you can actually
              operate.
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
              <div className={styles.featurePanel}>
                <span className={styles.featureBadge}>{feature.eyebrow}</span>
                <p className={styles.featurePanelTitle}>{feature.title}</p>
                <div className={styles.featureBars}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </section>
        ))}

        <section className={styles.section} id="pricing" aria-labelledby="pricing-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>Pricing</p>
            <h2 id="pricing-heading">Plans that match how you operate</h2>
            <p className={styles.sectionSub}>
              Start free, scale with Professional, or deploy Enterprise with private-cloud and
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
          <h2 id="final-cta">Ready to run AI like infrastructure?</h2>
          <p>Book a demo with our team, or explore the interactive product walkthrough.</p>
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
          <p className={styles.footerTag}>Enterprise AI Infrastructure Platform</p>
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
          <span>© {new Date().getFullYear()} AI-Pass</span>
          <span>Secure · Governed · Deployable</span>
        </div>
      </footer>
    </div>
  );
}
