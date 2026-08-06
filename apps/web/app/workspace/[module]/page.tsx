import { defaultModuleRegistry } from '@ai-pass/platform-core';
import { ModulePageClient } from '../../components/workspace/ModulePageClient';

/** Modules with dedicated routes under /workspace/* — skip generic scaffold */
const MODULES_WITH_OWN_PAGE = new Set([
  'workspace',
  'execution',
  'model-hub',
  'playground',
  'digital-twin',
  'automation',
  'skills',
  'monitoring',
  'agents',
  'workflows',
  'knowledge',
  'knowledge-graph',
  'semantic-layer',
  'data-products',
  'analysis',
  'store',
  'discover',
  'marketplace',
  'apps',
  'governance',
  'trust',
  'compliance',
  'presence',
  'wallet',
  'settings',
  'admin',
  'providers',
  'membership',
]);

export function generateStaticParams() {
  return defaultModuleRegistry
    .list()
    .filter((mod) => !MODULES_WITH_OWN_PAGE.has(mod.id))
    .map((mod) => ({ module: mod.id }));
}

export default async function WorkspaceModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module: moduleId } = await params;
  const mod = defaultModuleRegistry.get(moduleId);

  if (!mod) {
    return (
      <ModulePageClient
        title="Module not found"
        description={`No module registered for "${moduleId}"`}
        moduleId={moduleId}
      />
    );
  }

  return (
    <ModulePageClient
      title={mod.name}
      description={mod.description}
      moduleId={mod.id}
      status={mod.status}
      legacyRoute={mod.legacyRoute}
      icon={mod.icon}
    />
  );
}
