import type { Metadata } from 'next';
import Link from 'next/link';
import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { BrandLogoLink } from '../components/BrandLogoLink';
import { FOOTER_COLUMNS } from '../lib/site-nav';
import homeStyles from '../page.module.css';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Hospital System Twin | AI-Pass',
  description:
    'Hospital sector pack and Command Center — capacity, ED, supply, equipment, staffing with synthetic demo twin.',
};

const BOARDS = [
  {
    title: 'Executive overview',
    copy: 'Occupancy, free beds, ED waiting, alerts, critical equipment, and stock risk on one board.',
  },
  {
    title: 'Capacity and flow',
    copy: 'Unit bed grid, pending discharges, turnaround time, and admissions versus discharges.',
  },
  {
    title: 'Emergency department',
    copy: 'Live census, triage waits, door-to-provider, boarding, and left-without-being-seen.',
  },
  {
    title: 'Supply and equipment',
    copy: 'Days of stock, late purchase orders, oxygen reserve, critical devices, and MTTR.',
  },
];

const SCENARIOS = [
  { title: 'ED surge', copy: 'Arrivals ×3 — waiting, boarding, and ICU pressure rise together.' },
  { title: 'CT failure', copy: 'Critical equipment alert with imaging backlog and longer ED stays.' },
  { title: 'Supply shortage', copy: 'Stock-out date surfaces with a late purchase order trail.' },
  { title: 'Staffing gap', copy: 'ICU night shift shortfall triggers coverage alerts.' },
];

export default function HospitalTwinMarketingPage() {
  return (
    <div className={styles.page}>
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
            Operational twin for hospital leadership — digital twin floor maps, live bed states, forecast
            bands, and a voice chatbot with sound. Provenance on every number. Built for demos, discovery,
            and pilot boards.
          </p>
          <div className={styles.ctas}>
            {/* Plain anchors: hard navigation works on static Hostinger even if Next client router stalls */}
            <a href="/workspace/hospital-twin/" className={styles.primary}>
              Open Command Center
            </a>
            <a href="/workspace/hospital-twin/?tab=ask" className={styles.secondary}>
              Talk to the twin
            </a>
          </div>
          <div className={styles.banner}>Synthetic data. Not a real hospital. Not clinical decision support.</div>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <strong>~300</strong>
              <span>Demo beds</span>
            </div>
            <div className={styles.metric}>
              <strong>9</strong>
              <span>Live scenarios</span>
            </div>
            <div className={styles.metric}>
              <strong>30</strong>
              <span>Golden questions</span>
            </div>
            <div className={styles.metric}>
              <strong>Voice</strong>
              <span>Chat + sound</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>Digital twin visualizations</h2>
          <p className={styles.sectionLead}>
            Floor heatmaps, per-bed state grids, occupancy and ED arrival forecast bands, and critical
            equipment pins — then ask by voice or text and hear a short verified answer.
          </p>
          <div className={styles.grid}>
            {[
              {
                title: 'Floor & bed twin',
                copy: 'Every unit coloured by occupancy with bed cells for available, occupied, cleaning, reserved, and blocked.',
              },
              {
                title: 'Forecast bands',
                copy: '24h occupancy interval and ED arrivals pattern update with the same seed as the simulator.',
              },
              {
                title: 'Voice chatbot',
                copy: 'Hold the mic, ask in natural language, hear the answer spoken, and edit the transcript anytime.',
              },
              {
                title: 'Command boards',
                copy: 'Executive, capacity, ED, supply, equipment, staffing, digest, and handover with provenance.',
              },
            ].map((b) => (
              <article key={b.title} className={styles.card}>
                <h3>{b.title}</h3>
                <p>{b.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Command Center boards</h2>
          <p className={styles.sectionLead}>
            Pilot views from the hospital sector pack — executive, capacity, ED, supply, equipment, staffing,
            digest, and handover.
          </p>
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
          <p className={styles.sectionLead}>
            Deterministic seeds, expected alerts, and reset under 10 seconds for the chairman demo script.
          </p>
          <div className={styles.grid}>
            {SCENARIOS.map((s) => (
              <article key={s.title} className={styles.card}>
                <h3>{s.title}</h3>
                <p>{s.copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.ctas}>
            <a href="/workspace/hospital-twin/" className={styles.primary}>
              Launch demo twin
            </a>
          </div>
          <p className={styles.footerNote}>
            Pseudonymous patients only. Draft purchase requests never auto-execute.
          </p>
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
