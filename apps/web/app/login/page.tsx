'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { authApiUrl, authCallbackQuery, useLaravelAuth } from '@/lib/auth-api';
import { PremiumNav } from '../components/premium/PremiumNav';
import styles from './login.module.css';

const usePhpAuth = process.env.NEXT_PUBLIC_USE_PHP_AUTH === '1';
const useLaravelAuth = process.env.NEXT_PUBLIC_USE_LARAVEL_AUTH === '1';
const useServerAuth = usePhpAuth || useLaravelAuth;

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/workspace';
  const error = searchParams.get('error');
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    if (useLaravelAuth) {
      window.location.href = authApiUrl(`/auth/google${authCallbackQuery(callbackUrl)}`);
      return;
    }
    if (usePhpAuth) {
      const params = callbackUrl !== '/workspace' ? `?callback=${encodeURIComponent(callbackUrl)}` : '';
      window.location.href = `/auth/google.php${params}`;
      return;
    }
    setLoading(true);
    await signIn('google', { callbackUrl });
  }

  const emailLoginHref = useLaravelAuth
    ? authApiUrl(`/auth/login${authCallbackQuery(callbackUrl)}`)
    : `/auth/login.php${
        callbackUrl !== '/workspace' ? `?callback=${encodeURIComponent(callbackUrl)}` : ''
      }`;

  const registerHref = useLaravelAuth
    ? authApiUrl(`/auth/register${authCallbackQuery(callbackUrl)}`)
    : '/auth/register.php';

  if (useLaravelAuth || usePhpAuth) {
    return (
      <div className={styles.page}>
        <PremiumNav variant="landing" />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.badge}>Secure sign-in</div>
            <h1 className={styles.title}>Welcome to AI-Pass</h1>
            <p className={styles.subtitle}>
              Sign in with Google or email to get 500 free credits and access the AI Playground.
            </p>
            {error && (
              <div className={styles.error} role="alert">
                {error === 'desktop_browser'
                  ? 'Complete Google sign-in in your browser, then return here — the IDE will finish automatically.'
                  : error === 'google_state'
                    ? 'Sign-in session expired. Click Continue with Google and try again.'
                    : 'Sign-in failed. Please try again.'}
              </div>
            )}
            <button
              type="button"
              className={styles.googleBtn}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon />
              {loading ? 'Redirecting…' : 'Continue with Google'}
            </button>
            <p className={styles.hint}>
              <a href={emailLoginHref}>Email sign-in</a>
              {' · '}
              <a href={registerHref}>Create account</a>
            </p>
            <p className={styles.legal}>
              By continuing, you agree to AI-Pass terms and privacy policy.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PremiumNav variant="landing" />

      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.badge}>Secure sign-in</div>
          <h1 className={styles.title}>Welcome to AI-Pass</h1>
          <p className={styles.subtitle}>
            Sign in with Google to get 500 free credits and access the AI Playground.
          </p>

          {error && (
            <div className={styles.error} role="alert">
              Sign-in failed. Check your OAuth credentials and try again.
            </div>
          )}

          <button
            type="button"
            className={styles.googleBtn}
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleIcon />
            {loading ? 'Redirecting…' : 'Continue with Google'}
          </button>

          <p className={styles.hint}>
            Configure Google OAuth in your Cloud Console (e.g. Sportify project). See repository{' '}
            <code>docs/AUTH.md</code> for setup steps.
          </p>

          <p className={styles.legal}>
            By continuing, you agree to AI-Pass terms and privacy policy.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.page} style={{ minHeight: '100vh' }} />}>
      <LoginContent />
    </Suspense>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
