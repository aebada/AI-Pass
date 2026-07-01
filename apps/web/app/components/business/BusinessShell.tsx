'use client';

import Link from 'next/link';
import type React from 'react';
import { PremiumNav } from '../premium/PremiumNav';

export const businessTheme = {
  bg: '#0a0e14',
  surface: '#12171f',
  border: '#1e2633',
  text: '#e8edf4',
  muted: '#8b95a5',
  accent: '#3b82f6',
  accentHover: '#2563eb',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#ef4444',
  gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
};

export function BusinessShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}): React.JSX.Element {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>
      <PremiumNav variant="business" />
      {(title || subtitle) && (
        <header style={{ padding: '32px clamp(1rem, 4vw, 2rem) 0' }}>
          {title && <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>{title}</h1>}
          {subtitle && <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 15 }}>{subtitle}</p>}
        </header>
      )}
      <main style={{ padding: 'clamp(1rem, 4vw, 2rem)' }}>{children}</main>
    </div>
  );
}

export function Card({
  children,
  href,
  style,
}: {
  children: React.ReactNode;
  href?: string;
  style?: React.CSSProperties;
}): React.JSX.Element {
  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 24,
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
    ...style,
  };
  if (href) return <Link href={href} style={cardStyle}>{children}</Link>;
  return <div style={cardStyle}>{children}</div>;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
  type = 'button',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit';
}): React.JSX.Element {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff', border: 'none' },
    secondary: { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text-muted)', border: 'none' },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles[variant],
        padding: '10px 20px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

export function Badge({ children, color = businessTheme.accent }: { children: React.ReactNode; color?: string }): React.JSX.Element {
  return (
    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: `${color}22`, color, fontWeight: 600 }}>
      {children}
    </span>
  );
}
