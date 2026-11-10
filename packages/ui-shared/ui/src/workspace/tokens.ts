/** Enterprise design tokens — light/dark via CSS variables */
export const tokens = {
  colors: {
    bg: 'var(--bg, #0d1117)',
    bgElevated: 'var(--bg-elevated, #161b22)',
    bgHover: 'var(--bg-hover, #21262d)',
    border: 'var(--border, #30363d)',
    text: 'var(--text, #e6edf3)',
    textMuted: 'var(--text-muted, #8b949e)',
    accent: 'var(--accent, #58a6ff)',
    accentMuted: 'var(--accent-muted, #1f6feb)',
    success: 'var(--success, #3fb950)',
    warning: 'var(--warning, #d29922)',
    error: 'var(--error, #f85149)',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 28,
  },
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  sidebarWidth: 240,
  sidebarCollapsedWidth: 64,
  topBarHeight: 56,
} as const;

export type WorkspaceTokens = typeof tokens;
