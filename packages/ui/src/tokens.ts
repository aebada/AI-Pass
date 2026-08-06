export const tokens = {
  colors: {
    bg: 'var(--bg, #f7f8fa)',
    bgElevated: 'var(--bg-elevated, #ffffff)',
    bgHover: 'var(--bg-hover, #eef0f4)',
    border: 'var(--border, #dde1e8)',
    text: 'var(--text, #12151a)',
    textMuted: 'var(--text-muted, #6b7280)',
    accent: 'var(--accent, #2b6cb8)',
    accentMuted: 'var(--accent-muted, #1e5599)',
    success: 'var(--success, #1a7f37)',
    warning: 'var(--warning, #9a6700)',
    error: 'var(--error, #cf222e)',
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
  topBarHeight: 56,
  chatWidth: 360,
  terminalHeight: 200,
} as const;

export type Tokens = typeof tokens;
