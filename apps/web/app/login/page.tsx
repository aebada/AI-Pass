'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { authApiUrl, useLaravelAuth } from '@/lib/auth-api';
import { PremiumNav } from '../components/premium/PremiumNav';
import styles from './login.module.css';

const usePhpAuth = process.env.NEXT_PUBLIC_USE_PHP_AUTH === '1';

declare global {
  interface Window {
    aiPassIde?: {
      openExternal: (url: string) => Promise<void>;
      getAppVersion?: () => Promise<string>;
    };
  }
}

function isIdeShell(): boolean {
  return typeof window !== 'undefined' && Boolean(window.aiPassIde);
}

function googleAuthStartUrl(callbackUrl: string): string {
  const params = new URLSearchParams();
  if (callbackUrl && callbackUrl !== '/workspace') {
    params.set('callback', callbackUrl);
  } else {
    params.set('callback', '/workspace');
  }
  if (isIdeShell()) {
    params.set('desktop', '1');
  }
  const qs = params.toString();
  if (useLaravelAuth) {
    return authApiUrl(`/auth/google${qs ? `?${qs}` : ''}`);
  }
  if (usePhpAuth) {
    return `/auth/google.php${qs ? `?${qs}` : ''}`;
  }
  return '';
}

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/workspace';
  const error = searchParams.get('error');
  const [loading, setLoading] = useState(false);
  const [inIde, setInIde] = useState(false);

  useEffect(() => {
    setInIde(isIdeShell());
  }, []);

  async function handleGoogleSignIn() {
    if (useLaravelAuth || usePhpAuth) {
      const url = googleAuthStartUrl(callbackUrl);
      // IDE: never navigate in-app to Google — Electron Chromium gets Google HTTP 500.
      if (isIdeShell() && window.aiPassIde?.openExternal) {
        setLoading(true);
        try {
          await window.aiPassIde.openExternal(url);
        } finally {
          setLoading(false);
        }
        return;
      }
      window.location.href = url;
      return;
    }
    setLoading(true);
    await signIn('google', { callbackUrl });
  }

  const emailLoginHref = useLaravelAuth
    ? authApiUrl(
        `/auth/login${callbackUrl !== '/workspace' ? `?callback=${encodeURIComponent(callbackUrl)}` : ''}`,
      )
    : `/auth/login.php${
        callbackUrl !== '/workspace' ? `?callback=${encodeURIComponent(callbackUrl)}` : ''
      }`;

  const registerHref = useLaravelAuth
    ? authApiUrl(
        `/auth/register${callbackUrl !== '/workspace' ? `?callback=${encodeURIComponent(callbackUrl)}` : ''}`,
      )
    : '/auth/register.php';

  const errorMessage =
    error === 'desktop_browser'
      ? 'Finish Google sign-in in your system browser. When it asks to open AI-Pass IDE, allow it — then you will return here signed in.'
      : error === 'google_state'
        ? 'Sign-in session expired. Please try Google again.'
        : error
          ? 'Sign-in failed. Please try again.'
          : null;

  if (useLaravelAuth || usePhpAuth) {
    return (
      <div className={styles.page}>
        <PremiumNav variant="landing" />
        <main className={styles.main}>
          <div className={styles.card}>
            <div className={styles.badge}>Secure sign-in</div>
            <h1 className={styles.title}>Welcome to AI-Pass</h1>
            <p className={styles.subtitle}>
              {inIde
                ? 'Continue with Google opens your system browser, then returns you to the IDE.'
                : 'Sign in with Google or email to get 500 free credits and access the AI Playground.'}
            </p>
            {errorMessage && (
              <div className={styles.error} role="alert">
                {errorMessage}
              </div>
            )}
            <button
              type="button"
              className={styles.googleBtn}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <GoogleIcon />
              {loading
                ? inIde
                  ? 'Opening browser…'
                  : 'Redirecting…'
                : 'Continue with Google'}
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

          {errorMessage && (
            <div className={styles.error} role="alert">
              {errorMessage}
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
            Configure Google OAuth in your Cloud Console. See repository{' '}
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
