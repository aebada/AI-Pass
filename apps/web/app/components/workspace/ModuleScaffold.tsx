'use client';

import Link from 'next/link';
import { Card, Badge, Button, workspaceTokens } from '@ai-pass/ui';

export interface ModuleScaffoldProps {
  title: string;
  description: string;
  moduleId: string;
  icon?: string;
  status?: 'done' | 'stub' | 'pending';
  features?: string[];
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
  children?: React.ReactNode;
}

export function ModuleScaffold({
  title,
  description,
  moduleId,
  icon,
  status,
  features = [],
  actions = [],
  children,
}: ModuleScaffoldProps) {
  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        {icon && <span style={{ fontSize: 40 }}>{icon}</span>}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0, color: workspaceTokens.colors.text }}>
              {title}
            </h1>
            {status && (
              <Badge variant={status === 'done' ? 'success' : 'default'}>{status}</Badge>
            )}
          </div>
          <p style={{ fontSize: 14, color: workspaceTokens.colors.textMuted, margin: 0, lineHeight: 1.6 }}>
            {description}
          </p>
        </div>
      </div>

      {features.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
            marginBottom: 24,
          }}
        >
          {features.map((f) => (
            <Card key={f} padding="md" variant="default">
              <span style={{ fontSize: 13, color: workspaceTokens.colors.text }}>{f}</span>
            </Card>
          ))}
        </div>
      )}

      {children}

      {actions.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
          {actions.map((a) => (
            <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
              <Button variant={a.primary ? 'primary' : 'secondary'}>{a.label}</Button>
            </Link>
          ))}
        </div>
      )}

      <p style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, marginTop: 32 }}>
        Module: {moduleId} · AI Pass Platform
      </p>
    </div>
  );
}
