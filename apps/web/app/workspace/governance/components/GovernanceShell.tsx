'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { workspaceTokens } from '@ai-pass/ui';

const NAV = [
  { href: '/workspace/governance', label: 'Dashboard', exact: true },
  { href: '/workspace/governance/inventory', label: 'AI Inventory' },
  { href: '/workspace/governance/policies', label: 'Policies' },
  { href: '/workspace/governance/risks', label: 'Risk Register' },
  { href: '/workspace/governance/approvals', label: 'Approvals' },
  { href: '/workspace/governance/monitoring', label: 'Monitoring' },
  { href: '/workspace/governance/reports', label: 'Reports' },
  { href: '/workspace/identity', label: 'Identity' },
  { href: '/workspace/trust', label: 'Trust' },
  { href: '/workspace/governance/settings', label: 'Settings' },
];

export function GovernanceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <nav
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          marginBottom: 20,
          borderBottom: `1px solid ${workspaceTokens.colors.border}`,
          paddingBottom: 12,
        }}
      >
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: 13,
                textDecoration: 'none',
                color: active ? workspaceTokens.colors.accent : workspaceTokens.colors.textMuted,
                background: active ? `${workspaceTokens.colors.accent}15` : 'transparent',
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}

export function StatCard({ label, value, tone }: { label: string; value: string | number; tone?: 'default' | 'warning' | 'error' | 'success' }) {
  const colors = {
    default: workspaceTokens.colors.text,
    warning: workspaceTokens.colors.warning,
    error: workspaceTokens.colors.error,
    success: workspaceTokens.colors.success,
  };
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 8,
        border: `1px solid ${workspaceTokens.colors.border}`,
        background: workspaceTokens.colors.bgElevated,
      }}
    >
      <div style={{ fontSize: 24, fontWeight: 700, color: colors[tone ?? 'default'] }}>{value}</div>
      <div style={{ fontSize: 12, color: workspaceTokens.colors.textMuted, marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function RiskBadge({ level }: { level: string }) {
  const color =
    level === 'critical' ? workspaceTokens.colors.error
    : level === 'high' ? workspaceTokens.colors.warning
    : level === 'medium' ? workspaceTokens.colors.accent
    : workspaceTokens.colors.textMuted;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color, textTransform: 'uppercase' }}>{level}</span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'compliant' || status === 'approved' || status === 'published' ? workspaceTokens.colors.success
    : status === 'pending' || status === 'pending_review' ? workspaceTokens.colors.warning
    : status === 'non_compliant' || status === 'rejected' ? workspaceTokens.colors.error
    : workspaceTokens.colors.textMuted;
  return <span style={{ fontSize: 11, fontWeight: 600, color }}>{status.replace(/_/g, ' ')}</span>;
}
