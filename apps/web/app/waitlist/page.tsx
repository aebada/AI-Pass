import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { WaitlistForm } from '../components/WaitlistForm';
import Link from 'next/link';
import styles from './waitlist.module.css';

export const metadata = {
  title: 'Waiting list | AI-Pass',
  description:
    'Join the AI-Pass waiting list for early access to personal, business and robotics digital twins with policy-checked agents.',
};

export default function WaitlistPage() {
  return (
    <div className={styles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />
      <main className={styles.main}>
        <section className={styles.panel} aria-labelledby="waitlist-heading">
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Waiting list</p>
            <h1 id="waitlist-heading">Get early access to AI-Pass twins.</h1>
            <p className={styles.lead}>
              Join the list for personal, company and robotics digital twins. Agents act on your
              rules, with a confirmation gate for payments and orders, and an audit path you can
              show.
            </p>
            <ul className={styles.bullets}>
              <li>Personal twin: routines, inbox and admin under your consent</li>
              <li>Business twin: invoices, CRM and plant decisions with role walls</li>
              <li>Robotics and production: agent actions on the shop floor with replay</li>
              <li>
                Live knowledge graph walkthrough at <Link href="/demo">/demo</Link>
              </li>
            </ul>
          </div>
          <div className={styles.formWrap}>
            <WaitlistForm />
          </div>
        </section>
      </main>
    </div>
  );
}
