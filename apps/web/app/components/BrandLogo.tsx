'use client';

import { useId, type CSSProperties } from 'react';

/** Icon mark path (SVG) for favicons / compact UI */
export const BRAND_LOGO_ICON_SRC = '/logo-icon.svg';
/** Full wordmark SVG (fallback / OG / email) */
export const BRAND_LOGO_SRC = '/logo.svg';
export const BRAND_LOGO_ALT = 'AI-Pass';
export const BRAND_HOME_ARIA_LABEL = 'AI-Pass home';

export interface BrandLogoProps {
  height?: number;
  maxWidth?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  /** Compact mark-only (no wordmark) */
  markOnly?: boolean;
}

/**
 * Professional brand logo: Hostinger-style purple mark + crisp HTML wordmark.
 * Prefer this over the old photographic / neon PNG.
 */
export function BrandLogo({
  height = 36,
  maxWidth,
  className,
  style,
  alt = BRAND_LOGO_ALT,
  markOnly = false,
}: BrandLogoProps) {
  const gradId = useId().replace(/:/g, '');
  const markSize = height;
  return (
    <span
      className={className}
      role="img"
      aria-label={alt}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: Math.max(8, Math.round(height * 0.28)),
        height,
        maxWidth,
        lineHeight: 1,
        ...style,
      }}
    >
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        style={{ flexShrink: 0, borderRadius: Math.round(markSize * 0.25) }}
      >
        <defs>
          <linearGradient id={gradId} x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="#7C5CFC" />
            <stop offset="1" stopColor="#673DE6" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill={`url(#${gradId})`} />
        <path d="M12 20h10.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
        <path
          d="M17.5 13.5 27 20l-9.5 6.5"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22.5 13.5 32 20l-9.5 6.5"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.55"
        />
      </svg>
      {!markOnly ? (
        <span
          style={{
            fontFamily: 'var(--font-sans, "DM Sans", Inter, system-ui, sans-serif)',
            fontWeight: 700,
            fontSize: Math.round(height * 0.58),
            letterSpacing: '-0.045em',
            color: 'currentColor',
            whiteSpace: 'nowrap',
          }}
        >
          AI-Pass
        </span>
      ) : null}
    </span>
  );
}
