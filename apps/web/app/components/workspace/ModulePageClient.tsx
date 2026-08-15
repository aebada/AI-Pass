'use client';

import Link from 'next/link';
import { Card, Badge } from '@ai-pass/ui';
import { workspaceTokens } from '@ai-pass/ui';
import { WorkspacePageHeader } from './WorkspacePageHeader';

export interface ModulePageClientProps {
  title: string;
  description: string;
  moduleId: string;
  status?: string;
  legacyRoute?: string;
  icon?: string;
}

export function ModulePageClient({
  title,
  description,
  moduleId,
  status,
  legacyRoute,
  icon,
}: ModulePageClientProps) {
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <WorkspacePageHeader title={title} subtitle={description} />
      <Card padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {icon && <span style={{ fontSize: 32 }}>{icon}</span>}
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{title}</h2>
              <p style={{ fontSize: 14, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                Module ID: {moduleId}
              </p>
            </div>
            {status && (
              <Badge variant={status === 'done' ? 'success' : 'default'} style={{ marginLeft: 'auto' }}>
                {status}
              </Badge>
            )}
          </div>

          <p style={{ fontSize: 14, color: workspaceTokens.colors.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
            {description}
          </p>

          {legacyRoute && (
            <Link
              href={legacyRoute}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 8,
                background: workspaceTokens.colors.accent,
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
              }}
            >
              Open full module →
            </Link>
          )}

          {status === 'stub' && (
            <p style={{ fontSize: 13, color: workspaceTokens.colors.warning, marginTop: 16 }}>
              This module is in beta - full workspace integration coming soon.
            </p>
          )}
        </Card>
    </div>
  );
}
