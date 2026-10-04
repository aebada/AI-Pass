import { PremiumNav } from '../components/premium/PremiumNav';
import { DemoStudio } from './DemoStudio';
import styles from './demo.module.css';

export const metadata = {
  title: 'Interactive demo — knowledge graph | AI-Pass',
  description:
    'Self-serve knowledge graph demo with nodes, attributes, metadata, provenance, and role-based deterministic answers.',
};

export default function DemoPage() {
  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />
      <main>
        <DemoStudio />
      </main>
    </div>
  );
}
