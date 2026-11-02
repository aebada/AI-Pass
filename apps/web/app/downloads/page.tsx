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
  download?: boolean;
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
    desc: 'Native macOS app (Apple Silicon preferred; Intel build also available).',
    href: '/downloads/AI-Pass-macOS.zip',
    size: '~108 MB',
    status: 'available',
    cta: 'Download for Mac',
    id: 'download-mac',
    download: true,
  },
  {
    name: 'Desktop IDE — Windows',
    desc: 'Portable Windows x64 build. Run the exe — no installer required.',
    href: '/downloads/AI-Pass-Windows-x64.exe',
    size: '~75 MB',
    status: 'available',
    cta: 'Download for Windows',
    id: 'download-win',
    download: true,
  },
  {
    name: 'Desktop IDE — Linux',
    desc: 'AppImage for any distro, plus a .deb for Debian/Ubuntu.',
    href: '/downloads/AI-Pass-Linux-x64.AppImage',
    size: '~114 MB',
    status: 'available',
    cta: 'Download AppImage',
    id: 'download-linux',
    download: true,
  },
];

const APPS: DownloadItem[] = [
  {
    name: 'Smart Collector (Web)',
    desc: 'Collect consented interactions into your digital twin from the browser.',
    href: '/#smart-collector',
    size: 'Live',
    status: 'available',
    cta: 'Open collector',
  },
  {
    name: 'Browser extension',
    desc: 'Chrome/Edge MV3 extension — load unpacked or install from this zip.',
    href: '/downloads/AI-Pass-Extension.zip',
    size: 'Zip',
    status: 'available',
    cta: 'Download extension',
    download: true,
  },
  {
    name: 'Linux .deb package',
    desc: 'Debian/Ubuntu package for the AI-Pass desktop IDE.',
    href: '/downloads/AI-Pass-Linux-x64.deb',
    size: '~89 MB',
    status: 'available',
    cta: 'Download .deb',
    download: true,
  },
  {
    name: 'macOS Intel build',
    desc: 'macOS x64 zip if you are on Intel Macs.',
    href: '/downloads/AI-Pass-macOS-x64.zip',
    size: '~113 MB',
    status: 'available',
    cta: 'Download Intel Mac',
    download: true,
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
          {item.status === 'available' ? (
            <a
              href={item.href}
              className={styles.btn}
              {...(item.download ? { download: true } : {})}
              {...(item.href.startsWith('http') || item.href.endsWith('.exe') || item.href.endsWith('.AppImage') || item.href.endsWith('.deb') || item.href.endsWith('.zip')
                ? { rel: 'noopener' }
                : {})}
            >
              {item.cta}
            </a>
          ) : (
            <span className={styles.btnSoon}>{item.cta}</span>
          )}
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
          Install AI-Pass on Mac, Windows, and Linux, or open the web IDE now. Extension and
          collector feeds capture consented interactions into your digital twin.
        </p>
      </section>

      <section className={styles.section} id="ide" aria-labelledby="ide-heading">
        <h2 id="ide-heading">IDE</h2>
        <p className={styles.sectionLead}>
          Desktop builds are live. Prefer Apple Silicon Mac zip, Windows portable exe, or Linux AppImage.
        </p>
        <DownloadGrid items={IDE} />
        <p className={styles.sectionLead} style={{ marginTop: '1rem' }}>
          Extra packages:{' '}
          <a href="/downloads/AI-Pass-Linux-x64.deb">Linux .deb</a>
          {' · '}
          <a href="/downloads/AI-Pass-macOS-arm64.zip">macOS arm64</a>
          {' · '}
          <a href="/downloads/AI-Pass-macOS-x64.zip">macOS Intel</a>
          {' · '}
          <a href="/downloads/latest.json">latest.json</a>
        </p>
        <p className={styles.sectionLead}>
          macOS tip: if Finder says the app can&apos;t be opened, run{' '}
          <code>xattr -cr ~/Downloads/AI-Pass.app</code> then right-click → Open. Apple Silicon uses the
          default Mac zip; Intel Macs need the x64 build.
        </p>
      </section>

      <section className={styles.section} id="apps" aria-labelledby="apps-heading">
        <h2 id="apps-heading">Apps &amp; packages</h2>
        <p className={styles.sectionLead}>
          Extension, collector, and alternate installers for teams that need every surface.
        </p>
        <DownloadGrid items={APPS} />
      </section>

      <section className={styles.collector} id="collector" aria-labelledby="collector-heading">
        <div className={styles.collectorCopy}>
          <p className={styles.eyebrow}>Smart collector</p>
          <h2 id="collector-heading">Collect apps and interactions into one twin</h2>
          <p>
            Install the desktop IDE or browser extension, then stream consented interactions into
            employee, business, and robotics twins.
          </p>
          <ul>
            <li>Desktop IDE for Mac, Windows, Linux</li>
            <li>Browser extension for Chrome and Edge</li>
            <li>Web IDE available instantly at /ide</li>
          </ul>
          <div className={styles.actions}>
            <a href="/downloads/AI-Pass-Extension.zip" className={styles.btn} download>
              Download extension
            </a>
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
