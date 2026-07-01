import { SEED_SYSTEM_IDS } from '@ai-pass/trust-engine';

export function generateStaticParams() {
  return Object.values(SEED_SYSTEM_IDS).map((id) => ({ id }));
}

export default function TrustSystemLayout({ children }: { children: React.ReactNode }) {
  return children;
}
