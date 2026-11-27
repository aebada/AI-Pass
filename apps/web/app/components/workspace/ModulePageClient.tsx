'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
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

/** Modules with a real dedicated workspace page — never soft-link to self. */
const DEDICATED_WORKSPACE_MODULES = new Set([
  'hospital-twin',
  'lifecycle',
  'twin-autopilot',
  'data-products',
  'connect',
]);

export function ModulePageClient({
  title,
  description,
  moduleId,
  status,
  legacyRoute,
  icon,
}: ModulePageClientProps) {
  const pathname = usePathname();
  const dedicated = DEDICATED_WORKSPACE_MODULES.has(moduleId);
  const openHref = `/workspace/${moduleId}/`;
  const overviewHref =
    legacyRoute && legacyRoute !== openHref.replace(/\/$/, '') && !legacyRoute.startsWith('/workspace/')
      ? legacyRoute.endsWith('/')
        ? legacyRoute
        : `${legacyRoute}/`
      : moduleId === 'hospital-twin'
        ? '/hospital-twin/'
        : null;

  // If a dedicated page exists but the stub shell was served (stale CDN / overwrite),
  // hard-reload once with a cache buster so Hostinger picks up DirectoryIndex content.
  useEffect(() => {
    if (!dedicated) return;
    if (typeof window === 'undefined') return;
    const key = `ai-pass:reload:${moduleId}`;
    if (sessionStorage.getItem(key) === '1') return;
    sessionStorage.setItem(key, '1');
    window.location.replace(`${openHref}?v=${Date.now()}`);
  }, [dedicated, moduleId, openHref]);

  const hardGo = (href: string) => {
    if (typeof window !== 'undefined') {
      window.location.assign(href);
    }
  };

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

          {dedicated && (
            <p style={{ fontSize: 13, color: workspaceTokens.colors.textMuted, marginBottom: 16 }}>
              Opening the full {title} experience…
            </p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a
              href={openHref}
              onClick={(e) => {
                e.preventDefault();
                hardGo(`${openHref}?v=${Date.now()}`);
              }}
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
                cursor: 'pointer',
              }}
            >
              Open Command Center →
            </a>
            {overviewHref && (
              <a
                href={overviewHref}
                onClick={(e) => {
                  e.preventDefault();
                  hardGo(overviewHref);
                }}
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
                  cursor: 'pointer',
                }}
              >
                Product overview
              </a>
            )}
          </div>

          {status === 'stub' && (
            <p style={{ fontSize: 13, color: workspaceTokens.colors.warning, marginTop: 16 }}>
              This module is in beta — full workspace integration coming soon.
            </p>
          )}

          {/* Avoid unused pathname lint in some builds */}
          <span style={{ display: 'none' }}>{pathname}</span>
        </Card>
      </div>
    </WorkspaceLayoutClient>
  );
}
