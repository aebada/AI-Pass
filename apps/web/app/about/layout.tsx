import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — AI Pass',
  description:
    'AI Pass is the unified AI Operating System — one workspace, one membership, one wallet, and one marketplace for enterprise teams.',
  openGraph: {
    title: 'About AI Pass — Unified AI Operating System',
    description:
      'Learn about AI Pass: the enterprise AI OS built for agents, workflows, governance, and every AI module in one place.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
