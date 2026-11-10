import { APIError, createAuthMiddleware } from 'better-auth/api';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 100;

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Better Auth checks password length and email uniqueness. This adds the
 * account level checks it does not: a syntactically valid address, a usable
 * display name, and a password that is not simply the address again.
 */
export const validateRegistration = createAuthMiddleware(async (ctx) => {
  if (ctx.path !== '/sign-up/email') return;

  const body = (ctx.body ?? {}) as Record<string, unknown>;
  const email = asString(body.email);
  const name = asString(body.name);
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !EMAIL_PATTERN.test(email) || email.length > MAX_EMAIL_LENGTH) {
    throw new APIError('BAD_REQUEST', { message: 'Enter a valid email address' });
  }

  if (!name) {
    throw new APIError('BAD_REQUEST', { message: 'Name is required' });
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new APIError('BAD_REQUEST', {
      message: `Name must be ${MAX_NAME_LENGTH} characters or fewer`,
    });
  }

  if (password.toLowerCase() === email.toLowerCase()) {
    throw new APIError('BAD_REQUEST', {
      message: 'Password must not be the same as your email address',
    });
  }
});
