/** External AI-Pass ecosystem projects hosted outside the main workspace. */

export interface ExternalProjectLink {
  id: string;
  label: string;
  url: string;
  description?: string;
  icon?: string;
  /** Related in-platform module route, when applicable */
  moduleRoute?: string;
}

export const EXTERNAL_PROJECT_LINKS: ExternalProjectLink[] = [
  {
    id: 'invoice-ai',
    label: 'Invoice AI',
    url: 'https://invoice.ehopn.com',
    description: 'Production Invoice AI deployment',
    icon: 'receipt',
    moduleRoute: '/workspace/apps/invoice-ai',
  },
  {
    id: 'carbon',
    label: 'Carbon',
    url: 'https://carbon.ehopn.com',
    description: 'Carbon platform',
    icon: 'layers',
  },
  {
    id: 'sovra-ai',
    label: 'Sovra AI',
    url: 'https://sovraai.de',
    description: 'Sovra AI platform',
    icon: 'sparkles',
  },
];

export function getExternalProject(id: string): ExternalProjectLink | undefined {
  return EXTERNAL_PROJECT_LINKS.find((p) => p.id === id);
}
