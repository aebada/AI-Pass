'use client';

import type { ReactNode } from 'react';
import { LiveSyncShell } from './components/LiveSyncShell';

export default function LiveSyncLayout({ children }: { children: ReactNode }) {
  return <LiveSyncShell>{children}</LiveSyncShell>;
}
