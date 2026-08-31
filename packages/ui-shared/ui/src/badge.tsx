import type { CSSProperties, ReactNode } from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'pro' | 'enterprise' | 'outline';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  style?: CSSProperties;
  className?: string;
}

const variantColors: Record<BadgeVariant, { bg: string; color: string; border?: string }> = {
  default: { bg: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff' },
  success: { bg: 'rgba(63, 185, 80, 0.15)', color: '#3fb950' },
  warning: { bg: 'rgba(210, 153, 34, 0.15)', color: '#d29922' },
  danger: { bg: 'rgba(248, 81, 73, 0.15)', color: '#f85149' },
  pro: { bg: 'linear-gradient(135deg, rgba(163, 113, 247, 0.25), rgba(88, 166, 255, 0.2))', color: '#c4b5fd' },
  enterprise: { bg: 'rgba(234, 179, 8, 0.12)', color: '#fbbf24', border: 'rgba(234, 179, 8, 0.35)' },
  outline: { bg: 'transparent', color: 'var(--ai-text-muted, #8b949e)', border: 'var(--ai-border, #30363d)' },
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  style,
  className,
}: BadgeProps) {
  const colors = variantColors[variant];
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dot ? 6 : 0,
        padding: size === 'sm' ? '2px 8px' : '4px 12px',
        borderRadius: 100,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 600,
        letterSpacing: '0.02em',
        background: colors.bg,
        color: colors.color,
        border: colors.border ? `1px solid ${colors.border}` : 'none',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: colors.color,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
