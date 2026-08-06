'use client';

import { useEffect, useState } from 'react';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { KnowledgeShell } from '../components/KnowledgeShell';

export default function KnowledgeGovernancePage() {
  const [retention, setRetention] = useState<{ retentionDays: number; gdprCompliant: boolean; piiDetection: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/knowledge/status').then((r) => r.json()).then((res) => setRetention(res.data?.retention));
  }, []);

  return (
    <WorkspaceLayoutClient title="Governance" subtitle="RBAC, lineage, PII detection, retention, audit">
      <KnowledgeShell>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Data classification</h3>
            <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, margin: 0 }}>PII detection, GDPR compliance stubs, trust scoring, and approval workflows for sensitive content.</p>
          </Card>
          <Card padding="md">
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 12px' }}>Retention policy</h3>
            {retention && (
              <ul style={{ fontSize: 13, margin: 0, paddingLeft: 18, color: workspaceTokens.colors.textMuted }}>
                <li>Retention: {retention.retentionDays} days</li>
                <li>GDPR compliant: {retention.gdprCompliant ? 'Yes' : 'No'}</li>
                <li>PII detection: {retention.piiDetection}</li>
              </ul>
            )}
          </Card>
        </div>
      </KnowledgeShell>
    </WorkspaceLayoutClient>
  );
}
