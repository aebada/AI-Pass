'use client';

import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AIPASS_AUTH_SUCCESS,
  authMessageOrigins,
  emailLoginHref,
  googleAuthHref,
  isAipassAuthMessage,
  registerHref,
  useServerAuth,
} from '@/lib/auth-api';
import { useAuthSession } from '@/lib/use-auth-session';
import styles from './sign-in-card.module.css';

export function GoogleIcon() {
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

interface SignInCardProps {
  returnUrl?: string;
  variant?: 'page' | 'gate';
  error?: string | null;
  /** Open Google OAuth in a popup (default: true for gate variant). */
  usePopup?: boolean;
  onAuthSuccess?: () => void;
}

const POPUP_FEATURES = 'width=500,height=650,menubar=no,toolbar=no,location=yes,status=no';

export function SignInCard({
  returnUrl,
  variant = 'page',
  error,
  usePopup = variant === 'gate',
  onAuthSuccess,
}: SignInCardProps) {
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(error ?? null);
  const [resolvedReturnUrl, setResolvedReturnUrl] = useState('/workspace');
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<number | null>(null);
  const { refreshAuth } = useAuthSession();

  useEffect(() => {
    if (returnUrl) {
      setResolvedReturnUrl(returnUrl);
      return;
    }
    if (variant === 'gate' && typeof window !== 'undefined') {
      setResolvedReturnUrl(`${window.location.pathname}${window.location.search}`);
      return;
    }
    setResolvedReturnUrl('/workspace');
  }, [returnUrl, variant]);

  const clearPopupWatch = useCallback(() => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
    popupRef.current = null;
  }, []);

  const finishAuth = useCallback(async () => {
    clearPopupWatch();
    setLoading(false);
    await refreshAuth();
    onAuthSuccess?.();
  }, [clearPopupWatch, onAuthSuccess, refreshAuth]);

  useEffect(() => {
    if (!usePopup || !useServerAuth) return;

    const allowedOrigins = new Set(authMessageOrigins());

    function onMessage(event: MessageEvent) {
      if (!allowedOrigins.has(event.origin) || !isAipassAuthMessage(event.data)) {
        return;
      }

      if (event.data.type === AIPASS_AUTH_SUCCESS) {
        setAuthError(null);
        void finishAuth();
        return;
      }

      setAuthError('Google sign-in failed. Please try again.');
      clearPopupWatch();
      setLoading(false);
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [clearPopupWatch, finishAuth, usePopup]);

  useEffect(() => () => clearPopupWatch(), [clearPopupWatch]);

  const emailHref = emailLoginHref(resolvedReturnUrl);
  const registerLink = registerHref(resolvedReturnUrl);

  async function handleGoogleSignIn() {
    setAuthError(null);

    if (useServerAuth && usePopup) {
      const href = googleAuthHref(resolvedReturnUrl, '/workspace', { popup: true });
      const popup = window.open(href, 'aipass-auth', POPUP_FEATURES);

      if (!popup) {
        window.location.href = googleAuthHref(resolvedReturnUrl);
        return;
      }

      popupRef.current = popup;
      setLoading(true);

      pollRef.current = window.setInterval(() => {
        if (popup.closed) {
          void finishAuth();
        }
      }, 400);

      return;
    }

    if (useServerAuth) {
      window.location.href = googleAuthHref(resolvedReturnUrl);
      return;
    }

    setLoading(true);
    await signIn('google', { callbackUrl: resolvedReturnUrl });
  }

  const cardClass = variant === 'gate' ? `${styles.card} ${styles.cardGate}` : styles.card;
  const displayError = authError ?? error;

  return (
    <div className={cardClass}>
      {variant === 'page' && <div className={styles.badge}>Secure sign-in</div>}
      <h1 className={variant === 'gate' ? styles.titleGate : styles.title}>
        {variant === 'gate'
          ? 'Sign in to get 500 free credits'
          : 'Welcome to AI-Pass'}
      </h1>
      <p className={styles.subtitle}>
        Sign in with Google or email to access the AI Playground. Use GPT-4o Mini, Gemini Flash,
        and DeepSeek Free on the free tier.
      </p>

      {displayError && (
        <div className={styles.error} role="alert">
          {displayError === 'Google sign-in failed. Please try again.'
            ? displayError
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
        {loading ? 'Signing in…' : 'Continue with Google'}
      </button>

      <a href={emailHref} className={styles.emailBtn}>
        Sign in with email
      </a>

      <p className={styles.hint}>
        New here?{' '}
        {useServerAuth ? (
          <a href={registerLink}>Create account</a>
        ) : (
          <Link href={registerLink}>Create account</Link>
        )}
      </p>

      {variant === 'page' && (
        <p className={styles.legal}>
          By continuing, you agree to AI-Pass terms and privacy policy.
        </p>
      )}
    </div>
  );
}
