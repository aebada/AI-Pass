'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ModuleIcon } from '@ai-pass/ui';
import { PremiumNav } from './components/premium/PremiumNav';
import { BrandLogoLink } from './components/BrandLogoLink';
import { FOOTER_COLUMNS } from './lib/site-nav';
import { mailtoContact } from './lib/site-config';
import styles from './page.module.css';
import section from './home-sections.module.css';

const HERO_STATS = [
  { value: '50+', label: 'AI Models' },
  { value: '10+', label: 'Enterprise Apps' },
  { value: '99.9%', label: 'Uptime SLA' },
];

/** Req 2.2.2 — four rows only: core experience, models, governance, billing. */
const COMPARE_ROWS = [
  { feature: 'Core experience', traditional: 'A chat window per vendor', aipass: 'One workspace for every task' },
  { feature: 'Models', traditional: 'Locked to a single provider', aipass: 'Route to any frontier model' },
  { feature: 'Governance', traditional: 'Bolted on after rollout', aipass: 'Policy and audit from day one' },
  { feature: 'Billing', traditional: 'A subscription per tool', aipass: 'One wallet, pooled credits' },
];

const EXAMPLE_PROMPT = 'Analyze last month’s invoice batch and flag anything that needs review.';

const CHAT_RESPONSES: Record<string, string> = {
  GPT: 'GPT-5 analysis: Invoice batch processed — 847 documents validated, 3 flagged for review. Estimated savings: $12,400/month.',
  Claude: 'Claude assessment: Strong pattern match on vendor invoices. Recommend auto-approval threshold at 95% confidence for recurring suppliers.',
  Gemini: 'Gemini insight: Cross-referenced ERP data — 2 duplicate submissions detected. Workflow routed to finance approval queue.',
  DeepSeek: 'DeepSeek report: Processing complete. OCR accuracy 99.2%. Three-way match validated against PO and receipt records.',
};

/** Req 2.4.1 — five guided steps, one sentence each, no bullet lists. */
const WALKTHROUGH = [
  {
    id: 'workspace',
    name: 'Workspace',
    icon: 'layout-grid',
    copy: 'Every model, agent, and business app opens in one command center, so work stops scattering across tabs.',
    href: '/workspace',
    visual: ['Knowledge Pipeline', 'Analysis Studio', 'LiveSync'],
  },
  {
    id: 'models',
    name: 'Models',
    icon: 'sparkles',
    copy: 'Send the same request to any provider and compare answers side by side before you commit.',
    href: '/workspace/providers',
    visual: ['OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'Mistral', 'Meta'],
  },
  {
    id: 'agents',
    name: 'Agents',
    icon: 'bot',
    copy: 'Give an agent a goal and the tools to reach it, then watch each step it takes.',
    href: '/workspace/agents',
    visual: ['Assign goal', 'Select tools', 'Run', 'Review trace'],
  },
  {
    id: 'workflows',
    name: 'Workflows',
    icon: 'git-branch',
    copy: 'Chain those agents into repeatable business processes that run without anyone watching.',
    href: '/workspace/workflows',
    visual: ['Extract', 'Validate', 'Match', 'Route'],
  },
  {
    id: 'governance',
    name: 'Governance',
    icon: 'shield-check',
    copy: 'Every request carries a policy check and an audit record, so approvals survive review.',
    href: '/workspace/governance',
    visual: ['Policy check', 'Approval queue', 'Audit trail'],
  },
];

/** Req 2.5.1 — four industries on the homepage; the rest live on /solutions. */
const INDUSTRIES = [
  {
    name: 'Finance',
    icon: 'receipt',
    capability: 'Three-way match against PO and receipt records, with EU VAT, ZATCA, and FTA validation built in.',
    href: '/discover/categories/finance',
  },
  {
    name: 'Manufacturing',
    icon: 'package',
    capability: 'Supplier offer scoring across price, lead time, and risk, wired into existing ERP connectors.',
    href: '/discover/categories/manufacturing',
  },
  {
    name: 'Healthcare',
    icon: 'shield',
    capability: 'Document workflows that keep an auditable trail for every record a model touches.',
    href: '/discover/categories/healthcare',
  },
  {
    name: 'Government',
    icon: 'landmark',
    capability: 'Private-cloud routing and per-department policy controls, with no data leaving your tenancy.',
    href: '/solutions',
  },
];

/** Req 2.6.1 — single-row certification strip. */
const COMPLIANCE_FRAMEWORKS = [
  { label: 'ISO 27001', sub: 'Information Security' },
  { label: 'SOC 2', sub: 'Type II Ready' },
  { label: 'GDPR', sub: 'Data Protection' },
  { label: 'NIS2', sub: 'Network Security' },
  { label: 'ISO 42001', sub: 'AI Management' },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'For anyone evaluating the platform',
    features: ['50 requests/day', 'Free & open models', 'Limited Playground', 'Browse Marketplace'],
    cta: 'Start Free',
    href: '/workspace',
    highlight: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/mo',
    desc: 'For teams putting AI into daily work',
    features: ['GPT-5, Claude, Gemini', 'Agent Studio & Workflows', '5,000 monthly credits', 'Analysis Studio'],
    cta: 'View membership',
    href: '/workspace/membership',
    highlight: true,
  },
  {
    name: 'Power',
    price: '$149',
    period: '/mo',
    desc: 'For operators running many agents at once',
    features: ['All frontier models', 'Multi-agent & automations', 'LiveSync Engine', '25,000 credits'],
    cta: 'Upgrade to Power',
    href: '/workspace/membership',
    highlight: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For regulated organizations with review boards',
    features: ['Unlimited connections', 'BYOK hybrid', 'Compliance & SLA', 'Dedicated support'],
    cta: 'Book Enterprise Demo',
    href: mailtoContact('Enterprise Demo'),
    highlight: false,
  },
];

