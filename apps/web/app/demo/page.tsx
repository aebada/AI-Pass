import { PremiumNav } from '../components/premium/PremiumNav';
import { MarketingThemeLock } from '../components/MarketingThemeLock';
import { DemoStudio } from './DemoStudio';
import styles from './demo.module.css';

export const metadata = {
  title: 'Interactive demo — knowledge graph | AI-Pass',
  description:
    'Self-serve knowledge graph demo. Type a human business rule and watch nodes, attributes, metadata, and edges appear in real time.',
};

export default function DemoPage() {
  return (
    <div className={styles.page}>
      <MarketingThemeLock />
      <PremiumNav variant="landing" />
      <main>
        <DemoStudio />
      </main>
    </div>
  );
}
