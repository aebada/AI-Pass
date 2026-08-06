/** Enterprise design tokens — light/dark via CSS variables */
export const tokens = {
  colors: {
    bg: 'var(--bg)',
    bgElevated: 'var(--bg-elevated)',
    bgHover: 'var(--bg-hover)',
    border: 'var(--border)',
    text: 'var(--text)',
    textMuted: 'var(--text-muted)',
    accent: 'var(--accent)',
    accentMuted: 'var(--accent-muted)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
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
    md: 13,
    lg: 15,
    xl: 18,
    xxl: 22,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  sidebarWidth: 248,
  sidebarCollapsedWidth: 64,
  topBarHeight: 52,
} as const;

export type WorkspaceTokens = typeof tokens;
