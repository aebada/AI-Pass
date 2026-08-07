'use client';

import Link from 'next/link';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import { IconArrowRight, IconCheck } from './components/icons/Icons';
import { DEMO_MAILTO, DOCS_URL, FOOTER_COLUMNS } from './lib/site-nav';
import styles from './page.module.css';
import section from './home-sections.module.css';

const SECTORS = [
  { name: 'Government', href: '/government' },
  { name: 'Defence', href: '/defence' },
  { name: 'Manufacturing', href: '/industries/manufacturing' },
  { name: 'Banking', href: '/industries/financial-services' },
  { name: 'Healthcare', href: '/industries/healthcare' },
];

const CAPABILITIES = [
  {
    title: 'Orchestrate',
    copy: 'Route models, agents, and workflows through one execution layer across cloud and on-premises.',
  },
  {
    title: 'Govern',
    copy: 'Permissions, approvals, inventory, and audit sit in the infrastructure — not bolted on later.',
  },
  {
    title: 'Secure',
    copy: 'Private cloud, hybrid, and air-gapped patterns for Government, Defence, and regulated operators.',
  },
  {
    title: 'Comply',
    copy: 'ISO 42001, ISO 27001, GDPR, NIS2, and SOC 2 controls integrated into the platform path.',
  },
];

const DEPLOYMENT = [
  { name: 'Cloud', copy: 'Enterprise AI Cloud with shared wallet and multi-provider routing.' },
  { name: 'Private Cloud', copy: 'Isolated tenancy for regulated workloads and data residency.' },
  { name: 'Hybrid', copy: 'Blend public models with private endpoints under one control plane.' },
  { name: 'Air-Gapped / On-Prem', copy: 'Deploy inside Defence and Government infrastructure boundaries.' },
];

const COMPLIANCE = ['ISO 42001', 'ISO 27001', 'GDPR', 'NIS2', 'SOC 2'];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    who: 'Evaluate the infrastructure layer',
    features: ['Limited daily requests', 'Core workspace access', 'Discovery browsing', 'Community support'],
    cta: 'Start Free',
    href: '/login',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    who: 'Teams running governed AI daily',
    features: ['Multi-model routing', 'Agent Studio basics', 'AI Wallet credits', 'Email support'],
    cta: 'Choose Professional',
    href: '/workspace/membership',
    popular: true,
  },
  {
    name: 'Power',
    price: '$149',
    who: 'Operators scaling agents and automation',
    features: ['Workflow Engine', 'LiveSync', 'Priority models', 'Team workspaces'],
    cta: 'Choose Power',
    href: '/workspace/membership',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    who: 'Government, Defence, and on-prem deployments',
    features: ['Air-gapped / private cloud', 'SSO · SCIM · SAML', 'Trust & Compliance packs', 'Dedicated success'],
    cta: 'Contact Sales',
    href: DEMO_MAILTO,
    popular: false,
  },
];

