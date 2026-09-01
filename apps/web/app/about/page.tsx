import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { BrandLogo } from '../components/BrandLogo';
import styles from './about.module.css';

const PILLARS = [
  {
    icon: '🏢',
    title: 'One Workspace',
    text: 'Agents, workflows, knowledge, apps, and governance in a single command center - no fragmented dashboards.',
  },
  {
    icon: '🎫',
    title: 'One Membership',
    text: 'Universal AI subscription with frontier models, credits, and tiered access across every module.',
  },
  {
    icon: '💳',
    title: 'One Wallet',
    text: 'Unified billing, usage tracking, and credits for models, apps, and marketplace purchases.',
  },
  {
    icon: '🛒',
    title: 'One Marketplace',
    text: 'Discover, install, and govern AI apps and templates from a trusted enterprise catalog.',
  },
];

const TEAM_PLACEHOLDER = [
  { initials: 'AP', name: 'Leadership Team', role: 'Executive & Product' },
  { initials: 'AI', name: 'Engineering', role: 'Platform & AI Systems' },
  { initials: 'GO', name: 'Governance', role: 'Trust, Compliance & Security' },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroInner}>
          <BrandLogo className={styles.heroLogo} />
          <div className={styles.eyebrow}>About AI Pass</div>
          <h1 className={styles.heroTitle}>Unified AI Operating System</h1>
          <p className={styles.heroSub}>
            Our mission is to give every enterprise a single, governed platform where AI agents, workflows,
            apps, and knowledge work together - not as disconnected tools, but as one operating system.
          </p>
        </div>
      </section>

      <section className={styles.section} id="vision">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Vision</span>
          <h2 className={styles.sectionTitle}>AI that runs your business, not just answers questions</h2>
        </div>
        <div className={styles.contentBlock}>
          <p>
            We envision a world where teams describe outcomes in plain language and AI Pass orchestrates the
            agents, workflows, and apps to deliver them - with governance, audit trails, and trust built in
            from day one.
          </p>
          <p>
            <strong>AI Pass is an enterprise AI operating system.</strong> It unifies the full stack of AI
            capabilities - from model access and agent studio to marketplace apps and compliance - under one
            roof.
          </p>
        </div>
        <div className={styles.notList}>
          <div className={styles.notCard}>
            <span className={styles.notLabel}>Not a chatbot</span>
            <span className={styles.notText}>Conversational AI is one module - not the whole platform.</span>
          </div>
          <div className={styles.notCard}>
            <span className={styles.notLabel}>Not IDE-only</span>
            <span className={styles.notText}>Developers get powerful tools; business users get Studio and workflows.</span>
          </div>
          <div className={styles.notCard}>
            <span className={styles.notLabel}>Not point solutions</span>
            <span className={styles.notText}>Invoice, support, supply chain, and compliance share one workspace.</span>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Core pillars</span>
          <h2 className={styles.sectionTitle}>Four foundations of the AI OS</h2>
          <p className={styles.sectionDesc}>Everything in AI Pass is designed around these principles.</p>
        </div>
        <div className={styles.pillarGrid}>
          {PILLARS.map((pillar) => (
            <div key={pillar.title} className={styles.pillarCard}>
              <div className={styles.pillarIcon}>{pillar.icon}</div>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarText}>{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Team</span>
          <h2 className={styles.sectionTitle}>Built by enterprise AI practitioners</h2>
          <p className={styles.sectionDesc}>
            AI Pass is developed by teams focused on production-grade AI, governance, and operational excellence.
          </p>
        </div>
        <div className={styles.teamGrid}>
          {TEAM_PLACEHOLDER.map((member) => (
            <div key={member.name} className={styles.teamCard}>
              <div className={styles.teamAvatar}>{member.initials}</div>
              <div className={styles.teamName}>{member.name}</div>
              <div className={styles.teamRole}>{member.role}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.sectionAlt}`} id="contact">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Contact</span>
          <h2 className={styles.sectionTitle}>Get in touch</h2>
        </div>
        <div className={styles.contactBox}>
          <p className={styles.contactText}>
            For enterprise inquiries, partnerships, or platform questions, reach out to our team.
            Full contact forms and regional offices coming soon.
          </p>
          <a href="mailto:hello@ai-pass.com" className={styles.contactEmail}>
            hello@ai-pass.com
          </a>
        </div>
      </section>

      <div className={styles.ctaBand}>
        <h2 className={styles.ctaTitle}>Experience the AI Operating System</h2>
        <p className={styles.ctaText}>Enter the workspace and explore every module from one unified platform.</p>
        <div className={styles.ctaActions}>
          <Link href="/workspace" className={styles.btnPrimary}>
            Enter Workspace
          </Link>
          <Link href="/#pricing" className={styles.btnSecondary}>
            View pricing
          </Link>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>© 2026 AI Pass. All rights reserved.</span>
      </footer>
    </div>
  );
}
