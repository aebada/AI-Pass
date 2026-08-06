import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import styles from '../page.module.css';
import { ModuleIcon } from '@ai-pass/ui';

/**
 * Keep in sync with apps/web/public/downloads/releases/version.json
 */
const IDE_VERSION_MAC = '1.0.1';
const IDE_VERSION_WIN = '1.0.1';
const IDE_VERSION_LINUX = '1.0.1';
const RELEASE_BASE = '/downloads/releases';

type DownloadStatus = 'available' | 'soon' | 'source';

type DownloadItem = {
  name: string;
  desc: string;
  href: string;
  size: string;
  status: DownloadStatus;
  id?: string;
  cta?: string;
};

const IDE_DOWNLOADS: DownloadItem[] = [
  {
    id: 'download-mac',
    name: 'macOS',
    desc: `AI-Pass IDE ${IDE_VERSION_MAC} for Apple Silicon (DMG) — includes Google sign-in fix. Loads the live workspace; auto-updates from aipass.space. Intel Macs: use the x64 DMG from the release folder.`,
    href: `${RELEASE_BASE}/AI-Pass-IDE-${IDE_VERSION_MAC}-arm64.dmg`,
    size: '~101 MB',
    status: 'available',
    cta: 'Download for macOS',
  },
  {
    id: 'download-win',
    name: 'Windows',
    desc: `NSIS installer ${IDE_VERSION_WIN} for Windows 10+ (x64). Same live workspace + electron-updater feed as Mac/Linux. First launch may show SmartScreen until signed builds ship.`,
    href: `${RELEASE_BASE}/AI-Pass-IDE-Setup-${IDE_VERSION_WIN}.exe`,
    size: '~80 MB',
    status: 'available',
    cta: 'Download for Windows',
  },
  {
    id: 'download-linux',
    name: 'Linux',
    desc: `AppImage ${IDE_VERSION_LINUX} (arm64, portable). Update channel: latest-linux.yml under /downloads/releases/.`,
    href: `${RELEASE_BASE}/AI-Pass-IDE-${IDE_VERSION_LINUX}-arm64.AppImage`,
    size: '~108 MB',
    status: 'available',
    cta: 'Download for Linux',
  },
];

const OTHER_DOWNLOADS = {
  web: {
    title: 'Web',
    icon: 'globe',
    items: [
      {
        name: 'Use in Browser',
        desc: 'No install required — open the full AI-Pass workspace in your browser.',
        href: '/workspace',
        size: 'Instant',
        status: 'available' as const,
      },
    ],
  },
  mobile: {
    title: 'Mobile',
    icon: 'smartphone',
    items: [
      {
        id: 'download-ios',
        name: 'iOS',
        desc: 'App Store — iPhone & iPad.',
        href: '#download-ios',
        size: 'Coming soon',
        status: 'soon' as const,
      },
      {
        id: 'download-android',
        name: 'Android',
        desc: 'Google Play or APK download.',
        href: '#download-android',
        size: 'Coming soon',
        status: 'soon' as const,
      },
    ],
  },
};

function ctaLabel(item: DownloadItem): string {
  if (item.cta) return item.cta;
  if (item.status === 'available') return 'Download →';
  if (item.status === 'source') return 'Release metadata →';
  return 'Coming soon';
}

function ctaClass(status: DownloadStatus): string {
  return status === 'soon' ? styles.downloadBtnSoon : styles.downloadBtn;
}

export default function DownloadsPage() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <section className={styles.section} id="download">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Download</span>
          <h1 className={styles.sectionTitle}>Download AI-Pass IDE</h1>
          <p className={styles.sectionDesc}>
            Install the desktop IDE for Mac, Windows, or Linux. It stays connected to{' '}
            <code className={styles.inlineCode}>aipass.space</code> so the workspace UI is always
            current, and the app checks for native updates automatically when new versions are
            published.
          </p>
        </div>

        <div className={styles.downloadGroup}>
          <h2 className={styles.downloadGroupTitle} id="download-desktop">
            <span className={styles.downloadGroupIcon} aria-hidden>
              <ModuleIcon name="monitor" size={20} />
            </span>
            AI-Pass IDE
            <span className={styles.downloadBadge} style={{ marginLeft: '0.75rem' }}>
              v{IDE_VERSION_MAC}
            </span>
          </h2>
          <p className={styles.downloadCardDesc} style={{ marginBottom: '1rem', maxWidth: 720 }}>
            Desktop shell for the whole AI-Pass solution — workspace, playground, agents, model hub,
            and store. Native updates are served from{' '}
            <code className={styles.inlineCode}>{RELEASE_BASE}/</code> (
            <code className={styles.inlineCode}>latest-mac.yml</code>,{' '}
            <code className={styles.inlineCode}>latest.yml</code>,{' '}
            <code className={styles.inlineCode}>latest-linux.yml</code>
            ). Intel macOS DMG:{' '}
            <Link
              href={`${RELEASE_BASE}/AI-Pass-IDE-${IDE_VERSION_MAC}-x64.dmg`}
              className={styles.downloadAllLink}
            >
              AI-Pass-IDE-{IDE_VERSION_MAC}-x64.dmg
            </Link>
            .
          </p>
          <div className={styles.downloadGrid}>
            {IDE_DOWNLOADS.map((item) => (
              <div
                key={item.name}
                id={item.id}
                className={`${styles.downloadCard} ${styles.downloadCardFeatured}`}
              >
                <div className={styles.downloadCardHeader}>
                  <h3 className={styles.downloadCardTitle}>{item.name}</h3>
                  <span className={styles.downloadSize}>{item.size}</span>
                </div>
                <p className={styles.downloadCardDesc}>{item.desc}</p>
                <a href={item.href} className={ctaClass(item.status)} download>
                  {ctaLabel(item)}
                </a>
              </div>
            ))}
          </div>
        </div>

        {Object.values(OTHER_DOWNLOADS).map((group) => (
          <div key={group.title} className={styles.downloadGroup}>
            <h2
              className={styles.downloadGroupTitle}
              id={group.title === 'Mobile' ? 'download-mobile' : undefined}
            >
              <span className={styles.downloadGroupIcon} aria-hidden>
                <ModuleIcon name={group.icon} size={20} />
              </span>
              {group.title}
            </h2>
            <div className={styles.downloadGrid}>
              {group.items.map((item) => (
                <div
                  key={item.name}
                  id={'id' in item ? item.id : undefined}
                  className={styles.downloadCard}
                >
                  <div className={styles.downloadCardHeader}>
                    <h3 className={styles.downloadCardTitle}>{item.name}</h3>
                    <span className={styles.downloadSize}>{item.size}</span>
                  </div>
                  <p className={styles.downloadCardDesc}>{item.desc}</p>
                  <Link
                    href={item.href}
                    className={
                      item.status === 'available' ? styles.downloadBtn : styles.downloadBtnSoon
                    }
                  >
                    {item.status === 'available' ? 'Open Workspace →' : 'Coming soon'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className={styles.downloadNote}>
          <Link href="/" className={styles.footerLink}>
            ← Back to home
          </Link>
          {' · '}
          <Link href={`${RELEASE_BASE}/version.json`} className={styles.footerLink}>
            version.json
          </Link>
          {' · '}
          <Link href={`${RELEASE_BASE}/README.md`} className={styles.footerLink}>
            Release notes for maintainers
          </Link>
        </p>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBottom}>
          <span>© 2026 AI Pass. All rights reserved.</span>
          <Link href="/" className={styles.footerLink}>
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
