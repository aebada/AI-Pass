export const BRAND_LOGO_SRC = '/logo.png';
export const BRAND_LOGO_ALT = 'AI-Pass';
export const BRAND_HOME_ARIA_LABEL = 'AI-Pass home';

export type BrandLogoSize = 'nav' | 'hero' | 'sidebar' | 'footer';

/** Horizontal logo (~3:2); height drives nav/sidebar, maxWidth drives hero/footer */
const SIZE_STYLES: Record<BrandLogoSize, { height?: number; maxWidth: number }> = {
  nav: { height: 40, maxWidth: 240 },
  sidebar: { height: 32, maxWidth: 200 },
  hero: { maxWidth: 320 },
  footer: { height: 40, maxWidth: 240 },
};

export interface BrandLogoProps {
  size?: BrandLogoSize;
  src?: string;
  alt?: string;
  className?: string;
}

export function BrandLogo({
  size = 'nav',
  src = BRAND_LOGO_SRC,
  alt = BRAND_LOGO_ALT,
  className,
}: BrandLogoProps) {
  const { height, maxWidth } = SIZE_STYLES[size];

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        height: height ?? 'auto',
        maxWidth,
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
}