export default function HomePageContent() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroCenter}>
          <p className={styles.brandMark}>AI-Pass</p>
          <p className={styles.positioningEyebrow}>Enterprise AI Infrastructure Platform</p>
          <h1 id="hero-heading" className={styles.heroTitleWide}>
            Enterprise AI Infrastructure for Secure, Governed and Autonomous Business Operations
          </h1>
          <p className={styles.heroSubWide}>
            Build, orchestrate, govern and deploy enterprise AI securely across cloud and on-premises environments.
          </p>
          <div className={styles.heroCtas}>
            <a href={DEMO_MAILTO} className={`${styles.btnPrimary} ${styles.btnLarge}`}>
              Book Enterprise Demo
            </a>
            <Link href="/login" className={`${styles.btnSecondary} ${styles.btnLarge}`}>
              Start Free
            </Link>
          </div>
        </div>
      </section>

      <div className={styles.sectorStrip} aria-label="Sectors we support">
        {SECTORS.map((sector) => (
          <Link key={sector.name} href={sector.href} className={styles.sectorMark}>
            {sector.name}
          </Link>
        ))}
      </div>

      <section className={`${section.section} ${section.sectionAlt}`} aria-labelledby="infra-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Infrastructure</p>
          <h2 id="infra-heading" className={section.sectionTitle}>
            The AI execution layer for the enterprise
          </h2>
          <p className={section.sectionDesc}>
            AI-Pass is secure AI infrastructure — an orchestration platform that raises productivity while keeping
            Government, Defence, and regulated operations under continuous control.
          </p>
        </div>
        <div className={section.capabilityGrid}>
          {CAPABILITIES.map((item) => (
            <article key={item.title} className={section.capabilityCard}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={section.section} id="deployment" aria-labelledby="deploy-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Deployment</p>
          <h2 id="deploy-heading" className={section.sectionTitle}>
            Cloud, private cloud, hybrid, and air-gapped
          </h2>
          <p className={section.sectionDesc}>
            One control plane across environments — including on-premises structures for Defence and Government.
          </p>
        </div>
        <div className={section.industryGrid}>
          {DEPLOYMENT.map((item) => (
            <div key={item.name} className={section.industryCard}>
              <h3>{item.name}</h3>
              <p>{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${section.section} ${section.sectionAlt}`} id="trust" aria-labelledby="trust-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Enterprise ready</p>
          <h2 id="trust-heading" className={section.sectionTitle}>
            Compliance and trust built into the stack
          </h2>
          <p className={section.sectionDesc}>
            Policies, evidence, certification, and audit trails run inside the infrastructure path — not as a separate
            afterthought.
          </p>
          <div className={section.badgeRow} aria-label="Compliance frameworks">
            {COMPLIANCE.map((name) => (
              <span key={name} className={section.complianceBadge}>
                {name}
              </span>
            ))}
          </div>
          <div className={section.centerCta}>
            <Link href="/compliance" className={styles.linkAccent}>
              Explore compliance <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className={section.section} id="pricing" aria-labelledby="pricing-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Pricing</p>
          <h2 id="pricing-heading" className={section.sectionTitle}>
            Plans for evaluation through sovereign deployment
          </h2>
        </div>
        <div className={section.pricingGrid}>
          {PRICING.map((tier) => (
            <article
              key={tier.name}
              className={`${section.priceCard} ${tier.popular ? section.priceCardPopular : ''}`}
            >
              {tier.popular && <span className={section.popularBadge}>Most popular</span>}
              <h3>{tier.name}</h3>
              <p className={section.priceAmount}>
                {tier.price}
                {tier.price.startsWith('$') && <span>/mo</span>}
              </p>
              <p className={section.priceWho}>{tier.who}</p>
              <ul>
                {tier.features.map((f) => (
                  <li key={f}>
                    <IconCheck size={16} /> {f}
                  </li>
                ))}
              </ul>
              {tier.href.startsWith('mailto:') ? (
                <a href={tier.href} className={tier.popular ? styles.btnPrimary : styles.btnSecondary}>
                  {tier.cta}
                </a>
              ) : (
                <Link href={tier.href} className={tier.popular ? styles.btnPrimary : styles.btnSecondary}>
                  {tier.cta}
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="final-cta-heading">
        <h2 id="final-cta-heading" className={styles.finalCtaTitle}>
          Deploy enterprise AI infrastructure with confidence
        </h2>
        <p className={styles.finalCtaSub}>
          Book a demo for Government, Defence, and enterprise rollout — or start free today.
        </p>
        <div className={styles.heroCtas}>
          <a href={DEMO_MAILTO} className={`${styles.btnPrimary} ${styles.btnLarge}`}>
            Book Enterprise Demo
          </a>
          <Link href="/login" className={`${styles.btnSecondary} ${styles.btnLarge}`}>
            Start Free
          </Link>
        </div>
        <p className={styles.finalCtaNote}>
          Developers: <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">docs</a> ·{' '}
          <Link href="/developers">developer platform</Link> · <Link href="/architecture">architecture</Link>
        </p>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <BrandLogoLink className={styles.logo} logoClassName={styles.logoImg} />
          <p className={styles.footerTag}>
            Enterprise AI Infrastructure Platform — secure, governed, and ready for cloud, hybrid, and air-gapped
            operations.
          </p>
        </div>
        <div className={styles.footerGrid}>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title} className={styles.footerCol}>
              <h3>{col.title}</h3>
              <ul>
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
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
        </div>
      </footer>
    </div>
  );
}
