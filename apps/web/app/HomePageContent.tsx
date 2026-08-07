'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import {
  IconAgents,
  IconArrowRight,
  IconCheck,
  IconClose,
  IconGauge,
  IconGovernance,
  IconLandmark,
  IconModels,
  IconServer,
  IconShieldLock,
  IconTrendDown,
  IconWorkspace,
  IconWorkflows,
} from './components/icons/Icons';
import { API_DOCS_HREF, DOCS_URL, FOOTER_COLUMNS } from './lib/site-nav';
import styles from './page.module.css';
import section from './home-sections.module.css';

const HERO_STATS = [
  { value: 'On-prem', label: 'ready' },
  { value: 'Built-in', label: 'AI compliance' },
  { value: 'Any', label: 'industry' },
];

const COMPARISON_ROWS = [
  {
    label: 'Productivity',
    before: 'Teams bounce between chats, portals, and shadow tools',
    after: 'One infrastructure layer that raises throughput',
  },
  {
    label: 'Cost',
    before: 'Duplicate vendor seats and unmanaged model spend',
    after: 'Shared routing, wallet, and usage visibility',
  },
  {
    label: 'Compliance',
    before: 'Policies bolted on after tools are already live',
    after: 'AI compliance enforced inside the platform',
  },
  {
    label: 'Deployment',
    before: 'Public-cloud-only stacks that block sovereign work',
    after: 'Cloud or on-premises inside your boundary',
  },
];

const DEMO_PROMPT =
  'Draft a productivity brief: where multi-model routing cuts cycle time and operating cost without adding another AI silo.';

const DEMO_RESPONSES = [
  {
    model: 'GPT',
    text: 'Consolidate vendor seats into one membership, route each job to the cheapest capable model, and keep approvals in one audit trail so rework drops.',
  },
  {
    model: 'Claude',
    text: 'Treat AI-Pass as an internal productivity department: standard prompts, shared agents, and cost caps replace ad-hoc tooling across teams.',
  },
  {
    model: 'Gemini',
    text: 'Move high-volume tasks to efficient models, reserve frontier models for hard cases, and report spend and throughput from one wallet.',
  },
];

const PLATFORM_STEPS = [
  {
    id: 'workspace',
    label: 'Workspace',
    copy: 'The operating surface for every team — an infrastructure layer that boosts productivity without inventing a new tool stack.',
    icon: IconWorkspace,
  },
  {
    id: 'models',
    label: 'Models',
    copy: 'Route each job to the right model so quality stays high while token and seat costs fall.',
    icon: IconModels,
  },
  {
    id: 'agents',
    label: 'Agents',
    copy: 'Automate repeatable work so people spend time on decisions, not copy-paste across portals.',
    icon: IconAgents,
  },
  {
    id: 'workflows',
    label: 'Workflows',
    copy: 'Connect AI steps to business processes with the same identity, spend, and approval controls.',
    icon: IconWorkflows,
  },
  {
    id: 'compliance',
    label: 'Compliance',
    copy: 'AI compliance is not an add-on — policies, evidence, and audit trails run inside the infrastructure.',
    icon: IconGovernance,
  },
];

const OUTCOME_PILLARS = [
  {
    name: 'Productivity lift',
    copy: 'Give every department a shared AI surface so work moves faster without training people on a dozen tools.',
    icon: IconGauge,
  },
  {
    name: 'Cost reduction',
    copy: 'Cut duplicate subscriptions and unmanaged model spend with one membership, wallet, and routing policy.',
    icon: IconTrendDown,
  },
  {
    name: 'Industry-agnostic',
    copy: 'The same platform serves commercial, industrial, and public missions — outcomes first, not a vertical lock-in.',
    icon: IconWorkspace,
  },
];

const MISSION_PILLARS = [
  {
    name: 'Defence & Government',
    copy: 'Purpose-built for sovereign and public-sector missions that need governed AI access, clear accountability, and mission-safe operations.',
    icon: IconLandmark,
  },
  {
    name: 'On-premises structures',
    copy: 'Deploy AI-Pass inside your own infrastructure boundary — air-gapped or private network options for Defence and Government environments.',
    icon: IconServer,
  },
  {
    name: 'Integrated AI compliance',
    copy: 'Compliance controls ship in the platform layer: policy gates, audit evidence, and certification workflows on every request path.',
    icon: IconShieldLock,
  },
];

