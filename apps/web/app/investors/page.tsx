import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { BrandLogo } from '../components/BrandLogo';
import styles from '../page.module.css';
import section from '../home-sections.module.css';

const INVESTOR_SECTIONS = [
  {
    title: 'Vision',
    text: 'AI-Pass is building the operating system for enterprise AI — a unified platform where models, agents, workflows, applications, governance, and marketplaces converge under one membership. Every enterprise deserves an AI infrastructure layer as robust as their cloud stack — not a collection of disconnected chatbots.',
  },
  {
    title: 'Market Opportunity',
    text: 'Enterprise AI spend is expanding quickly as organizations move from pilots into production across finance, operations, support, and compliance. Buyers increasingly need a platform layer that connects models, apps, and controls — not another single-purpose tool.',
  },
  {
    title: 'Why Now',
    text: 'Three forces converge: model proliferation creates vendor complexity, regulatory frameworks raise the bar for governance, and board-level AI mandates require operational deployment. Fragmented tooling leaves room for shadow AI, compliance risk, and wasted spend.',
  },
  {
    title: 'Platform Strategy',
    text: 'Land with AI Workspace and Playground — the daily entry point. Expand through certified marketplace apps and vertical solutions. Monetize via membership tiers, AI Wallet usage credits, marketplace revenue share, and enterprise contracts.',
  },
  {
    title: 'Competitive Advantages',
    text: 'AI-Pass combines provider hub, agent runtime, workflow automation, knowledge pipeline, enterprise apps, trust engine, and marketplace in one product surface. Most competitors specialize in chat, agents, or GRC alone — not the full operating stack.',
  },
  {
    title: 'Business Model',
    text: 'Recurring SaaS membership (Free / Professional / Power / Enterprise) plus usage-based AI Wallet credits. Marketplace revenue share on apps and skills. Enterprise contracts with dedicated support and compliance packages.',
  },
  {
    title: 'Enterprise Focus',
    text: 'Designed for SSO-ready deployments, RBAC, audit trails, private routing options, and framework-aligned compliance programs. Trust Engine supports certification of marketplace apps before distribution.',
  },
  {
    title: 'Marketplace Economy',
    text: 'Developers publish apps, skills, and automation packs to a certified marketplace. Revenue share incentivizes ecosystem growth. Enterprise tenants can govern which apps are approved for their organization.',
  },
  {
    title: 'Product Progress',
    text: 'Core platform modules are live in the product: workspace, provider hub, membership and wallet, store/marketplace, Discovery Hub, Trust Engine, and vertical solution surfaces. Active work continues on agent depth, connectors, and enterprise hardening.',
  },
  {
    title: 'Team',
    text: 'Built by practitioners with experience shipping production AI systems, governance, and operational platforms. For introductions and diligence materials, contact investors@ai-pass.com.',
  },
];

const ROADMAP = [
  { quarter: 'Near term', items: ['Agent Studio depth for enterprise pilots', 'Expanded provider catalog', 'Trust & governance reporting', 'Design-partner deployments'] },
  { quarter: 'Next', items: ['Private / hybrid routing options', 'Advanced governance dashboards', 'Broader marketplace catalog', 'EMEA go-to-market expansion'] },
  { quarter: 'Following', items: ['Industry solution packs', 'Partner ecosystem', 'Data residency options', 'Scaled enterprise customer base'] },
  { quarter: 'Later', items: ['Autonomous workflow marketplace', 'Deeper agent economy surfaces', 'Additional regions', 'Long-term platform maturity'] },
];

const METRICS = [
  { value: 'Growing', label: 'Enterprise AI market' },
  { value: '14+', label: 'Platform modules' },
  { value: '26+', label: 'Models in Provider Hub' },
  { value: 'Live', label: 'Product at aipass.space' },
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
            <a href="mailto:investors@ai-pass.com?subject=Investor%20Deck%20Request" className={`${styles.btnSecondary} ${styles.btnLarge}`}>
              Request Investor Materials
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
