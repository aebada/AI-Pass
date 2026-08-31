import type { Application } from '@ai-pass/marketplace-core';
import type { GitHubAppMetadata } from './types.js';

const GITHUB_STUBS: Record<string, Omit<GitHubAppMetadata, 'appId'>> = {
  'vision-qa-inspector': {
    repoUrl: 'https://github.com/acme-ai/vision-qa-inspector',
    readmeExcerpt:
      '# Vision QA Inspector\n\nComputer vision quality inspection for manufacturing lines. Syncs models and inference configs from GitHub releases.',
    docsUrl: 'https://github.com/acme-ai/vision-qa-inspector/wiki',
    syncStatus: 'synced',
    lastSyncedAt: '2025-06-28T12:00:00Z',
  },
};

export class GitHubAppService {
  getMetadata(app: Application): GitHubAppMetadata | undefined {
    if (app.appType !== 'github_app') return undefined;
    const stub = GITHUB_STUBS[app.slug];
    if (!stub) {
      return {
        appId: app.id,
        repoUrl: `https://github.com/ai-pass/${app.slug}`,
        readmeExcerpt: app.description,
        syncStatus: 'pending',
      };
    }
    return { appId: app.id, ...stub };
  }

  /** Stub: trigger repo sync for GitHub app type */
  syncRepo(appId: string): GitHubAppMetadata {
    return {
      appId,
      repoUrl: `https://github.com/ai-pass/app-${appId}`,
      readmeExcerpt: 'Repository sync initiated.',
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
    };
  }
}
