export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
}

export interface AuthConfig {
  secret: string;
  baseUrl: string;
  trustedOrigins: string[];
  google: GoogleConfig | null;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

function parseOrigins(value: string | undefined): string[] {
  return (value ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/** Google stays optional so that a developer can run the stack without it. */
function readGoogleConfig(): GoogleConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  return { clientId, clientSecret };
}

export function readAuthConfig(): AuthConfig {
  return {
    secret: required('BETTER_AUTH_SECRET'),
    baseUrl: process.env.BETTER_AUTH_URL ?? 'http://localhost:4000',
    trustedOrigins: parseOrigins(process.env.AUTH_TRUSTED_ORIGINS),
    google: readGoogleConfig(),
  };
}
