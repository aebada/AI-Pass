'use client';

import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { MarketplaceNav } from './components/MarketplaceComponents';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayoutClient
      title="Marketplace"
      subtitle="Apps, agents, skills, and automations for AI-Pass"
    >
      <MarketplaceNav />
      {children}
    </WorkspaceLayoutClient>
  );
}
