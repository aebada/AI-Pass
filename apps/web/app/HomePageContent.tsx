'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import {
  IconAgents,
  IconArrowRight,
  IconBuilding,
  IconCheck,
  IconClose,
  IconFactory,
  IconGovernance,
  IconHeartPulse,
  IconLandmark,
  IconModels,
  IconWorkspace,
  IconWorkflows,
} from './components/icons/Icons';
import { API_DOCS_HREF, DOCS_URL, FOOTER_COLUMNS } from './lib/site-nav';
import styles from './page.module.css';
import section from './home-sections.module.css';

const HERO_STATS = [
  { value: '50+', label: 'Models' },
  { value: '10+', label: 'Apps' },
  { value: '99.9%', label: 'Uptime' },
];

const COMPARISON_ROWS = [
  {
    label: 'Core experience',
    before: 'Separate chats, IDEs, and app portals',
    after: 'One workspace for every team workflow',
  },
  {
    label: 'Models',
    before: 'Vendor accounts and locked quotas',
    after: 'Route across providers with one membership',
  },
  {
    label: 'Governance',
    before: 'Shadow AI and after-the-fact reviews',
    after: 'Policies, approvals, and audit trails built in',
  },
  {
    label: 'Billing',
    before: 'Scattered invoices per tool',
    after: 'Shared wallet and usage visibility',
  },
];

const DEMO_PROMPT =
  'Summarize the three risks in this vendor contract and suggest mitigation language.';

const DEMO_RESPONSES = [
  {
    model: 'GPT',
    text: 'Risks: unlimited liability, vague IP assignment, and missing breach notice windows. Suggest capping liability, clarifying work-product ownership, and a 72-hour notice clause.',
  },
  {
    model: 'Claude',
    text: 'Primary exposures are indemnity scope, data-processing ambiguity, and termination for convenience. Recommend mutual caps, a DPA addendum, and 30-day wind-down terms.',
  },
  {
    model: 'Gemini',
    text: 'Watch for audit rights asymmetry, subcontracting without consent, and silent renewal. Add reciprocal audit language, approval gates, and opt-out before auto-renewal.',
  },
];

const PLATFORM_STEPS = [
  {
    id: 'workspace',
    label: 'Workspace',
    copy: 'One command center where teams launch models, apps, and agents without switching tools.',
    icon: IconWorkspace,
  },
  {
    id: 'models',
    label: 'Models',
    copy: 'Compare frontier providers side by side and route each job to the model that fits.',
    icon: IconModels,
  },
  {
    id: 'agents',
    label: 'Agents',
    copy: 'Design autonomous agents that call skills, apps, and human approvals when needed.',
    icon: IconAgents,
  },
  {
    id: 'workflows',
    label: 'Workflows',
    copy: 'Connect business processes so AI steps run with the same controls as other systems.',
    icon: IconWorkflows,
  },
  {
    id: 'governance',
    label: 'Governance',
    copy: 'Enforce policy, certify systems, and keep an auditable trail across every action.',
    icon: IconGovernance,
  },
];

const INDUSTRIES = [
  {
    name: 'Finance',
    href: '/discover/categories/finance',
    proof: '73% reduction in AP processing time — Q2 2026 Invoice AI pilot',
    icon: IconBuilding,
  },
  {
    name: 'Manufacturing',
    href: '/discover/categories/manufacturing',
    proof: 'Supplier proposal review cut from days to minutes — Supply Chain AI pilot',
    icon: IconFactory,
  },
  {
    name: 'Healthcare',
    href: '/discover/categories/healthcare',
    proof: 'Document workflows shipped with full audit trails in Compliance AI pilots',
    icon: IconHeartPulse,
  },
  {
    name: 'Government',
    href: '/discover/categories',
    proof: 'Department-wide model access without shadow IT — governed workspace pilots',
    icon: IconLandmark,
  },
];

const COMPLIANCE = ['ISO 27001', 'SOC 2 Type II', 'GDPR', 'NIS2', 'ISO 42001'];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    who: 'Individuals exploring multi-model chat',
    features: ['Limited daily requests', 'Core playground access', 'Community support', 'Public apps catalog'],
    cta: 'Start Free',
    href: '/login',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    who: 'Operators who need reliable daily routing',
    features: ['Higher request limits', 'Priority model access', 'AI Wallet credits', 'Email support'],
    cta: 'Choose Professional',
    href: '/workspace/membership',
    popular: true,
  },
  {
    name: 'Power',
    price: '$149',
    who: 'Teams running agents and production apps',
    features: ['Team workspaces', 'Agent Studio', 'Workflow automation', 'Priority support'],
    cta: 'Choose Power',
    href: '/workspace/membership',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    who: 'Organizations that need SSO, SLA, and controls',
    features: ['SSO / SAML', 'Private deployment options', 'Custom governance packs', 'Dedicated success'],
    cta: 'Talk to Sales',
    href: 'mailto:hello@ai-pass.com?subject=Enterprise%20Demo',
    popular: false,
  },
];

