'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const DigitalTwinWidget = dynamic(
  () =>
    import('../twin/components/DigitalTwinWidget').then((mod) => ({
      default: mod.DigitalTwinWidget,
    })),
  { ssr: false },
);

/** Mounts the floating Digital Twin on workspace routes (client-only). */
export function DigitalTwinWidgetHost() {
  const pathname = usePathname();

  if (pathname === '/workspace/twin') {
    return null;
  }

  return <DigitalTwinWidget />;
}
