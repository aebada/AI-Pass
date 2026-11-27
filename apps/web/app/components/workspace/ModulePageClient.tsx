'use client';

import Link from 'next/link';
import { Card, Badge } from '@ai-pass/ui';
import { workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from './WorkspaceLayoutClient';

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
  // Prefer the workspace module route; legacy marketing routes are secondary.
  const openHref = `/workspace/${moduleId}`;
  const secondaryHref =
    legacyRoute && legacyRoute !== openHref && !legacyRoute.startsWith('/workspace/')
      ? legacyRoute
      : null;

  return (
    <WorkspaceLayoutClient title={title} subtitle={description}>
      <div style={{ padding: '8px 4px 24px', maxWidth: 880 }}>
        <Card padding="lg">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {icon && <span style={{ fontSize: 32 }}>{icon}</span>}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: workspaceTokens.colors.text }}>
                {title}
              </h2>
              <p style={{ fontSize: 14, color: workspaceTokens.colors.textMuted, margin: '4px 0 0' }}>
                Module ID: {moduleId}
              </p>
            </div>
            {status && (
              <Badge variant={status === 'done' ? 'success' : 'default'}>{status}</Badge>
            )}
          </div>

          <p style={{ fontSize: 14, color: workspaceTokens.colors.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
            {description}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <Link
              href={openHref}
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
              Open module →
            </Link>
            {secondaryHref && (
              <Link
                href={secondaryHref}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 20px',
                  borderRadius: 8,
                  border: `1px solid ${workspaceTokens.colors.border}`,
                  color: workspaceTokens.colors.text,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                Product overview
              </Link>
            )}
          </div>

          {status === 'stub' && (
            <p style={{ fontSize: 13, color: workspaceTokens.colors.warning, marginTop: 16 }}>
              This module is in beta — full workspace integration coming soon.
            </p>
          )}
        </Card>
      </div>
    </WorkspaceLayoutClient>
  );
}
