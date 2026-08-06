'use client';

import Link from 'next/link';
import { DEMO_COMPANY, defaultPresenceAuditPlatform, seedPresenceAuditDemo } from '@ai-pass/presence-audit';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { ModuleScaffold } from '../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';

seedPresenceAuditDemo(defaultPresenceAuditPlatform);
const dashboard = defaultPresenceAuditPlatform.getDashboard(DEMO_COMPANY.tenantId);

export default function PresencePage() {
  const score = dashboard?.score.overall ?? 0;

  return (
    <WorkspaceLayoutClient title="Presence Audit" subtitle="AI Visibility Intelligence Platform">
      <ModuleScaffold
        title="Presence Audit"
        description="Measure and improve how ChatGPT, Claude, Gemini, and Perplexity recommend your brand — not SEO, AI-native visibility."
        moduleId="presence"
        icon="eye"
        status="done"
        features={['Multi-provider audit', 'Competitor analysis', 'Optimization playbook', 'Monitoring & alerts']}
        actions={[
          { label: 'Open Presence Audit app', href: '/workspace/apps/presence-audit', primary: true },
          { label: 'Analysis Studio', href: '/workspace/analysis' },
        ]}
      >
        <Card padding="md">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>{DEMO_COMPANY.name}</h3>
              <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, margin: 0 }}>
                AI Presence Score: <strong style={{ color: workspaceTokens.colors.accent }}>{score}</strong>
              </p>
            </div>
            <Link href="/workspace/apps/presence-audit" style={{ color: workspaceTokens.colors.accent, fontSize: 13 }}>
              View dashboard →
            </Link>
          </div>
        </Card>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
