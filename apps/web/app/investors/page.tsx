import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { BrandLogo } from '../components/BrandLogo';
import styles from '../page.module.css';
import section from '../home-sections.module.css';

const INVESTOR_SECTIONS = [
  {
    title: 'Vision',
    text: 'AI-Pass is building the operating system for enterprise AI — a unified platform where models, agents, workflows, applications, governance, and marketplaces converge under one membership. We believe every enterprise deserves an AI infrastructure layer as robust as their cloud infrastructure — not a collection of disconnected chatbots.',
  },
  {
    title: 'Market Opportunity',
    text: 'The enterprise AI software market exceeds $150B and is growing at 35% CAGR. Fortune 500 companies are deploying AI across finance, HR, supply chain, customer support, and compliance — yet 78% report fragmented tooling and governance gaps. AI-Pass addresses the platform layer that connects all of these use cases.',
  },
  {
    title: 'Why Now',
    text: 'Three forces converge: (1) model proliferation creates vendor complexity, (2) EU AI Act and ISO 42001 mandate governance infrastructure, and (3) board-level AI mandates require enterprise-grade deployment. Organizations that fail to unify AI operations face shadow AI, compliance risk, and wasted spend.',
  },
  {
    title: 'Platform Strategy',
    text: 'Land with AI Workspace and Playground — the daily entry point. Expand through certified marketplace apps and vertical solutions. Monetize via membership tiers, AI Wallet usage credits, marketplace revenue share, and enterprise contracts with SLA and private cloud.',
  },
  {
    title: 'Competitive Advantages',
    text: 'AI-Pass is the only platform unifying provider hub, agent runtime, workflow automation, knowledge pipeline, enterprise apps, trust engine, and marketplace in one OS. Competitors offer chat (OpenAI), agents (point solutions), or governance (GRC tools) — not the full stack.',
  },
  {
    title: 'Business Model',
    text: 'Recurring SaaS membership (Free / Professional $49 / Power $149 / Enterprise custom) plus usage-based AI Wallet credits. Marketplace revenue share on app and skill sales. Enterprise contracts with dedicated support, private routing, and compliance packages.',
  },
  {
    title: 'Enterprise Focus',
    text: 'SSO/SAML, RBAC, audit trails, private cloud deployment, BYOK hybrid routing, and framework-ready compliance (ISO 27001, SOC 2, GDPR, NIS2, ISO 42001). Trust Engine certifies every marketplace app before distribution.',
  },
  {
    title: 'Marketplace Economy',
    text: 'Developers publish apps, skills, and automation packs to a certified marketplace. Revenue share model incentivizes ecosystem growth. Enterprise tenants govern which apps are approved for their organization.',
  },
  {
    title: 'Traction & Metrics',
    text: '14 platform modules live, 26+ models in Provider Hub, 12+ certified marketplace apps, enterprise pilots in finance, manufacturing, and government sectors. Discovery Hub drives organic acquisition through SEO-optimized tool rankings.',
  },
  {
    title: 'Team',
    text: 'Built by enterprise AI practitioners with deep experience in production AI systems, governance, compliance, and operational excellence. Leadership team spans platform engineering, enterprise sales, and regulatory affairs.',
  },
];

const ROADMAP = [
  { quarter: 'Q3 2026', items: ['Agent Studio GA', 'Expanded provider catalog (30+ models)', 'ISO 42001 certification path', 'Series A close'] },
  { quarter: 'Q4 2026', items: ['Enterprise private cloud', 'Advanced governance dashboards', '50+ marketplace apps', 'EMEA expansion'] },
  { quarter: 'Q1 2027', items: ['Industry solution packs (10 verticals)', 'Partner ecosystem launch', 'Global data residency', '100 enterprise customers'] },
  { quarter: 'Q2 2027', items: ['Autonomous workflow marketplace', 'AI agent economy', 'APAC launch', 'IPO readiness assessment'] },
];

const METRICS = [
  { value: '$150B+', label: 'Enterprise AI TAM' },
  { value: '35%', label: 'Market CAGR' },
  { value: '14', label: 'Platform modules' },
  { value: '26+', label: 'AI models supported' },
];

export default function InvestorsPage() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroInner}>
          <BrandLogo className={styles.heroLogo} />
          <div className={styles.eyebrow}>Investors</div>
          <h1 className={styles.heroTitle}>Invest in the Enterprise AI Operating System</h1>
          <p className={section.heroSubhead}>
            AI-Pass is defining the platform layer for governed, unified enterprise AI.
          </p>
          <div className={styles.heroCtas}>
            <a href="mailto:investors@ai-pass.com?subject=Investor%20Meeting" className={`${styles.btnPrimary} ${styles.btnLarge}`}>
              Book Investor Meeting
            </a>
            <a href="#" className={`${styles.btnSecondary} ${styles.btnLarge}`}>
              Download Investor Deck (PDF)
            </a>
          </div>
        </div>
      </section>

      <section className={section.section}>
        <div className={styles.trustStats}>
          {METRICS.map((m) => (
            <div key={m.label}>
              <div className={styles.trustStatValue}>{m.value}</div>
              <div className={styles.trustStatLabel}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${section.section} ${section.sectionAlt}`}>
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Investment Thesis</span>
          <h2 className={section.sectionTitle}>Why AI-Pass, why now</h2>
        </div>
        <div className={section.investorGrid}>
          {INVESTOR_SECTIONS.map((s) => (
            <div key={s.title} className={section.investorCard}>
              <h3 className={section.investorCardTitle}>{s.title}</h3>
              <p className={section.investorCardText}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={section.section}>
        <div className={section.sectionHeader}>
          <span className={section.sectionLabel}>Roadmap</span>
          <h2 className={section.sectionTitle}>Platform milestones</h2>
        </div>
        <div className={section.investorGrid}>
          {ROADMAP.map((r) => (
            <div key={r.quarter} className={section.investorCard}>
              <h3 className={section.investorCardTitle}>{r.quarter}</h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                {r.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.ctaBand}>
        <h2 className={styles.ctaBandTitle}>Partner with us</h2>
        <p className={styles.ctaBandText}>
          Join leading investors backing the enterprise AI operating system.
        </p>
        <div className={styles.ctaBandActions}>
          <a href="mailto:investors@ai-pass.com?subject=Investor%20Meeting" className={styles.btnPrimary}>
            Book Investor Meeting
          </a>
          <Link href="/" className={styles.btnSecondary}>Explore Platform</Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerBottom} style={{ borderTop: 'none', paddingTop: 0 }}>
          <span>© 2026 AI-Pass. All rights reserved.</span>
          <Link href="/" className={styles.footerLink}>Home</Link>
          <Link href="/about" className={styles.footerLink}>About</Link>
        </div>
      </footer>
    </div>
  );
}
