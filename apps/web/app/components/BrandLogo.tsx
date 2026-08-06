'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './brand-logo.module.css';

/** Static-export-safe brand logo paths */
export const BRAND_LOGO_SRC = '/logo.svg';
export const BRAND_LOGO_SRC_LIGHT = '/logo-light.svg';
export const BRAND_LOGO_ALT = 'AI-Pass';
export const BRAND_HOME_ARIA_LABEL = 'AI-Pass home';

export interface BrandLogoProps {
  height?: number;
  maxWidth?: number;
  className?: string;
  style?: CSSProperties;
  alt?: string;
}

function logoSrcForTheme(theme: string | null): string {
  return theme === 'light' ? BRAND_LOGO_SRC_LIGHT : BRAND_LOGO_SRC;
}

export function BrandLogo({
  height,
  maxWidth,
  className,
  style,
  alt = BRAND_LOGO_ALT,
}: BrandLogoProps) {
  const [src, setSrc] = useState(BRAND_LOGO_SRC);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setSrc(logoSrcForTheme(root.getAttribute('data-theme')));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const imgStyle: CSSProperties = {
    width: 'auto',
    objectFit: 'contain',
    ...(height != null ? { height } : {}),
    ...(maxWidth != null ? { maxWidth } : {}),
    ...style,
  };

  const classes = [styles.logo, className].filter(Boolean).join(' ');

  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export; logo served from /public
    <img src={src} alt={alt} className={classes} style={imgStyle} />
  );
}
