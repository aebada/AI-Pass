'use client';

import type { ReactNode } from 'react';
import { InvoiceAIProvider } from './components/InvoiceAIProvider';

export default function InvoiceAILayout({ children }: { children: ReactNode }) {
  return <InvoiceAIProvider>{children}</InvoiceAIProvider>;
}
