import type { CSSProperties } from 'react';

/** Static-export-safe brand logo path */
export const BRAND_LOGO_SRC = '/logo.png';
export const BRAND_LOGO_ALT = 'AI-Pass';
export const BRAND_HOME_ARIA_LABEL = 'AI-Pass home';

export interface BrandLogoProps {
  height?: number;
  maxWidth?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}

export function BrandLogo({
  height,
  maxWidth,
  className,
  style,
  alt = BRAND_LOGO_ALT,
}: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export; logo served from /public
    <img
      src={BRAND_LOGO_SRC}
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
