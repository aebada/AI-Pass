import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function baseProps({ size = 20, className, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true as const,
    ...rest,
  };
}

export function IconSun(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5z" />
    </svg>
  );
}

export function IconBell(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.7 1.7 0 0 0 3.4 0" />
    </svg>
  );
}

export function IconWorkspace(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function IconModels(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
    </svg>
  );
}

export function IconAgents(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="5" y="8" width="14" height="11" rx="2" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      <circle cx="9.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="13.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconWorkflows(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <path d="M8.5 7.5 15.5 11M8.5 16.5 15.5 13" />
    </svg>
  );
}

export function IconGovernance(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 3 4 7v5c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V7l-8-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconCode(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M8 8 4 12l4 4M16 8l4 4-4 4M14 4 10 20" />
    </svg>
  );
}

export function IconBook(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 0-2 2V5z" />
      <path d="M6 3v18" />
    </svg>
  );
}

export function IconBuilding(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
      <path d="M16 10h2a2 2 0 0 1 2 2v9" />
      <path d="M8 7h2M8 11h2M8 15h2M12 7h2M12 11h2M12 15h2M4 21h16" />
    </svg>
  );
}

export function IconFactory(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 21h18M4 21V10l6 4V10l6 4V5h4v16" />
    </svg>
  );
}

export function IconHeartPulse(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 12h4l2-5 3 10 2-5h7" />
      <path d="M19.5 6.5a3.5 3.5 0 0 0-5.7-2.7L12 5.4l-1.8-1.6a3.5 3.5 0 0 0-5.7 2.7c0 4.2 7.5 9.6 7.5 9.6s7.5-5.4 7.5-9.6z" opacity="0.35" />
    </svg>
  );
}

export function IconLandmark(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 21h18M5 21V10l7-5 7 5v11" />
      <path d="M9 21v-6h6v6M8 10h8" />
    </svg>
  );
}
