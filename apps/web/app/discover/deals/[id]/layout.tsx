import { DISCOVERY_DEALS } from '@ai-pass/discovery-hub';

export function generateStaticParams() {
  return DISCOVERY_DEALS.map((deal) => ({ id: deal.id }));
}

export default function DealDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
