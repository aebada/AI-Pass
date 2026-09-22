import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    env: {
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? 'integration-test-secret-value',
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4000',
      AUTH_TRUSTED_ORIGINS: process.env.AUTH_TRUSTED_ORIGINS ?? 'http://localhost:3000',
      AUTH_DISABLE_RATE_LIMIT: 'true',
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});
