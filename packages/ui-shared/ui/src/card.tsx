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
    background: 'var(--ai-bg-elevated, #161b22)',
    border: '1px solid var(--ai-border, #30363d)',
  },
  glass: {
    background: 'rgba(22, 27, 34, 0.65)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
  },
  elevated: {
    background: 'var(--ai-bg-elevated, #161b22)',
    border: '1px solid var(--ai-border, #30363d)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
  },
  gradient: {
    background: 'linear-gradient(160deg, rgba(31, 111, 235, 0.12) 0%, var(--ai-bg-elevated, #161b22) 55%)',
    border: '1px solid rgba(88, 166, 255, 0.3)',
    boxShadow: '0 8px 32px rgba(88, 166, 255, 0.08)',
  },
  outline: {
    background: 'transparent',
    border: '1px dashed var(--ai-border, #30363d)',
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
        transition: hover ? 'border-color 0.25s, transform 0.25s, box-shadow 0.25s' : undefined,
        ...variantStyles[variant],
        ...style,
      }}
      onMouseEnter={
        hover
          ? (e) => {
              const el = e.currentTarget;
              el.style.borderColor = 'rgba(88, 166, 255, 0.45)';
              el.style.transform = 'translateY(-2px)';
              el.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.25)';
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              const el = e.currentTarget;
              Object.assign(el.style, {
                borderColor: '',
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
