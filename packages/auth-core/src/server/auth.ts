import { getPrisma } from '@ai-pass/db';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { readAuthConfig } from './config.js';
import { ac, roles } from './permissions.js';
import { resolveSessionContext } from './provisioning.js';

const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;
const SESSION_REFRESH_SECONDS = 60 * 60 * 24;
const MIN_PASSWORD_LENGTH = 12;
const MAX_WORKSPACES_PER_ORGANIZATION = 25;

export function createAuth() {
  const config = readAuthConfig();

  return betterAuth({
    appName: 'AI-Pass',
    database: prismaAdapter(getPrisma(), { provider: 'postgresql' }),
    secret: config.secret,
    baseURL: config.baseUrl,
    trustedOrigins: config.trustedOrigins,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
      autoSignIn: false,
    },
    session: {
      expiresIn: SESSION_LIFETIME_SECONDS,
      updateAge: SESSION_REFRESH_SECONDS,
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customRules: {
        '/sign-in/email': { window: 60, max: 5 },
        '/sign-up/email': { window: 3600, max: 10 },
      },
    },
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            const context = await resolveSessionContext(session.userId);
            return {
              data: {
                ...session,
                activeOrganizationId: context.organizationId,
                activeTeamId: context.teamId,
              },
            };
          },
        },
      },
    },
    plugins: [
      organization({
        ac,
        roles,
        teams: {
          enabled: true,
          maximumTeams: MAX_WORKSPACES_PER_ORGANIZATION,
          allowRemovingAllTeams: false,
        },
      }),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
export type Session = Auth['$Infer']['Session'];
export type SessionUser = Session['user'];

let instance: Auth | undefined;

export function getAuth(): Auth {
  instance ??= createAuth();
  return instance;
}
