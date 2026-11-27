import { defaultModuleRegistry } from '@ai-pass/platform-core';
import { ModulePageClient } from '../../components/workspace/ModulePageClient';
import { existsSync } from 'node:fs';
import path from 'node:path';

/** Modules with a dedicated `workspace/<id>/page.tsx` must not also emit [module] shells. */
function hasDedicatedPage(moduleId: string): boolean {
  const base = path.join(process.cwd(), 'app', 'workspace', moduleId, 'page.tsx');
  return existsSync(base);
}

export function generateStaticParams() {
  return defaultModuleRegistry
    .list()
    .filter((mod) => !hasDedicatedPage(mod.id))
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
