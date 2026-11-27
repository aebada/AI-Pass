import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PLATFORM_MODULES, type PlatformModuleId } from '@ai-pass/view';

/** Map legacy /platform/* JSON stubs to real workspace product surfaces. */
const WORKSPACE_ROUTES: Partial<Record<PlatformModuleId | string, string>> = {
  workspace: '/workspace',
  requirements: '/workspace/requirements',
  'builder-studio': '/workspace/builder',
  solutions: '/workspace/solutions',
  'solution-marketplace': '/workspace/marketplace',
  store: '/workspace/store',
  marketplace: '/workspace/marketplace',
  'agent-studio': '/workspace/agents',
  trust: '/workspace/trust',
  governance: '/workspace/governance',
  'knowledge-pipeline': '/workspace/knowledge',
  livesync: '/workspace/workflows/livesync',
  'presence-audit': '/workspace/presence',
  'invoice-ai': '/workspace/apps/invoice-ai',
  'supply-chain': '/workspace/apps/supply-chain-ai',
  'customer-support': '/workspace/apps/customer-support-ai',
  lifecycle: '/workspace/lifecycle',
  'data-products': '/workspace/data-products',
};

export function generateStaticParams() {
  return PLATFORM_MODULES.filter((m) => m.id !== 'workspace').map((m) => ({ module: m.id }));
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleId } = await params;
  const target = WORKSPACE_ROUTES[moduleId];
  if (target) {
    redirect(target);
  }

  const mod = PLATFORM_MODULES.find((m) => m.id === moduleId);
  if (!mod) {
    return (
      <div style={{ padding: 32, color: '#e6edf3', background: '#0d1117', minHeight: '100vh' }}>
        <p>Module not found</p>
        <Link href="/platform" style={{ color: '#58a6ff' }}>
          Back to platform
        </Link>
      </div>
    );
  }

  // Fallback for any unmapped module: send users to workspace home, not a JSON stub.
  redirect('/workspace');
}
