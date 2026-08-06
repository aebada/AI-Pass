import type { CSSProperties, ReactNode } from 'react';

export type CardVariant = 'default' | 'glass' | 'elevated' | 'gradient' | 'outline';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, CSSProperties> = {
  default: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
  },
  glass: {
    background: 'color-mix(in srgb, var(--bg-elevated) 65%, transparent)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid var(--border)',
    boxShadow: '0 8px 32px color-mix(in srgb, var(--text) 8%, transparent)',
  },
  elevated: {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    boxShadow: '0 12px 40px color-mix(in srgb, var(--text) 10%, transparent)',
  },
  gradient: {
    background:
      'linear-gradient(160deg, color-mix(in srgb, var(--accent) 12%, transparent) 0%, var(--bg-elevated) 55%)',
    border: '1px solid var(--accent-border)',
    boxShadow: '0 8px 32px color-mix(in srgb, var(--accent) 8%, transparent)',
  },
  outline: {
    background: 'transparent',
    border: '1px dashed var(--border)',
  },
};

const paddingMap = { sm: 16, md: 24, lg: 32 };

export function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  style,
  className,
  onClick,
}: CardProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={className}
      onClick={onClick}
      style={{
        borderRadius: 12,
        padding: paddingMap[padding],
        textAlign: 'left',
        color: 'inherit',
        fontFamily: 'inherit',
        cursor: onClick ? 'pointer' : undefined,
        transition: hover ? 'border-color 0.2s, background 0.2s' : undefined,
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(88, 166, 255, 0.4)';
              el.style.background = 'var(--bg-hover)';
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              const el = e.currentTarget;
              Object.assign(el.style, {
                borderColor: '',
                background: '',
                transform: '',
                boxShadow: variantStyles[variant].boxShadow ?? '',
              });
            }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
