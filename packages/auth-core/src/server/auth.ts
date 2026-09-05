import { getPrisma } from '@ai-pass/db';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { betterAuth } from 'better-auth';
import { organization } from 'better-auth/plugins';
import { recordAuditEvent } from './audit.js';
import { readAuthConfig } from './config.js';
import { ac, roles } from './permissions.js';
import { resolveSessionContext } from './provisioning.js';

const SESSION_LIFETIME_SECONDS = 60 * 60 * 24 * 7;
const SESSION_REFRESH_SECONDS = 60 * 60 * 24;
const MIN_PASSWORD_LENGTH = 12;
const MAX_WORKSPACES_PER_ORGANIZATION = 25;

// Plugin added session columns are loosely typed on the hook payload.
function asId(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

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
    socialProviders: config.google ? { google: config.google } : {},
    account: {
      // Linking Google to an existing password account is only safe once the
      // password side proves the address too. Until email verification is
      // delivered, someone could register with an address they do not own and
      // be linked to its real owner when that owner signs in with Google.
      accountLinking: {
        enabled: false,
      },
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
      user: {
        create: {
          after: async (user) => {
            await recordAuditEvent({
              action: 'auth.user.created',
              actorUserId: user.id,
              targetType: 'user',
              targetId: user.id,
            });
          },
        },
      },
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
          after: async (session) => {
            await recordAuditEvent({
              action: 'auth.session.created',
              actorUserId: session.userId,
              organizationId: asId(session.activeOrganizationId),
              teamId: asId(session.activeTeamId),
              ipAddress: session.ipAddress ?? null,
              userAgent: session.userAgent ?? null,
            });
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
        organizationHooks: {
          afterCreateInvitation: async ({ invitation, inviter, organization }) => {
            await recordAuditEvent({
              action: 'organization.invitation.created',
              actorUserId: inviter.user.id,
              organizationId: organization.id,
              targetType: 'invitation',
              targetId: invitation.id,
              detail: { email: invitation.email, role: invitation.role ?? 'member' },
            });
          },
          afterAcceptInvitation: async ({ invitation, member, organization }) => {
            await recordAuditEvent({
              action: 'organization.invitation.accepted',
              actorUserId: member.userId,
              organizationId: organization.id,
              targetType: 'member',
              targetId: member.id,
              detail: { invitationId: invitation.id, role: member.role },
            });
          },
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
