import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: { background: 'var(--ai-accent)', color: '#fff', border: 'none' },
  secondary: { background: 'var(--ai-bg-hover)', color: 'var(--ai-text)', border: '1px solid var(--ai-border)' },
  ghost: { background: 'transparent', color: 'var(--ai-text-muted)', border: 'none' },
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
