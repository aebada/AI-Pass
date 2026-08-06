'use client';

import Link from 'next/link';
import { workspaceTokens } from '@ai-pass/ui';

export const KNOWLEDGE_NAV = [
  { href: '/workspace/knowledge', label: 'Dashboard' },
  { href: '/workspace/knowledge/sources', label: 'Data Sources' },
  { href: '/workspace/knowledge/pipelines', label: 'Pipeline Builder' },
  { href: '/workspace/knowledge-graph', label: 'Knowledge Graph' },
  { href: '/workspace/knowledge/embeddings', label: 'Embeddings' },
  { href: '/workspace/knowledge/search', label: 'Search Workspace' },
  { href: '/workspace/knowledge/retrieval', label: 'RAG Playground' },
  { href: '/workspace/knowledge/sync', label: 'Synchronization' },
  { href: '/workspace/knowledge/governance', label: 'Governance' },
  { href: '/workspace/knowledge/admin', label: 'Administration' },
] as const;

export function KnowledgeShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
        {KNOWLEDGE_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              fontSize: 12,
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${workspaceTokens.colors.border}`,
              color: workspaceTokens.colors.text,
              textDecoration: 'none',
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

export function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: 'success' | 'warning' | 'error' }) {
  const colors = {
    success: workspaceTokens.colors.success,
    warning: workspaceTokens.colors.warning,
    error: workspaceTokens.colors.error,
  };
  return (
    <div style={{
      padding: 12,
      borderRadius: 8,
      border: `1px solid ${workspaceTokens.colors.border}`,
      background: workspaceTokens.colors.bgElevated,
    }}>
      <div style={{ fontSize: 11, color: workspaceTokens.colors.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: tone ? colors[tone] : workspaceTokens.colors.text }}>{value}</div>
    </div>
  );
}
