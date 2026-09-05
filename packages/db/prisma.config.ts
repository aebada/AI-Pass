import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// The repository keeps one .env at the root, and the CLI runs from this
// package. Existing environment variables win, so CI needs no .env file.
config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  // Omitted when unset so that `prisma generate` runs without a database.
  // Migration commands still fail loudly without it.
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