export default function HomePageContent() {
  const [platformStep, setPlatformStep] = useState(PLATFORM_STEPS[0].id);
  const activeStep = PLATFORM_STEPS.find((s) => s.id === platformStep) ?? PLATFORM_STEPS[0];
  const ActiveIcon = activeStep.icon;

  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      {/* 1 — Hero */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.brandMark}>AI-Pass</p>
            <h1 id="hero-heading" className={styles.heroTitle}>
              One workspace for every AI model
            </h1>
            <p className={styles.heroSub}>
              For enterprise teams that need models, agents, and apps under one membership and shared controls.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/login" className={`${styles.btnPrimary} ${styles.btnLarge}`}>
                Start Free
              </Link>
              <a
                href="mailto:hello@ai-pass.com?subject=Enterprise%20Demo"
                className={`${styles.btnSecondary} ${styles.btnLarge}`}
              >
                Book Demo
              </a>
            </div>
          </div>
          <div className={styles.heroVisual} aria-hidden>
            <div className={styles.productFrame}>
              <div className={styles.productChrome}>
                <span>Playground</span>
                <span className={styles.productChromeMeta}>Route · Compare · Ship</span>
              </div>
              <div className={styles.routeRail}>
                {['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Mistral'].map((m, i) => (
                  <span key={m} className={styles.routeNode} style={{ animationDelay: `${i * 0.35}s` }}>
                    {m}
                  </span>
                ))}
              </div>
              <div className={styles.productPrompt}>Summarize vendor risks →</div>
              <div className={styles.productResponses}>
                <div className={styles.productPane}>
                  <strong>GPT</strong>
                  <p>Caps liability, clarifies IP, adds 72h breach notice.</p>
                </div>
                <div className={styles.productPane}>
                  <strong>Claude</strong>
                  <p>Mutual indemnity, DPA addendum, 30-day wind-down.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.statStrip} aria-label="Platform scale">
        {HERO_STATS.map((stat) => (
          <div key={stat.label} className={styles.statItem}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* 2 — Problem / solution */}
      <section className={`${section.section} ${section.sectionAlt}`} aria-labelledby="framing-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>The shift</p>
          <h2 id="framing-heading" className={section.sectionTitle}>
            Fragmented tools become one operating surface
          </h2>
          <p className={section.sectionDesc}>
            Stop stitching chat tabs, vendor portals, and spreadsheets. Move work onto a single surface with shared identity, policy, and spend.
          </p>
          <div className={section.compareTable} role="table" aria-label="Before and after AI-Pass">
            <div className={section.compareHead} role="row">
              <span role="columnheader">Capability</span>
              <span role="columnheader">Before</span>
              <span role="columnheader">With AI-Pass</span>
            </div>
            {COMPARISON_ROWS.map((row) => (
              <div key={row.label} className={section.compareRow} role="row">
                <span className={section.compareLabel} role="cell">
                  {row.label}
                </span>
                <span className={section.compareBefore} role="cell">
                  <IconClose size={16} /> {row.before}
                </span>
                <span className={section.compareAfter} role="cell">
                  <IconCheck size={16} /> {row.after}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Product in action */}
      <section className={section.section} id="demo" aria-labelledby="demo-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>See it work</p>
          <h2 id="demo-heading" className={section.sectionTitle}>
            Compare models on the same prompt
          </h2>
          <p className={section.sectionDesc}>
            A live-style comparison loads with an example already answered — so you see multi-model routing before you type.
          </p>
        </div>
        <div className={section.demoWidget}>
          <div className={section.demoPrompt}>
            <span className={section.demoPromptLabel}>Example prompt</span>
            <p>{DEMO_PROMPT}</p>
          </div>
          <div className={section.demoGrid}>
            {DEMO_RESPONSES.map((item) => (
              <article key={item.model} className={section.demoCard}>
                <header>{item.model}</header>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className={section.demoFooter}>
            <Link href="/workspace/playground" className={styles.linkAccent}>
              Get unlimited access <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 — Platform walkthrough */}
      <section className={`${section.section} ${section.sectionAlt}`} id="platform" aria-labelledby="platform-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Platform</p>
          <h2 id="platform-heading" className={section.sectionTitle}>
            Five steps from request to control
          </h2>
        </div>
        <div className={section.platformWalk}>
          <div className={section.platformTabs} role="tablist" aria-label="Platform steps">
            {PLATFORM_STEPS.map((step) => {
              const Icon = step.icon;
              const selected = step.id === platformStep;
              return (
                <button
                  key={step.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={`${section.platformTab} ${selected ? section.platformTabActive : ''}`}
                  onClick={() => setPlatformStep(step.id)}
                >
                  <Icon size={18} />
                  {step.label}
                </button>
              );
            })}
          </div>
          <div className={section.platformPanel} role="tabpanel">
            <div className={section.platformPanelIcon}>
              <ActiveIcon size={28} />
            </div>
            <p>{activeStep.copy}</p>
          </div>
        </div>
        <div className={section.centerCta}>
          <Link href="/workspace/store" className={styles.linkAccent}>
            Browse AI Store <IconArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 5 — Solutions by industry */}
      <section className={section.section} id="solutions" aria-labelledby="solutions-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Solutions</p>
          <h2 id="solutions-heading" className={section.sectionTitle}>
            Proven outcomes by industry
          </h2>
        </div>
        <div className={section.industryGrid}>
          {INDUSTRIES.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className={section.industryCard}>
                <span className={section.industryIcon}>
                  <Icon size={20} />
                </span>
                <h3>{item.name}</h3>
                <p>{item.proof}</p>
              </Link>
            );
          })}
        </div>
        <div className={section.centerCta}>
          <Link href="/discover/categories" className={styles.linkAccent}>
            View all industries <IconArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* 6 — Enterprise trust */}
      <section className={`${section.section} ${section.sectionAlt}`} id="trust" aria-labelledby="trust-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Enterprise trust</p>
          <h2 id="trust-heading" className={section.sectionTitle}>
            Controls that stand up to audit
          </h2>
          <p className={section.sectionDesc}>
            Framework-ready posture for security and AI management — with verification and certification in Trust Center.
          </p>
          <div className={section.badgeRow} aria-label="Compliance frameworks">
            {COMPLIANCE.map((name) => (
              <span key={name} className={section.complianceBadge}>
                {name}
              </span>
            ))}
          </div>
          <p className={section.proofLine}>
            100% of Q2 2026 enterprise pilots ran with policy gates and exportable audit trails enabled by default.
          </p>
          <div className={section.centerCta}>
            <Link href="/workspace/trust" className={styles.linkAccent}>
              Open Trust Center <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7 — Pricing */}
      <section className={section.section} id="pricing" aria-labelledby="pricing-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Pricing</p>
          <h2 id="pricing-heading" className={section.sectionTitle}>
            Membership that scales with how you work
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

      {/* 8 — Developer strip */}
      <section className={`${section.section} ${section.sectionAlt}`} id="developers" aria-labelledby="dev-heading">
        <div className={section.devStrip}>
          <div>
            <p className={section.sectionLabel}>Developers</p>
            <h2 id="dev-heading" className={section.sectionTitle}>
              Ship on the same platform your operators use
            </h2>
            <p className={section.sectionDesc}>
              Publish apps, call the API, and share revenue without maintaining a separate AI stack.
            </p>
            <div className={section.devLinks}>
              <a href={DOCS_URL} className={styles.linkAccent} target="_blank" rel="noopener noreferrer">
                Read the docs <IconArrowRight size={16} />
              </a>
              <Link href={API_DOCS_HREF} className={styles.linkAccent}>
                API reference <IconArrowRight size={16} />
              </Link>
            </div>
          </div>
          <pre className={section.codeBlock} tabIndex={0}>
            <code>{`curl https://api.ai-pass.com/v1/chat \\
  -H "Authorization: Bearer $KEY" \\
  -d '{"model":"claude","prompt":"..."}'`}</code>
          </pre>
        </div>
      </section>

      {/* 9 — Final CTA */}
      <section className={styles.finalCta} aria-labelledby="final-cta-heading">
        <h2 id="final-cta-heading" className={styles.finalCtaTitle}>
          One workspace for every AI model
        </h2>
        <p className={styles.finalCtaSub}>Start free, or book a demo for your enterprise rollout.</p>
        <div className={styles.heroCtas}>
          <Link href="/login" className={`${styles.btnPrimary} ${styles.btnLarge}`}>
            Start Free
          </Link>
          <a
            href="mailto:hello@ai-pass.com?subject=Enterprise%20Demo"
            className={`${styles.btnSecondary} ${styles.btnLarge}`}
          >
            Book Demo
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <BrandLogoLink className={styles.logo} logoClassName={styles.logoImg} />
          <p className={styles.footerTag}>The enterprise AI operating system.</p>
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
