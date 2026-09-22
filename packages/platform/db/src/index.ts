import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';

export * from './generated/prisma/client.js';

let client: PrismaClient | undefined;

/** Lazy so that importing this package does not require DATABASE_URL at module load. */
export function getPrisma(): PrismaClient {
  if (client) return client;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  return client;
}

export async function disconnectPrisma(): Promise<void> {
  await client?.$disconnect();
  client = undefined;
}
