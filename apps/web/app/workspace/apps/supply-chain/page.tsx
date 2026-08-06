'use client';

import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Card, workspaceTokens } from '@ai-pass/ui';

export default function SupplyChainAppPage() {
  return (
    <WorkspaceLayoutClient title="Supply Chain AI" subtitle="Procurement offer evaluation and ranking">
      <ModuleScaffold
        title="Supply Chain AI"
        description="Evaluate supplier offers, rank bids, and automate procurement decisions."
        moduleId="supply-chain"
        icon="package"
        status="done"
        features={['Offer parsing', 'Multi-criteria ranking', 'Supplier scoring', 'LiveSync triggers']}
        actions={[
          { label: 'Evaluate offers', href: '/workspace/workflows', primary: true },
          { label: 'Install from Marketplace', href: '/workspace/marketplace' },
        ]}
      >
        <Card padding="md">
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Active evaluations</h3>
          {['RFQ-1042 — 5 suppliers — Ranking in progress', 'RFQ-1041 — 3 suppliers — Completed'].map((r) => (
            <div key={r} style={{ padding: '8px 0', borderBottom: `1px solid ${workspaceTokens.colors.border}`, fontSize: 13 }}>
              {r}
            </div>
          ))}
        </Card>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
