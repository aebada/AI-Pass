import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: { background: 'var(--accent, var(--ai-accent))', color: '#fff', border: 'none' },
  secondary: {
    background: 'var(--bg-elevated, var(--ai-bg-elevated))',
    color: 'var(--text, var(--ai-text))',
    border: '1px solid var(--border, var(--ai-border))',
  },
  ghost: { background: 'transparent', color: 'var(--text-muted, var(--ai-text-muted))', border: 'none' },
};

export function Button({
  variant = 'secondary',
  size = 'md',
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      style={{
        fontFamily: 'var(--ai-font)',
        borderRadius: 'var(--ai-radius)',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.5 : 1,
        padding: size === 'sm' ? '4px 10px' : '8px 14px',
        fontSize: size === 'sm' ? 12 : 14,
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
