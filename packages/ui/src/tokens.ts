export const tokens = {
  colors: {
    bg: 'var(--bg, #f6f3eb)',
    bgElevated: 'var(--bg-elevated, #ffffff)',
    bgHover: 'var(--bg-hover, #efece4)',
    border: 'var(--border, #d6d2c8)',
    text: 'var(--text, #1f1f1f)',
    textMuted: 'var(--text-muted, #727272)',
    accent: 'var(--accent, #343ced)',
    accentMuted: 'var(--accent-muted, #131bd4)',
    success: 'var(--success, #0f9f6e)',
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
