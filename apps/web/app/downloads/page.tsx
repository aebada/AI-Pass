import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import styles from '../page.module.css';

const DESKTOP_BASE = '/downloads';

const DOWNLOADS = {
  web: {
    title: 'Web',
    icon: '🌐',
    items: [
      {
        name: 'Use in Browser',
        desc: 'No install required — open AI Pass in your browser.',
        href: '/ide',
        size: 'Instant',
        status: 'available' as const,
      },
    ],
  },
  desktop: {
    title: 'Desktop',
    icon: '💻',
    items: [
      {
        name: 'macOS (.dmg)',
        desc: 'Apple Silicon & Intel universal build.',
        href: `${DESKTOP_BASE}#download-mac`,
        size: '~180 MB',
        status: 'soon' as const,
      },
      {
        name: 'Windows (.exe)',
        desc: 'NSIS installer for Windows 10+.',
        href: `${DESKTOP_BASE}#download-win`,
        size: '~150 MB',
        status: 'soon' as const,
      },
      {
        name: 'Linux (.AppImage)',
        desc: 'Portable AppImage — no install needed.',
        href: `${DESKTOP_BASE}#download-linux`,
        size: '~160 MB',
        status: 'soon' as const,
      },
      {
        name: 'Linux (.deb)',
        desc: 'Debian / Ubuntu package.',
        href: `${DESKTOP_BASE}#download-linux`,
        size: '~155 MB',
        status: 'soon' as const,
      },
    ],
  },
  mobile: {
    title: 'Mobile',
    icon: '📱',
    items: [
      {
        name: 'iOS',
        desc: 'App Store — iPhone & iPad.',
        href: `${DESKTOP_BASE}#download-ios`,
        size: 'Coming soon',
        status: 'soon' as const,
      },
      {
        name: 'Android',
        desc: 'Google Play or APK download.',
        href: `${DESKTOP_BASE}#download-android`,
        size: 'Coming soon',
        status: 'soon' as const,
      },
    ],
  },
};

export default function DownloadsPage() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <section className={styles.section} id="download">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Download</span>
          <h1 className={styles.sectionTitle}>Download AI Pass</h1>
          <p className={styles.sectionDesc}>
            Use AI Pass in your browser, or install the desktop and mobile apps.
            Desktop builds ship from <code className={styles.inlineCode}>apps/desktop/release/</code> when available.
          </p>
        </div>

        {Object.values(DOWNLOADS).map((group) => (
          <div key={group.title} className={styles.downloadGroup}>
            <h2
              className={styles.downloadGroupTitle}
              id={
                group.title === 'Desktop'
                  ? 'download-desktop'
                  : group.title === 'Mobile'
                    ? 'download-mobile'
                    : undefined
              }
            >
              <span className={styles.downloadGroupIcon} aria-hidden>{group.icon}</span>
              {group.title}
            </h2>
            <div className={styles.downloadGrid}>
              {group.items.map((item) => (
                <div
                  key={item.name}
                  id={
                    item.href.includes('download-mac')
                      ? 'download-mac'
                      : item.href.includes('download-win')
                        ? 'download-win'
                        : item.href.includes('download-linux') && item.name.startsWith('Linux')
                          ? 'download-linux'
                          : item.href.includes('download-ios')
                            ? 'download-ios'
                            : item.href.includes('download-android')
                              ? 'download-android'
                              : undefined
                  }
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
                      item.status === 'available'
                        ? styles.downloadBtn
                        : styles.downloadBtnSoon
                    }
                  >
                    {item.status === 'available' ? 'Open in Browser →' : 'Coming soon'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}

        <p className={styles.downloadNote}>
          <Link href="/" className={styles.footerLink}>← Back to home</Link>
        </p>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBottom}>
          <span>© 2026 AI Pass. All rights reserved.</span>
          <Link href="/" className={styles.footerLink}>Home</Link>
        </div>
      </footer>
    </div>
  );
}
