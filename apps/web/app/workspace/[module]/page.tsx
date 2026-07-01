import { defaultModuleRegistry } from '@ai-pass/platform-core';
import { ModulePageClient } from '../../components/workspace/ModulePageClient';

export function generateStaticParams() {
  return defaultModuleRegistry.list().map((mod) => ({ module: mod.id }));
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
