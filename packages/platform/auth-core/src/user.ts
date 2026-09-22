import type { AuthProviderType } from './types.js';

/** Authenticated user profile shared across apps. */
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  provider: AuthProviderType;
  roles?: string[];
  tenantId?: string;
}

export interface GoogleAuthProvider {
  type: 'google';
  enabled: boolean;
  label: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  redirectUri: string;
}

export interface MicrosoftAuthProvider {
  type: 'microsoft';
  enabled: boolean;
  label: string;
  clientId: string;
  clientSecret: string;
  tenantId?: string;
  scopes: string[];
  redirectUri: string;
}

export type OAuthProviderConfig = GoogleAuthProvider | MicrosoftAuthProvider;
