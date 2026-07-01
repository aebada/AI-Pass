'use client';

import Link from 'next/link';
import { defaultModuleRegistry } from '@ai-pass/platform-core';
import { TrustCertBadge } from '../../components/trust/TrustCertBadge';
import { Card, ModuleCard, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';

const INSTALLED_APPS = [
  {
    id: 'invoice-ai',
    name: 'Invoice AI',
    description: 'Finance automation — extract, validate, and route invoices',
    icon: '🧾',
    route: '/workspace/apps/invoice-ai',
    status: 'done' as const,
    installed: true,
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain AI',
    description: 'Procurement offer evaluation and supplier ranking',
    icon: '📦',
    route: '/workspace/apps/supply-chain',
    status: 'done' as const,
    installed: true,
  },
  {
    id: 'presence-audit',
    name: 'Presence Audit',
    description: 'AI Visibility Intelligence — audit brand presence across ChatGPT, Claude, Gemini, Perplexity',
    icon: '👁',
    route: '/workspace/apps/presence-audit',
    status: 'done' as const,
    installed: true,
  },
  {
    id: 'sales-ai',
    name: 'Sales AI',
    description: 'Close More Deals with AI — email, LinkedIn, proposals, CRM, campaigns',
    icon: '📈',
    route: '/workspace/apps/sales-ai',
    status: 'done' as const,
    installed: true,
  },
  {
    id: 'content-ai',
    name: 'Content AI',
    description: 'AI Detector & Humanizer — detect AI text, humanize with confidence',
    icon: '✍',
    route: '/workspace/apps/content-ai',
    status: 'done' as const,
    installed: true,
  },
  {
    id: 'customer-support',
    name: 'Customer Support AI',
    description: 'Voice + text multi-language support agent',
    icon: '💬',
    route: '/workspace/apps/customer-support-ai',
    status: 'done' as const,
    installed: true,
  },
  {
    id: 'compliance-ai',
    name: 'Compliance AI',
    description: 'ISO, GDPR, AI governance, trust center, and regulatory automation',
    icon: '⚖',
    route: '/workspace/apps/compliance-ai',
    status: 'done' as const,
    installed: true,
  },
  {
    id: 'hr-ai',
    name: 'HR AI',
    description: 'Onboarding, policy Q&A, and employee workflows',
    icon: '👥',
    route: '/workspace/marketplace',
    status: 'stub' as const,
    installed: false,
  },
];

export default function AppsPage() {
  const mod = defaultModuleRegistry.get('apps');

  return (
    <WorkspaceLayoutClient title="AI Apps" subtitle="Installed apps and vertical solutions">
      <ModuleScaffold
        title={mod?.name ?? 'AI Apps'}
        description={mod?.description ?? 'Enterprise AI applications'}
        moduleId="apps"
        icon="📦"
        status="done"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {INSTALLED_APPS.map((app) => (
            <div key={app.id} style={{ position: 'relative' }}>
              <ModuleCard
                id={app.id}
                name={app.name}
                description={app.description}
                icon={app.icon}
                route={app.route}
                status={app.status}
              />
              {app.installed && (
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: workspaceTokens.colors.success,
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  Installed
                </span>
              )}
              <div style={{ padding: '0 12px 12px' }}>
                <TrustCertBadge resourceId={app.id} compact />
              </div>
            </div>
          ))}
        </div>

        <Card padding="md" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Install more apps</h3>
          <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, margin: '0 0 12px' }}>
            Browse the marketplace for templates, automation packs, and enterprise apps.
          </p>
          <Link href="/workspace/marketplace" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>
            Open Marketplace →
          </Link>
        </Card>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
