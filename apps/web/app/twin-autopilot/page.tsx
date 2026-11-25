import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import homeStyles from '../page.module.css';
import styles from '../connect/page.module.css';

export const metadata: Metadata = {
  title: 'Twin Autopilot | AI-Pass',
  description:
    'Instinct-class digital twin autopilot: WhatsApp chat, vault, trusted twins, concierge calls, payment gates, and proactive follow-ups — first-party in AI-Pass.',
};

const FEATURES = [
  {
    title: 'Chat is the UI',
    copy: 'Text your twin on WhatsApp (Cloud API) — no new consumer app to learn.',
  },
  {
    title: 'Secure vault',
    copy: 'Logins stay as host secret refs. The twin acts without dumping passwords into prompts.',
  },
  {
    title: 'Trusted twin network',
    copy: 'Twin-to-twin coordination only after explicit approval — like Trusted Person, for work.',
  },
  {
    title: 'Concierge calls',
    copy: 'Outbound call requests with human approval before dial.',
  },
  {
    title: 'Payment gates',
    copy: 'Nothing spends until you confirm. Irreversible actions hit Company Harness.',
  },
  {
    title: 'Proactive follow-ups',
    copy: 'The twin starts the thread when calendars conflict or tasks stall.',
  },
  {
    title: 'Cloud computer',
    copy: 'Browser/session tools under governance — not a free-roaming consumer sandbox alone.',
  },
  {
    title: 'Company Connect',
    copy: 'ERP, CRM, Workspace, and APIs feed the same twin Instinct-style agents lack.',
  },
];

export default function TwinAutopilotMarketingPage() {
  return (
    <div className={homeStyles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />

      <main>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Twin Autopilot</p>
          <h1>
            Instinct functions.
            <span> Owned inside your twin.</span>
          </h1>
          <p className={styles.sub}>
            Personal and employee digital twins you can text, that hold vault refs, call with
            approval, coordinate with trusted peers, and never spend without a gate — plus Connect
            into real company systems.
          </p>
          <div className={styles.ctas}>
            <Link href="/workspace/twin-autopilot" className={homeStyles.btnPrimary}>
              Open Twin Autopilot
            </Link>
            <Link href="/workspace/connect/whatsapp" className={homeStyles.btnSecondary}>
              Connect WhatsApp
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>What you get</h2>
          <div className={styles.capGrid}>
            {FEATURES.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Why this beats a consumer agent alone</h2>
          <ol className={styles.howList}>
            <li>
              <strong>Company graph</strong> — twins sit on Connect + Graph Builder, not only a
              personal mailbox.
            </li>
            <li>
              <strong>Harness</strong> — irreversible actions need confirmation, audit, and role
              walls.
            </li>
            <li>
              <strong>Same chat pattern</strong> — WhatsApp/SMS as the interface, Instinct-style.
            </li>
          </ol>
        </section>
      </main>

      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerInner}>
          <div className={homeStyles.footerBrand}>
            <BrandLogoLink />
            <p className={homeStyles.footerTag}>Connect everything. Build the twin. Let agents act.</p>
          </div>
          <div className={homeStyles.footerColumns}>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
