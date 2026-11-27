'use client';

import Link from 'next/link';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';

const PRODUCTS = [
  {
    id: 'lifecycle-twin',
    name: 'Product Lifecycle Twin',
    status: 'Live',
    copy: 'Full R&D → aftermarket ontology, knowledge graph, and studio apps on one product truth.',
    href: '/workspace/lifecycle',
  },
  {
    id: 'hospital-pack',
    name: 'Hospital Sector Pack',
    status: 'Beta',
    copy: 'Capacity, ED, supply, equipment, and staffing KPIs with synthetic demo hospital.',
    href: '/workspace/lifecycle',
  },
  {
    id: 'ops-reality',
    name: 'Ops Reality datasets',
    status: 'Live',
    copy: 'Partner operational datasets for twin grounding and agent evaluation.',
    href: '/lab/ops-reality',
  },
  {
    id: 'graph-builder',
    name: 'Evidence Graph Pack',
    status: 'Live',
    copy: 'Judged triples and GraphRAG-ready corpora for enterprise knowledge products.',
    href: '/graph-builder',
  },
];

export default function DataProductsPage() {
  return (
    <WorkspaceLayoutClient
      title="Data Products"
      subtitle="Curated packs and twin datasets you can install into the workspace"
    >
      <ModuleScaffold
        title="Data Products"
        description="Sector packs, lifecycle twins, and evidence datasets — ready for agents, boards, and Connect."
        moduleId="data-products"
        icon="▦"
        status="done"
        features={['Lifecycle twin', 'Sector packs', 'Evidence graphs', 'Ops Reality']}
        actions={[
          { label: 'Open Lifecycle', href: '/workspace/lifecycle', primary: true },
          { label: 'Browse Store', href: '/workspace/store' },
        ]}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 12,
          }}
        >
          {PRODUCTS.map((product) => (
            <Card key={product.id} padding="md">
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <strong style={{ fontSize: 14, color: workspaceTokens.colors.text }}>{product.name}</strong>
                <span style={{ fontSize: 12, color: workspaceTokens.colors.textMuted }}>{product.status}</span>
              </div>
              <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, margin: '8px 0 12px' }}>
                {product.copy}
              </p>
              <Link
                href={product.href}
                style={{ color: workspaceTokens.colors.accent, fontSize: 13, textDecoration: 'none' }}
              >
                Open →
              </Link>
            </Card>
          ))}
        </div>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
