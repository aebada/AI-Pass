import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'AI Pass Platform',
  description: 'Monaco workspace with chat, agent mode, composer, and terminal.',
};

export default function IdeLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
