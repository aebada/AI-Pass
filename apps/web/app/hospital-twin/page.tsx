import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import homeStyles from '../page.module.css';
import styles from '../connect/page.module.css';

export const metadata: Metadata = {
  title: 'Hospital System Twin | AI-Pass',
  description:
    'Hospital sector pack and Command Center — capacity, ED, supply, equipment, staffing with synthetic demo twin.',
};

const BOARDS = [
  { title: 'Executive overview', copy: 'Occupancy, free beds, ED waiting, alerts, critical equipment, stock risk.' },
  { title: 'Capacity and flow', copy: 'Bed grid by unit, pending discharges, turnaround, admissions vs discharges.' },
  { title: 'Emergency department', copy: 'Live census, triage waits, door-to-provider, boarding, LWBS.' },
  { title: 'Supply & equipment', copy: 'Days of stock, late POs, oxygen reserve, critical devices, MTTR.' },
];

const SCENARIOS = [
  { title: 'ED surge', copy: 'Arrivals ×3 — waiting, boarding, ICU pressure.' },
  { title: 'CT failure', copy: 'Critical equipment alert and imaging backlog.' },
  { title: 'Supply shortage', copy: 'Stock-out date and late purchase order.' },
  { title: 'Staffing gap', copy: 'ICU night shift short — coverage alert.' },
];

export default function HospitalTwinMarketingPage() {
  return (
    <div className={homeStyles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />

      <main>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Hospital System Twin</p>
          <h1>
            One voice. One screen.
            <span> Every department.</span>
          </h1>
          <p className={styles.sub}>
            Operational twin for hospital leadership — beds, ED, supply, equipment, and staffing with
            provenance. Synthetic demo kit included. Not clinical decision support.
          </p>
          <div className={styles.ctas}>
            <Link href="/workspace/hospital-twin" className={homeStyles.btnPrimary}>
              Open Command Center
            </Link>
            <Link href="/workspace/data-products" className={homeStyles.btnSecondary}>
              Browse Data Products
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Command Center boards</h2>
          <div className={styles.grid}>
            {BOARDS.map((b) => (
              <article key={b.title} className={styles.card}>
                <h3>{b.title}</h3>
                <p>{b.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Simulator scenarios</h2>
          <div className={styles.grid}>
            {SCENARIOS.map((s) => (
              <article key={s.title} className={styles.card}>
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.ctas} style={{ marginTop: 24 }}>
            <Link href="/workspace/hospital-twin" className={homeStyles.btnPrimary}>
              Launch demo twin
            </Link>
          </div>
        </section>
      </main>

      <footer className={homeStyles.footer}>
        <div className={homeStyles.footerInner}>
          <div className={homeStyles.footerBrand}>
            <BrandLogoLink />
            <p className={homeStyles.footerTag}>Hospital System Twin · AI-Pass</p>
          </div>
          <div className={homeStyles.footerCols}>
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title} className={homeStyles.footerCol}>
                <h4>{col.title}</h4>
                {col.links.map((l) => (
                  <Link key={l.href + l.label} href={l.href}>
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
