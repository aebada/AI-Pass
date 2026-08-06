import Link from 'next/link';
import type { ComponentProps } from 'react';
import { BrandLogo, BRAND_HOME_ARIA_LABEL, type BrandLogoProps } from './BrandLogo';

type BrandLogoLinkProps = Omit<BrandLogoProps, 'alt'> &
  Pick<ComponentProps<typeof Link>, 'onClick'> & {
    className?: string;
    logoClassName?: string;
  };

export function BrandLogoLink({
  className,
  logoClassName,
  onClick,
  ...logoProps
}: BrandLogoLinkProps) {
  return (
    <Link href="/" className={className} aria-label={BRAND_HOME_ARIA_LABEL} onClick={onClick}>
      <BrandLogo alt="" className={logoClassName} {...logoProps} />
    </Link>
  );
}
