'use client';

import Link from 'next/link';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import { DemoBookingForm } from './components/DemoBookingForm';
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
          <div className={styles.heroSplit}>
            <div className={styles.heroInner}>
              <p className={styles.brandMark}>AI-Pass</p>
              <h1 id="hero-heading" className={styles.heroTitle}>
                AI that answers like your people.
                <span className={styles.heroTitleAccent}> Under your rules.</span>
              </h1>
              <p className={styles.heroSub}>
                Explainable paths, deterministic checks, and human role-based access so results follow
                organization policy — not a black box. Book the demo in the product itself.
              </p>
              <div className={styles.heroCtas}>
                <a href="#book-demo" className={styles.btnPrimary}>
                  Book a demo
                </a>
                <Link href="/demo" className={styles.btnSecondary}>
                  Open the knowledge graph
                </Link>
              </div>
              <p className={styles.heroNote}>Self-serve form · Role-aware walkthrough · No credit card</p>
            </div>
            <div className={styles.heroFormCard} id="book-demo">
              <p className={styles.eyebrow}>Self-serve demo</p>
              <h2 className={styles.heroFormTitle}>Fill the form. Walk the graph as your role.</h2>
              <DemoBookingForm compact />
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

        <section className={styles.section} aria-labelledby="power-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>The power of the solution</p>
            <h2 id="power-heading">Explainable. Deterministic. Role-based.</h2>
            <p className={styles.sectionSub}>
              AI-Pass connects models to human roles and organization rules. The answer is a path you
              can audit: who may see it, which rule fired, and which sources corroborate it.
            </p>
          </div>
          <div className={styles.pillarGrid}>
            <article className={styles.pillar}>
              <h3>Explainability</h3>
              <p>Every decision is a hop list: node, predicate, source, confidence. No orphan labels.</p>
            </article>
            <article className={styles.pillar}>
              <h3>Deterministic</h3>
              <p>Same graph and same contract produce the same decision. Sampling stays for drafts only.</p>
            </article>
            <article className={styles.pillar}>
              <h3>Human role-based</h3>
              <p>Quality, plant, audit, and operator each see the slice their job is allowed to act on.</p>
            </article>
            <article className={styles.pillar}>
              <h3>Organization rules</h3>
              <p>Policies sit in the graph. If a second source is required, the answer will not publish without it.</p>
            </article>
          </div>
          <div className={styles.heroCtas} style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <Link href="/research" className={styles.btnPrimary}>
              Open HOPN Lab
            </Link>
            <Link href="/demo" className={styles.btnSecondary}>
              Try interactive demo
            </Link>
          </div>
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
          <p>Book from the form on this page, or open the full knowledge graph walkthrough.</p>
          <div className={styles.heroCtas}>
            <a href="#book-demo" className={styles.btnOnPurple}>
              Book a demo
            </a>
            <Link href="/demo" className={styles.btnGhostOnPurple}>
              Open the knowledge graph
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
