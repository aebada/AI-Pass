import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { DiscoverSubNav } from './components/DiscoverComponents';
import styles from './discover.module.css';

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PremiumNav variant="landing" />
      <div className={styles.page}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>AI Pass Discovery</span>
          <h1 className={styles.heroTitle}>
            <Link href="/discover" style={{ color: 'inherit', textDecoration: 'none' }}>
              Find · Compare · Install AI Tools
            </Link>
          </h1>
          <p className={styles.heroSub}>
            The front door to AI Pass — intelligent discovery, SEO rankings, deals, and one-click install.
          </p>
        </header>
        <DiscoverSubNav />
        {children}
      </div>
    </div>
  );
}
