import { getPrisma } from '@ai-pass/db';
import request from 'supertest';
import type { Express } from 'express';

export const PASSWORD = 'correct-horse-battery-staple';

// CASCADE makes the order irrelevant, but listing every table keeps a newly
// added one from being silently left behind between tests.
const TABLES = [
  'audit_log',
  'workspace_settings',
  'team_member',
  'team',
  'invitation',
  'member',
  'organization',
  'verification',
  'account',
  'session',
  'user',
];

export async function resetDatabase(): Promise<void> {
  const quoted = TABLES.map((table) => `"${table}"`).join(', ');
  await getPrisma().$executeRawUnsafe(`TRUNCATE TABLE ${quoted} RESTART IDENTITY CASCADE`);
}

export type Agent = ReturnType<typeof request.agent>;

export function agentFor(app: Express): Agent {
  return request.agent(app);
}

export function register(agent: Agent, email: string, name = 'Test Person', password = PASSWORD) {
  return agent.post('/api/auth/sign-up/email').send({ email, name, password });
}

export function signIn(agent: Agent, email: string, password = PASSWORD) {
  return agent.post('/api/auth/sign-in/email').send({ email, password });
}

/** Registers, signs in, and returns the caller's own /api/v1/me payload. */
export async function signedInAgent(app: Express, email: string, name?: string) {
  const agent = agentFor(app);
  await register(agent, email, name);
  await signIn(agent, email);
  const me = await agent.get('/api/v1/me');
  return { agent, me: me.body as MePayload };
}

export interface MePayload {
  user: { id: string; email: string; name?: string | null };
  organizationId: string | null;
  role: string | null;
  workspaces: Array<{ id: string; name: string }>;
}
