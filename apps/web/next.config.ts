import type { NextConfig } from 'next';

const isStaticExport = process.env.STATIC_EXPORT === '1';
const isNodeDeploy = process.env.DEPLOY_NODE === '1';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@ai-pass/ui',
    '@ai-pass/editor',
    '@ai-pass/shared',
    '@ai-pass/auth-core',
    '@ai-pass/agent',
    '@ai-pass/ai-core',
    '@ai-pass/indexer',
    '@ai-pass/platform-core',
    '@ai-pass/platform-api',
    '@ai-pass/provider-hub',
    '@ai-pass/membership',
    '@ai-pass/wallet',
    '@ai-pass/livesync',
    '@ai-pass/trust',
    '@ai-pass/store',
    '@ai-pass/store-api',
    '@ai-pass/marketplace-core',
    '@ai-pass/marketplace-runtime',
    '@ai-pass/marketplace',
    '@ai-pass/governance',
    '@ai-pass/knowledge-pipeline',
    '@ai-pass/agent-studio',
    '@ai-pass/presence-audit',
    '@ai-pass/view',
    '@ai-pass/verticals',
    '@ai-pass/invoice-ai',
    '@ai-pass/supply-chain-ai',
    '@ai-pass/erp-connectors',
    '@ai-pass/customer-support-ai',
    '@ai-pass/sales-ai',
    '@ai-pass/content-ai',
    '@ai-pass/crm-connectors',
    '@ai-pass/requirements',
    '@ai-pass/model-hub',
  ],
  reactStrictMode: true,
  ...(isStaticExport
    ? {
        output: 'export' as const,
        distDir: process.env.NEXT_DIST_DIR ?? '.next',
        typescript: { ignoreBuildErrors: true },
        eslint: { ignoreDuringBuilds: true },
        experimental: {
          staticGenerationMaxConcurrency: 1,
          cpus: 1,
        },
        webpack: (config) => {
          config.cache = false;
          return config;
        },
      }
    : {}),
  ...(isNodeDeploy
    ? {
        output: 'standalone' as const,
        typescript: { ignoreBuildErrors: true },
        eslint: { ignoreDuringBuilds: true },
      }
    : {}),
};

export default nextConfig;
