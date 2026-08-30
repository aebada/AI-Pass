'use client';

import type { CSSProperties } from 'react';
import { useApp } from './premium/AppProviders';

/** Sharp vector wordmark for nav/footer (not the marketing banner PNG). */
export const BRAND_LOGO_SRC = '/logo.svg';
export const BRAND_LOGO_LIGHT_SRC = '/logo-light.svg';
export const BRAND_LOGO_ICON_SRC = '/logo-icon.svg';
/** Full-bleed brand banner — use for OG/social, not nav chrome. */
export const BRAND_BANNER_SRC = '/brand-banner.png';
export const BRAND_LOGO_ALT = 'AI-Pass';
export const BRAND_HOME_ARIA_LABEL = 'AI-Pass home';

export interface BrandLogoProps {
  height?: number;
  maxWidth?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
  /** Force a specific asset; defaults to theme-aware wordmark. */
  src?: string;
}

export function BrandLogo({
  height,
  maxWidth,
  className,
  style,
  alt = BRAND_LOGO_ALT,
  src,
}: BrandLogoProps) {
  const { resolvedTheme } = useApp();
  const resolvedSrc =
    src ?? (resolvedTheme === 'light' ? BRAND_LOGO_LIGHT_SRC : BRAND_LOGO_SRC);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export; logo served from /public
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      style={{
        width: 'auto',
        display: 'block',
        objectFit: 'contain',
        ...(height != null ? { height } : {}),
        ...(maxWidth != null ? { maxWidth } : {}),
        ...style,
      }}
    />
  );
}
