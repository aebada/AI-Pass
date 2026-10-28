import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { DemoBookingForm } from '../components/DemoBookingForm';
import Link from 'next/link';
import styles from './book-demo.module.css';

export const metadata = {
  title: 'Book a demo | AI-Pass',
  description:
    'Book a self-serve AI-Pass demo. Tell us your role and what you need to prove — then walk the knowledge graph.',
};

export default function BookDemoPage() {
  return (
    <div className={styles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />
      <main className={styles.main}>
        <section className={styles.panel} aria-labelledby="book-heading">
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Book a demo</p>
            <h1 id="book-heading">Fill the form. Walk the graph as your role.</h1>
            <p className={styles.lead}>
              Tell us your organisation and role. We route a role-aware walkthrough — explainable hops,
              deterministic checks, and organization rules. No credit card.
            </p>
            <ul className={styles.bullets}>
              <li>Self-serve booking in under two minutes</li>
              <li>Quality, plant, auditor, or operator view</li>
              <li>Live knowledge graph at <Link href="/demo">/demo</Link></li>
            </ul>
          </div>
          <div className={styles.formWrap}>
            <DemoBookingForm />
          </div>
        </section>
      </main>
    </div>
  );
}
