export const BRAND_LOGO_SRC = '/logo.svg';
export const BRAND_LOGO_LIGHT_SRC = '/logo-light.svg';
export const BRAND_LOGO_ICON_SRC = '/logo-icon.svg';
export const BRAND_LOGO_ALT = 'AI-Pass';
export const BRAND_HOME_ARIA_LABEL = 'AI-Pass home';

export type BrandLogoSize = 'nav' | 'hero' | 'sidebar' | 'footer';
export type BrandLogoVariant = 'wordmark' | 'icon';

/** Horizontal logo (~4.2:1); height drives nav/sidebar, maxWidth drives hero/footer */
const SIZE_STYLES: Record<BrandLogoSize, { height?: number; maxWidth: number }> = {
  nav: { height: 40, maxWidth: 200 },
  sidebar: { height: 32, maxWidth: 168 },
  hero: { maxWidth: 320 },
  footer: { height: 40, maxWidth: 200 },
};

export interface BrandLogoProps {
  size?: BrandLogoSize;
  variant?: BrandLogoVariant;
  src?: string;
  /** Picks logo.svg vs logo-light.svg when src is omitted */
  theme?: 'dark' | 'light';
  alt?: string;
  className?: string;
}

function logoSrcForTheme(theme: 'dark' | 'light' | undefined): string {
  return theme === 'light' ? BRAND_LOGO_LIGHT_SRC : BRAND_LOGO_SRC;
}

export function BrandLogo({
  size = 'nav',
  variant = 'wordmark',
  src,
  theme,
  alt = BRAND_LOGO_ALT,
  className,
}: BrandLogoProps) {
  const resolvedSrc = src ?? logoSrcForTheme(theme);
  const { height, maxWidth } = SIZE_STYLES[size];
  const iconSize = height ?? 32;

  return (
    <img
      src={variant === 'icon' ? BRAND_LOGO_ICON_SRC : resolvedSrc}
      alt={alt}
      className={className}
      style={{
        height: variant === 'icon' ? iconSize : (height ?? 'auto'),
        maxWidth: variant === 'icon' ? iconSize : maxWidth,
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}
