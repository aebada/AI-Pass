import type { Metadata } from 'next';
import { DemoExperience } from './DemoExperience';

export const metadata: Metadata = {
  title: 'Interactive Demo — Enterprise AI Infrastructure | AI-Pass',
  description:
    'Try AI-Pass interactively: dynamic routing, governance approvals, Trust Bronze→Platinum, Enterprise App Store installs, and wallet savings — on the website.',
};

export default function DemoPage() {
  return <DemoExperience />;
}
