import { createId } from '@ai-pass/shared';
import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthProviderConfig,
  AuthProviderType,
  AuthSession,
} from './types.js';
import { AUTH_PROVIDERS } from './types.js';

export class AuthService {
  private sessions = new Map<string, AuthSession>();

  listProviders(): AuthProviderConfig[] {
    return AUTH_PROVIDERS.filter((p) => p.enabled);
  }

  async login(request: AuthLoginRequest): Promise<AuthLoginResponse> {
    switch (request.provider) {
      case 'google':
      case 'microsoft':
        return {
          status: 'redirect',
          redirectUrl: `https://auth.stub.ai-pass.local/${request.provider}?state=${createId()}`,
        };
      case 'sso':
        return {
          status: 'redirect',
          redirectUrl: `https://sso.example.com/authorize?entity=${request.ssoEntityId ?? 'default'}`,
        };
      case 'email': {
        if (!request.email) {
          return { status: 'failed', error: 'Email required' };
        }
        const session = this.createSession(request.email, 'email');
        return { status: 'authenticated', session };
      }
      default:
        return { status: 'failed', error: 'Unknown provider' };
    }
  }

  getSession(userId: string): AuthSession | undefined {
    return this.sessions.get(userId);
  }

  private createSession(email: string, provider: AuthProviderType): AuthSession {
    const now = new Date();
    const expires = new Date(now.getTime() + 86400_000 * 7);
    const session: AuthSession = {
      userId: `usr_${createId()}`,
      email,
      provider,
      authenticatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      tenantId: 'demo-tenant',
      roles: ['user'],
    };
    this.sessions.set(session.userId, session);
    return session;
  }
}

export const defaultAuthService = new AuthService();
