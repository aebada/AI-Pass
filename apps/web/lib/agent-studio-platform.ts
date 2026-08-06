import { createAgentStudioPlatform } from '@ai-pass/agent-studio';
import { getMarketplaceRuntime } from '@ai-pass/marketplace-runtime';

let _studio: ReturnType<typeof createAgentStudioPlatform> | null = null;

export function getWebAgentStudio() {
  if (!_studio) {
    const marketplace = getMarketplaceRuntime();
    _studio = createAgentStudioPlatform({
      skillRegistry: marketplace.skills,
      skillExecutor: marketplace.executor,
      seed: true,
    });
  }
  return _studio;
}
