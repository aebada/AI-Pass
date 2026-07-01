export type AuthProviderType = 'google' | 'microsoft' | 'email' | 'sso';

export type SsoProtocol = 'saml' | 'oidc' | 'oauth2';

export interface AuthProviderConfig {
  type: AuthProviderType;
  enabled: boolean;
  label: string;
  clientId?: string;
  scopes?: string[];
  ssoProtocol?: SsoProtocol;
  issuerUrl?: string;
  metadataUrl?: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  name?: string;
  image?: string;
  provider: AuthProviderType;
  authenticatedAt: string;
  expiresAt: string;
  tenantId?: string;
  roles: string[];
}

export interface AuthLoginRequest {
  provider: AuthProviderType;
  email?: string;
  password?: string;
  redirectUri?: string;
  ssoEntityId?: string;
}

export interface AuthLoginResponse {
  status: 'authenticated' | 'redirect' | 'pending_mfa' | 'failed';
  session?: AuthSession;
  redirectUrl?: string;
  error?: string;
}

/** Provider metadata for UI; OAuth secrets live in server env (see apps/web). */
export const AUTH_PROVIDERS: AuthProviderConfig[] = [
  {
    type: 'google',
    enabled: true,
    label: 'Google',
    scopes: ['openid', 'email', 'profile'],
  },
  {
    type: 'microsoft',
    enabled: false,
    label: 'Microsoft',
    scopes: ['openid', 'email', 'profile'],
  },
  {
    type: 'email',
    enabled: true,
    label: 'Email & Password',
  },
  {
    type: 'sso',
    enabled: true,
    label: 'Enterprise SSO',
    ssoProtocol: 'oidc',
    issuerUrl: 'https://sso.example.com',
    metadataUrl: 'https://sso.example.com/.well-known/openid-configuration',
  },
];
