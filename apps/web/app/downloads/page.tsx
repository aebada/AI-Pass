import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import styles from './downloads.module.css';

type DownloadItem = {
  name: string;
  desc: string;
  href: string;
  size: string;
  status: 'available' | 'soon';
  cta: string;
  id?: string;
};

const IDE: DownloadItem[] = [
  {
    name: 'AI-Pass IDE (Web)',
    desc: 'Open the full IDE in your browser — agents, workspace, and graph tools.',
    href: '/ide',
    size: 'Instant',
    status: 'available',
    cta: 'Open IDE',
  },
  {
    name: 'Desktop IDE — macOS',
    desc: 'Native desktop shell for Apple Silicon and Intel.',
    href: '/downloads#download-mac',
    size: '~180 MB',
    status: 'soon',
    cta: 'Coming soon',
    id: 'download-mac',
  },
  {
    name: 'Desktop IDE — Windows',
    desc: 'NSIS installer for Windows 10 and later.',
    href: '/downloads#download-win',
    size: '~150 MB',
    status: 'soon',
    cta: 'Coming soon',
    id: 'download-win',
  },
  {
    name: 'Desktop IDE — Linux',
    desc: 'AppImage and .deb packages for Linux desktops.',
    href: '/downloads#download-linux',
    size: '~160 MB',
    status: 'soon',
    cta: 'Coming soon',
    id: 'download-linux',
  },
];

const APPS: DownloadItem[] = [
  {
    name: 'Smart Collector (Web)',
    desc: 'Start collecting consented interactions into your digital twin from the browser.',
    href: '/waitlist',
    size: 'Waitlist',
    status: 'available',
    cta: 'Join waitlist',
  },
  {
    name: 'iOS app',
    desc: 'Collect mobile interactions, notifications, and on-device context with consent.',
    href: '/downloads#download-ios',
    size: 'App Store',
    status: 'soon',
    cta: 'Coming soon',
    id: 'download-ios',
  },
  {
    name: 'Android app',
    desc: 'Google Play build for Android phones and tablets.',
    href: '/downloads#download-android',
    size: 'Play / APK',
    status: 'soon',
    cta: 'Coming soon',
    id: 'download-android',
  },
  {
    name: 'Browser extension',
    desc: 'Capture app and web interactions across Chrome and Edge into the twin.',
    href: '/waitlist',
    size: 'Waitlist',
    status: 'available',
    cta: 'Join waitlist',
  },
];

function DownloadGrid({ items }: { items: DownloadItem[] }) {
  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <article key={item.name} id={item.id} className={styles.card}>
          <div className={styles.cardTop}>
            <h3>{item.name}</h3>
            <span className={styles.meta}>{item.size}</span>
          </div>
          <p>{item.desc}</p>
          <Link href={item.href} className={item.status === 'available' ? styles.btn : styles.btnSoon}>
            {item.cta}
          </Link>
        </article>
      ))}
    </div>
  );
}

export default function DownloadsPage() {
  return (
    <div className={styles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Downloads</p>
        <h1>IDE, apps, and the smart collector</h1>
        <p>
          Run AI-Pass in the browser today. Download desktop and mobile apps to collect every
          consented interaction, app, and workflow into your digital twin.
        </p>
      </section>

      <section className={styles.section} id="ide" aria-labelledby="ide-heading">
        <h2 id="ide-heading">IDE</h2>
        <p className={styles.sectionLead}>
          The AI-Pass IDE for agents, knowledge graphs, and governed workflows.
        </p>
        <DownloadGrid items={IDE} />
      </section>

      <section className={styles.section} id="apps" aria-labelledby="apps-heading">
        <h2 id="apps-heading">Apps</h2>
        <p className={styles.sectionLead}>
          Mobile, extension, and collector surfaces that feed the twin with real usage context.
        </p>
        <DownloadGrid items={APPS} />
      </section>

      <section className={styles.collector} id="collector" aria-labelledby="collector-heading">
        <div className={styles.collectorCopy}>
          <p className={styles.eyebrow}>Smart collector</p>
          <h2 id="collector-heading">Collect apps and interactions into one twin</h2>
          <p>
            The collector connects the tools you already use. With consent, it captures interactions
            so agents can plan, sell, pay, and operate with real context — not guesses.
          </p>
          <ul>
            <li>Apps and solutions you open every day</li>
            <li>Messages, approvals, and workflow events</li>
            <li>Feeds personal, business, and robotics twins</li>
          </ul>
          <div className={styles.actions}>
            <Link href="/waitlist" className={styles.btn}>
              Get early access
            </Link>
            <Link href="/ide" className={styles.btnSoon}>
              Open IDE now
            </Link>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.collectorImg}
          src="/marketing/smart-collector-app.jpg"
          alt="AI-Pass smart collector on phone and laptop"
          width={1200}
          height={675}
        />
      </section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} AI-Pass</span>
        <Link href="/">Back to home</Link>
      </footer>
    </div>
  );
}
