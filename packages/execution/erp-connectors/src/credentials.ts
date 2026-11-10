import type { ERPCredentials } from './types.js';

declare const process: { env: Record<string, string | undefined> };

/**
 * Resolves credential values from environment variables or vault key references.
 * Never log or persist resolved secrets.
 */
export function resolveCredentialRef(ref: string | undefined): string | undefined {
  if (!ref) return undefined;
  if (ref.startsWith('env:')) {
    const key = ref.slice(4);
    return process.env[key];
  }
  return process.env[ref];
}

export function resolveCredentials(credentials: ERPCredentials): {
  clientSecret?: string;
  apiKey?: string;
  refreshToken?: string;
  password?: string;
} {
  return {
    clientSecret: resolveCredentialRef(credentials.clientSecretRef),
    apiKey: resolveCredentialRef(credentials.apiKeyRef),
    refreshToken: resolveCredentialRef(credentials.refreshTokenRef),
    password: resolveCredentialRef(credentials.passwordRef),
  };
}

export function hasRequiredCredentials(
  credentials: ERPCredentials,
  requiredRefs: Array<keyof ERPCredentials>,
): boolean {
  for (const key of requiredRefs) {
    const value = credentials[key];
    if (value === undefined || value === '') return false;
  }
  return true;
}
