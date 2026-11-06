import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { defaultModuleRegistry } from '@ai-pass/platform-core';
import { ModulePageClient } from '../../components/workspace/ModulePageClient';

/** Skip modules that already have apps/web/app/workspace/<id>/page.tsx */
function dedicatedWorkspaceModules(): Set<string> {
  const dir = path.join(process.cwd(), 'app/workspace');
  const skip = new Set<string>();
  try {
    for (const name of readdirSync(dir)) {
      if (name.startsWith('[')) continue;
      if (existsSync(path.join(dir, name, 'page.tsx'))) skip.add(name);
    }
  } catch {
    // build-time only
  }
  return skip;
}

export function generateStaticParams() {
  const dedicated = dedicatedWorkspaceModules();
  return defaultModuleRegistry
    .list()
    .filter((mod) => !dedicated.has(mod.id))
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