const API_SNIPPET = `curl https://api.ai-pass.com/v1/chat \\
  -H "Authorization: Bearer $AIPASS_KEY" \\
  -d '{"model":"claude-opus-5","input":"Summarize Q3 invoices"}'`;

function PlaygroundDemoSection() {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPT);
  const [input, setInput] = useState('');
  const [used, setUsed] = useState(false);

  const send = () => {
    if (!input.trim() || used) return;
    setPrompt(input.trim());
    setInput('');
    setUsed(true);
  };

  return (
    <div className={section.chatDemo}>
      <div className={section.chatBody}>
        <div className={`${section.chatBubble} ${section.chatPrompt}`}>
          <span className={section.chatPromptLabel}>Prompt</span>
          <span>{prompt}</span>
        </div>
        <div className={section.chatCompareGrid}>
          {Object.entries(CHAT_RESPONSES).map(([model, text]) => (
            <div key={model} className={section.chatCompareCard}>
              <span className={section.chatCompareModel}>{model}</span>
              <p className={section.chatCompareText}>{text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={section.chatInputRow}>
        <input
          className={section.demoInput}
          placeholder="Ask about invoice analysis…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={used}
        />
        <button type="button" className={section.demoRunBtn} onClick={send} disabled={used}>
          Send
        </button>
      </div>
      {used && (
        <p className={section.chatLimit}>
          Free demo limit reached.{' '}
          <Link href="/workspace" style={{ color: 'var(--accent)' }}>Sign up free</Link> for unlimited access.
        </p>
      )}
    </div>
  );
}

function PlatformWalkthrough() {
  const [active, setActive] = useState(WALKTHROUGH[0].id);
  const step = WALKTHROUGH.find((s) => s.id === active) ?? WALKTHROUGH[0];

  return (
    <div className={section.walkthrough}>
      <div className={section.walkthroughTabs} role="tablist" aria-label="Platform walkthrough">
        {WALKTHROUGH.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            id={`walk-tab-${s.id}`}
            aria-selected={s.id === active}
            aria-controls={`walk-panel-${s.id}`}
            className={`${section.walkthroughTab} ${s.id === active ? section.walkthroughTabActive : ''}`}
            onClick={() => setActive(s.id)}
          >
            <span className={section.walkthroughTabNum}>{i + 1}</span>
            <ModuleIcon name={s.icon} size={18} />
            <span className={section.walkthroughTabName}>{s.name}</span>
          </button>
        ))}
      </div>
      <div
        className={section.walkthroughPanel}
        role="tabpanel"
        id={`walk-panel-${step.id}`}
        aria-labelledby={`walk-tab-${step.id}`}
      >
        <p className={section.walkthroughCopy}>{step.copy}</p>
        <div className={section.walkthroughVisual} aria-hidden="true">
          {step.visual.map((v) => (
            <span key={v} className={section.walkthroughChip}>{v}</span>
          ))}
        </div>
        <Link href={step.href} className={section.walkthroughLink}>
          Explore {step.name} →
        </Link>
      </div>
    </div>
  );
}

export default function HomePageContent() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      {/* 1 — Hero */}
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            Enterprise AI Operating System
          </div>
          <h1 id="hero-heading" className={styles.heroTitle}>
            One workspace for{' '}
            <span className={styles.heroTitleAccent}>every AI model</span>
          </h1>
          <p className={section.heroSubhead}>
            Built for enterprise teams that need every frontier model, agent, and business app under one
            set of controls.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/workspace" className={`${styles.btnPrimary} ${styles.btnLarge}`}>
              Start Free
            </Link>
            <a
              href={mailtoContact('Enterprise Demo')}
              className={`${styles.btnSecondary} ${styles.btnLarge}`}
            >
              Book Demo
            </a>
          </div>
        </div>
        {/* Req 2.1.5 — thin stat bar, demoted below the headline block. */}
        <div className={section.heroStatBar} aria-label="Platform highlights">
          {HERO_STATS.map((stat) => (
            <div key={stat.label} className={section.heroStatBarItem}>
              <span className={section.heroStatBarValue}>{stat.value}</span>
              <span className={section.heroStatBarLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 2 — Problem / solution */}
      <section className={`${section.section} ${section.sectionAlt}`} id="why" aria-labelledby="why-heading">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>The shift</span>
          <h2 id="why-heading" className={section.sectionTitle}>
            Stop assembling AI from scattered parts
          </h2>
          <p className={section.sectionDesc}>
            Most teams reach for a separate tool per task and inherit a separate bill, login, and blind
            spot with each one.
          </p>
        </div>
        <div className={styles.compareWrap}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Capability</th>
                <th>Scattered tools</th>
                <th>AI-Pass</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.traditional}</td>
                  <td className={styles.compareHighlight}>{row.aipass}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3 — Product in action */}
      <section className={section.section} id="try" aria-labelledby="try-heading">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Try it</span>
          <h2 id="try-heading" className={section.sectionTitle}>Compare models instantly</h2>
          <p className={section.sectionDesc}>
            One prompt, four answers, side by side. No signup to look.
          </p>
        </div>
        <PlaygroundDemoSection />
        <div className={section.centerCta}>
          <Link href="/workspace/playground" className={styles.btnPrimary}>Get unlimited access →</Link>
        </div>
      </section>

      {/* 4 — Platform walkthrough */}
      <section
        className={`${section.section} ${section.sectionAlt}`}
        id="platform"
        aria-labelledby="platform-heading"
      >
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>How it works</span>
          <h2 id="platform-heading" className={section.sectionTitle}>Five steps from prompt to production</h2>
        </div>
        <PlatformWalkthrough />
      </section>

      {/* 5 — Solutions by industry */}
      <section className={section.section} id="solutions" aria-labelledby="solutions-heading">
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Industries</span>
          <h2 id="solutions-heading" className={section.sectionTitle}>Configured for regulated work</h2>
        </div>
        <div className={section.industryGrid}>
          {INDUSTRIES.map((ind) => (
            <Link key={ind.name} href={ind.href} className={section.industryCard}>
              <span className={section.industryIcon} aria-hidden="true">
                <ModuleIcon name={ind.icon} size={22} />
              </span>
              <h3 className={section.industryName}>{ind.name}</h3>
              <p className={section.industryCapability}>{ind.capability}</p>
            </Link>
          ))}
        </div>
        <div className={section.centerCta}>
          <Link href="/solutions" className={styles.btnSecondary}>View all industries →</Link>
        </div>
      </section>

      {/* 6 — Enterprise trust */}
      <section
        className={`${section.section} ${section.sectionAlt}`}
        id="enterprise"
        aria-labelledby="enterprise-heading"
      >
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Assurance</span>
          <h2 id="enterprise-heading" className={section.sectionTitle}>Ready for your security review</h2>
        </div>
        <div className={section.complianceStrip}>
          {COMPLIANCE_FRAMEWORKS.map((f) => (
            <div key={f.label} className={section.complianceBadge}>
              <div className={section.complianceBadgeLabel}>{f.label}</div>
              <div className={section.complianceBadgeSub}>{f.sub}</div>
            </div>
          ))}
        </div>
        <p className={section.trustProof}>
          Every model call is checked against your policies and written to an immutable audit trail
          before a response is returned.
        </p>
        <div className={section.centerCta}>
          <Link href="/trust" className={styles.btnSecondary}>Visit the Trust Center →</Link>
        </div>
      </section>

      {/* 7 — Pricing */}
      <section
        className={`${section.section} ${section.pricingSection}`}
        id="pricing"
        aria-labelledby="pricing-heading"
      >
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Plans</span>
          <h2 id="pricing-heading" className={section.sectionTitle}>One membership covers all of it</h2>
        </div>
        <div className={styles.pricingGrid}>
          {PRICING.map((plan) => (
            <div key={plan.name} className={`${styles.pricingCard} ${plan.highlight ? styles.pricingFeatured : ''}`}>
              {plan.highlight && <span className={styles.pricingBadge}>Most popular</span>}
              <h3 className={styles.pricingName}>{plan.name}</h3>
              <div className={styles.pricingPrice}>
                <span className={styles.pricingAmount}>{plan.price}</span>
                <span className={styles.pricingPeriod}>{plan.period}</span>
              </div>
              <p className={styles.pricingDesc}>{plan.desc}</p>
              <ul className={styles.pricingFeatures}>
                {plan.features.map((f) => (
                  <li key={f}><ModuleIcon name="check" size={16} /> {f}</li>
                ))}
              </ul>
              {plan.href.startsWith('mailto:') ? (
                <a href={plan.href} className={plan.highlight ? styles.btnPrimary : styles.btnSecondary}>{plan.cta}</a>
              ) : (
                <Link href={plan.href} className={plan.highlight ? styles.btnPrimary : styles.btnSecondary}>{plan.cta}</Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8 — Developer strip */}
      <section
        className={`${section.section} ${section.sectionAlt}`}
        id="developers"
        aria-labelledby="developers-heading"
      >
        <div className={section.devStrip}>
          <div className={section.devStripText}>
            <span className={section.sectionLabel}>Developers</span>
            <h2 id="developers-heading" className={section.sectionTitle}>Reach every model through one API</h2>
            <div className={section.devStripLinks}>
              <a href="https://docs.ai-pass.com" className={styles.btnSecondary} target="_blank" rel="noopener noreferrer">
                Read the docs →
              </a>
              <Link href="/api/docs" className={section.walkthroughLink}>API reference →</Link>
            </div>
          </div>
          <pre className={section.devCode}><code>{API_SNIPPET}</code></pre>
        </div>
      </section>

      {/* 9 — Final CTA, followed directly by the footer (req 2.9.2) */}
      <section className={styles.ctaBand} aria-labelledby="cta-heading">
        <h2 id="cta-heading" className={styles.ctaBandTitle}>One workspace for every AI model</h2>
        <p className={styles.ctaBandText}>
          Start free today, or walk through an enterprise rollout with us.
        </p>
        <div className={styles.ctaBandActions}>
          <Link href="/workspace" className={styles.btnPrimary}>Start Free</Link>
          <a href={mailtoContact('Enterprise Demo')} className={styles.btnSecondary}>
            Book Demo
          </a>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={section.footerGridWide}>
          <div>
            <BrandLogoLink className={styles.logo} logoClassName={styles.logoImg} />
            <p className={styles.footerBrand}>The Enterprise AI Operating System.</p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <div className={styles.footerColTitle}>{col.title}</div>
              {col.links.map((link) =>
                link.external ? (
                  <a key={link.href + link.label} href={link.href} className={styles.footerLink} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href + link.label} href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          ))}
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 AI-Pass. All rights reserved.</span>
          <Link href="/about" className={styles.footerLink}>About</Link>
          <Link href="/investors" className={styles.footerLink}>Investors</Link>
        </div>
      </footer>
    </div>
  );
}