const COMPLIANCE = ['ISO 27001', 'SOC 2 Type II', 'GDPR', 'NIS2', 'ISO 42001'];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    who: 'Individuals testing multi-model productivity',
    features: ['Limited daily requests', 'Core playground access', 'Community support', 'Public apps catalog'],
    cta: 'Start Free',
    href: '/login',
    popular: false,
  },
  {
    name: 'Professional',
    price: '$49',
    who: 'Teams cutting tool sprawl and model spend',
    features: ['Higher request limits', 'Priority model access', 'AI Wallet credits', 'Email support'],
    cta: 'Choose Professional',
    href: '/workspace/membership',
    popular: true,
  },
  {
    name: 'Power',
    price: '$149',
    who: 'Operators running agents and automation at scale',
    features: ['Team workspaces', 'Agent Studio', 'Workflow automation', 'Priority support'],
    cta: 'Choose Power',
    href: '/workspace/membership',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    who: 'Defence, Government, and on-prem deployments',
    features: ['On-premises / private cloud', 'SSO / SAML', 'Integrated AI compliance packs', 'Dedicated success'],
    cta: 'Talk to Sales',
    href: 'mailto:hello@ai-pass.com?subject=Defence%20Government%20On-Prem%20Demo',
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
              AI infrastructure that cuts cost
            </h1>
            <p className={styles.heroSub}>
              The productivity layer for any organization — with Defence and Government on-premises support and AI compliance built into the stack.
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
                <span>Infrastructure layer</span>
                <span className={styles.productChromeMeta}>Productivity · Cost · Compliance</span>
              </div>
              <div className={styles.routeRail}>
                {['GPT', 'Claude', 'Gemini', 'DeepSeek', 'Mistral'].map((m, i) => (
                  <span key={m} className={styles.routeNode} style={{ animationDelay: `${i * 0.35}s` }}>
                    {m}
                  </span>
                ))}
              </div>
              <div className={styles.productPrompt}>Route work. Cut spend. Keep policy on. →</div>
              <div className={styles.productResponses}>
                <div className={styles.productPane}>
                  <strong>Cloud</strong>
                  <p>Shared membership and wallet for commercial teams.</p>
                </div>
                <div className={styles.productPane}>
                  <strong>On-prem</strong>
                  <p>Defence & Government deployments inside your boundary.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.statStrip} aria-label="Platform posture">
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
            From tool sprawl to an infrastructure department
          </h2>
          <p className={section.sectionDesc}>
            AI-Pass acts like an internal productivity and cost-control function: one governed surface for models, agents, and apps across every sector.
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
            Five layers of productive AI infrastructure
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

      {/* 5 — Industry-agnostic outcomes */}
      <section className={section.section} id="outcomes" aria-labelledby="outcomes-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Outcomes</p>
          <h2 id="outcomes-heading" className={section.sectionTitle}>
            Productivity and savings for every organization
          </h2>
          <p className={section.sectionDesc}>
            AI-Pass is industry-agnostic by design. The same infrastructure boosts output and reduces cost whether you run commercial operations or public missions.
          </p>
        </div>
        <div className={section.industryGrid}>
          {OUTCOME_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className={section.industryCard}>
                <span className={section.industryIcon}>
                  <Icon size={20} />
                </span>
                <h3>{item.name}</h3>
                <p>{item.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6 — Defence, Government, on-prem */}
      <section className={`${section.section} ${section.sectionAlt}`} id="defence-gov" aria-labelledby="defence-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>Defence & Government</p>
          <h2 id="defence-heading" className={section.sectionTitle}>
            Built for Defence, Government, and on-premises
          </h2>
          <p className={section.sectionDesc}>
            Sovereign and public-sector teams get the same productivity platform — deployed on-premises or in private infrastructure, with compliance controls already in the path.
          </p>
        </div>
        <div className={section.industryGrid}>
          {MISSION_PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.name} className={section.industryCard}>
                <span className={section.industryIcon}>
                  <Icon size={20} />
                </span>
                <h3>{item.name}</h3>
                <p>{item.copy}</p>
              </div>
            );
          })}
        </div>
        <div className={section.centerCta}>
          <a
            href="mailto:hello@ai-pass.com?subject=Defence%20Government%20On-Prem%20Briefing"
            className={styles.linkAccent}
          >
            Request a Defence & Government briefing <IconArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* 7 — AI compliance in infrastructure */}
      <section className={section.section} id="trust" aria-labelledby="trust-heading">
        <div className={section.containerNarrow}>
          <p className={section.sectionLabel}>AI compliance</p>
          <h2 id="trust-heading" className={section.sectionTitle}>
            AI compliance integrated into the infrastructure
          </h2>
          <p className={section.sectionDesc}>
            Policy gates, evidence capture, and certification are not a side product. They run as part of the same stack that routes models and executes work.
          </p>
          <div className={section.badgeRow} aria-label="Compliance frameworks">
            {COMPLIANCE.map((name) => (
              <span key={name} className={section.complianceBadge}>
                {name}
              </span>
            ))}
          </div>
          <p className={section.proofLine}>
            Every enterprise and on-prem path can enforce approvals, retain exportable audit trails, and verify systems through Trust Center without bolting on a separate compliance tool.
          </p>
          <div className={section.centerCta}>
            <Link href="/workspace/trust" className={styles.linkAccent}>
              Open Trust Center <IconArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8 — Pricing */}
      <section className={`${section.section} ${section.sectionAlt}`} id="pricing" aria-labelledby="pricing-heading">
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

      {/* 9 — Final CTA */}
      <section className={styles.finalCta} aria-labelledby="final-cta-heading">
        <h2 id="final-cta-heading" className={styles.finalCtaTitle}>
          AI infrastructure that cuts cost
        </h2>
        <p className={styles.finalCtaSub}>
          Start free for teams, or book a demo for Defence, Government, and on-premises deployments.
        </p>
        <div className={styles.heroCtas}>
          <Link href="/login" className={`${styles.btnPrimary} ${styles.btnLarge}`}>
            Start Free
          </Link>
          <a
            href="mailto:hello@ai-pass.com?subject=Defence%20Government%20On-Prem%20Demo"
            className={`${styles.btnSecondary} ${styles.btnLarge}`}
          >
            Book Demo
          </a>
        </div>
        <p className={styles.finalCtaNote}>
          Developers: see{' '}
          <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            docs.ai-pass.com
          </a>{' '}
          and the{' '}
          <Link href={API_DOCS_HREF}>API reference</Link>.
        </p>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <BrandLogoLink className={styles.logo} logoClassName={styles.logoImg} />
          <p className={styles.footerTag}>
            Industry-agnostic AI infrastructure for productivity, cost control, and compliance — including Defence and Government on-premises.
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
