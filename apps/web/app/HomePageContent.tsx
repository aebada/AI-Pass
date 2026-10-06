'use client';

import Link from 'next/link';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import { DemoBookingForm } from './components/DemoBookingForm';
import { FOOTER_COLUMNS } from './lib/site-nav';
import styles from './page.module.css';

const DEMO_MAILTO =
  'mailto:contact@aipass.space?subject=Enterprise%20AI%20Infrastructure%20Demo';

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

const STEPS = [
  {
    n: '01',
    title: 'Capture human expertise',
    copy: 'Quality, plant, audit, and policy owners write the rules they already use. No prompt theatre.',
  },
  {
    n: '02',
    title: 'Encode the knowledge graph',
    copy: 'Nodes, attributes, metadata, and provenance become the source of truth. Policies sit in the graph.',
  },
  {
    n: '03',
    title: 'Run role-based agents',
    copy: 'Specialist agents answer on that graph. Each role sees only the slice their job may act on.',
  },
];

const PILLARS = [
  {
    title: 'Explainable',
    copy: 'Every decision is a hop list: node, predicate, source, confidence. No orphan labels.',
  },
  {
    title: 'Deterministic',
    copy: 'Same graph and same contract produce the same decision. Sampling stays for drafts only.',
  },
  {
    title: 'Role-based',
    copy: 'Quality, plant, audit, and operator each see the slice their job is allowed to act on.',
  },
  {
    title: 'Organization rules',
    copy: 'If a second source is required, the answer will not publish without it.',
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

const COMPLIANCE = ['ISO 42001', 'ISO 27001', 'GDPR', 'NIS2', 'SOC 2 Type II ready'];

export default function HomePageContent() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <main>
        <section className={`${styles.hero} hero-presence`} aria-labelledby="hero-heading">
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroSplit}>
            <div className={styles.heroInner}>
              <p className={styles.eyebrow}>The deployment gate for enterprise AI</p>
              <h1 id="hero-heading" className={styles.heroTitle}>
                Your experts. Your rules.
                <span className={styles.heroTitleAccent}> Answers you can audit.</span>
              </h1>
              <p className={styles.heroSub}>
                Models guess. AI-Pass turns human expertise into a knowledge graph and organization
                rules, then runs specialist agents that stay explainable, deterministic, and role-based.
              </p>
              <div className={styles.heroCtas}>
                <a href="#book-demo" className={styles.btnPrimary}>
                  Book a demo
                </a>
                <Link href="/demo" className={styles.btnSecondary}>
                  Open the knowledge graph
                </Link>
              </div>
              <p className={styles.heroNote}>Self-serve form. Role-aware walkthrough. No credit card.</p>
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

        <section className={styles.section} aria-labelledby="problem-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>The problem</p>
            <h2 id="problem-heading">Copilots get bought. Then go-live freezes.</h2>
            <p className={styles.sectionSub}>
              Nobody can explain the answer, replay the decision, or prove the right role saw the
              right slice. A black box cannot pass audit, plant quality, or a bank policy review.
            </p>
          </div>
          <div className={styles.problemGrid}>
            <article className={styles.problemCard}>
              <h3>No path</h3>
              <p>The model returns a label. There is no hop list back to lot, supplier, or rule.</p>
            </article>
            <article className={styles.problemCard}>
              <h3>No replay</h3>
              <p>Ask twice, get two stories. Sampling is not a control for regulated work.</p>
            </article>
            <article className={styles.problemCard}>
              <h3>No role wall</h3>
              <p>Operator, quality, and auditor share one unfiltered answer surface.</p>
            </article>
          </div>
        </section>

        <section className={styles.section} id="how-it-works" aria-labelledby="how-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>How it works</p>
            <h2 id="how-heading">Human expertise becomes software.</h2>
            <p className={styles.sectionSub}>
              We do not replace your people. We encode what they already know, then apply it every time.
            </p>
          </div>
          <ol className={styles.stepGrid}>
            {STEPS.map((step) => (
              <li key={step.n} className={styles.step}>
                <span className={styles.stepNum}>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="power-heading">
          <div className={styles.sectionHead}>
            <p className={styles.eyebrow}>The power of the solution</p>
            <h2 id="power-heading">Explainable. Deterministic. Role-based.</h2>
            <p className={styles.sectionSub}>
              The answer is a path you can audit: who may see it, which rule fired, and which sources
              corroborate it.
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
          <div className={styles.heroCtas} style={{ justifyContent: 'center', marginTop: '1.5rem' }}>
            <Link href="/demo" className={styles.btnPrimary}>
              Try the interactive demo
            </Link>
            <Link href="/research" className={styles.btnSecondary}>
              Open HOPN Lab
            </Link>
          </div>
        </section>

        <section className={styles.micro1} id="micro1" aria-labelledby="micro1-heading">
          <div className={styles.micro1Inner}>
            <p className={styles.eyebrow}>Partnership</p>
            <h2 id="micro1-heading">How we collaborate with Micro1</h2>
            <p className={styles.sectionSub}>
              Micro1 is the training gate: expert humans who create and vet data so models learn the
              right work. AI-Pass is the deployment gate: those same experts&apos; rules become a
              knowledge graph so agents can run under organization policy.
            </p>
            <div className={styles.gateGrid}>
              <article className={styles.gateCard}>
                <p className={styles.gateKicker}>Micro1</p>
                <h3>Training gate</h3>
                <ul>
                  <li>Source domain experts</li>
                  <li>Create and vet training data</li>
                  <li>Raise model quality before ship</li>
                </ul>
              </article>
              <article className={styles.gateCardAccent}>
                <p className={styles.gateKicker}>Together</p>
                <h3>Expert to runtime</h3>
                <ul>
                  <li>Experts encode rules once</li>
                  <li>Graph + policy sit in front of the model</li>
                  <li>Joint pilots in manufacturing, banking, public sector</li>
                </ul>
              </article>
              <article className={styles.gateCard}>
                <p className={styles.gateKicker}>AI-Pass</p>
                <h3>Deployment gate</h3>
                <ul>
                  <li>Knowledge graph + org rules</li>
                  <li>Role-based specialist agents</li>
                  <li>Cloud, private cloud, or air-gapped</li>
                </ul>
              </article>
            </div>
            <div className={styles.heroCtas} style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
              <Link href="/partners" className={styles.btnPrimary}>
                See the partnership path
              </Link>
              <a href="mailto:contact@aipass.space?subject=Micro1%20collaboration" className={styles.btnSecondary}>
                Email partnerships
              </a>
            </div>
          </div>
        </section>

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
                  <a href={plan.href} className={plan.popular ? styles.btnPrimary : styles.btnSecondary}>
                    {plan.cta}
                  </a>
                ) : (
                  <Link href={plan.href} className={plan.popular ? styles.btnPrimary : styles.btnSecondary}>
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
          <h2 id="final-cta">Ready to run AI under your rules?</h2>
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
          <p className={styles.footerTag}>Enterprise AI infrastructure. Human expertise, applied.</p>
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
