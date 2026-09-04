export interface AuthConfig {
  secret: string;
  baseUrl: string;
  trustedOrigins: string[];
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

export function readAuthConfig(): AuthConfig {
  return {
    secret: required('BETTER_AUTH_SECRET'),
    baseUrl: process.env.BETTER_AUTH_URL ?? 'http://localhost:4000',
    trustedOrigins: parseOrigins(process.env.AUTH_TRUSTED_ORIGINS),
  };
}
