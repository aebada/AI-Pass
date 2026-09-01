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
          <span className={styles.eyebrow}>AI Discovery Hub</span>
          <h1 className={styles.heroTitle}>
            <Link href="/discover" style={{ color: 'inherit', textDecoration: 'none' }}>
              Discover · Evaluate · Orchestrate
            </Link>
          </h1>
          <p className={styles.heroSub}>
            Enterprise AI catalog — compare, benchmark, install, connect to workflows and agents, and govern with Trust Scores.
          </p>
        </header>
        <DiscoverSubNav />
        {children}
      </div>
    </div>
  );
}
