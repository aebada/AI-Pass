'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import type { PlanTier } from '@ai-pass/ui';
import { isLegacyDemoProfile } from '@/lib/session-user';
import { AuthSessionBridge } from '../auth/AuthSessionBridge';
import { LaravelAuthBridge } from '../auth/LaravelAuthBridge';
import { PhpAuthBridge } from '../auth/PhpAuthBridge';

const usePhpAuth = process.env.NEXT_PUBLIC_USE_PHP_AUTH === '1';
const useLaravelAuth = process.env.NEXT_PUBLIC_USE_LARAVEL_AUTH === '1';

export type ThemeMode = 'dark' | 'light' | 'system';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarUrl?: string;
  plan: PlanTier;
  workspace: string;
  onboarded: boolean;
}

interface AppContextValue {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setTheme: (theme: ThemeMode) => void;
  user: UserProfile | null;
  signIn: (profile: UserProfile) => void;
  signOut: () => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  showOnboarding: boolean;
  completeOnboarding: () => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

const PROFILE_STORAGE_KEY = 'ai-pass:profile';

const SEED_NOTIFICATIONS: NotificationItem[] = [
  { id: '1', title: 'Welcome to AI Pass', body: 'Complete onboarding to unlock Studio workflows.', time: '2m ago', read: false, type: 'info' },
  { id: '2', title: 'Invoice AI installed', body: 'Template ready in Solution Studio.', time: '1h ago', read: false, type: 'success' },
  { id: '3', title: 'Governance check passed', body: 'Your last deployment met all policies.', time: '3h ago', read: true, type: 'success' },
];

const AppContext = createContext<AppContextValue | null>(null);

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return mode === 'light' ? 'light' : 'dark';
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [aiModel, setAiModelState] = useState('gpt-4o');

  useEffect(() => {
    const storedTheme = localStorage.getItem('ai-pass:theme') as ThemeMode | null;
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    const storedOnboarded = localStorage.getItem('ai-pass:onboarded');
    const storedApiKey = localStorage.getItem('ai-pass:api-key') ?? '';
    const storedModel = localStorage.getItem('ai-pass:ai-model') ?? 'gpt-4o';

    if (storedTheme) setThemeState(storedTheme);
    let profile: UserProfile | null = null;
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile) as UserProfile;
        if (!isLegacyDemoProfile(parsed)) {
          profile = parsed;
          setUser(parsed);
        } else {
          localStorage.removeItem(PROFILE_STORAGE_KEY);
        }
      } catch {
        setUser(null);
      }
    }
    setApiKeyState(storedApiKey);
    setAiModelState(storedModel);
    // Never auto-open onboarding for anonymous marketing visitors.
    const needsOnboarding =
      Boolean(profile) && storedOnboarded !== 'true' && profile?.onboarded !== true;
    setShowOnboarding(needsOnboarding);
  }, []);

  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    localStorage.setItem('ai-pass:theme', theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handler = () => {
      if (theme === 'system') setResolvedTheme(resolveTheme('system'));
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);

  const signIn = useCallback((profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem('ai-pass:user');
  }, []);

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const completeOnboarding = useCallback(() => {
    setShowOnboarding(false);
    localStorage.setItem('ai-pass:onboarded', 'true');
    updateUser({ onboarded: true });
  }, [updateUser]);

  const setApiKey = useCallback((key: string) => {
    setApiKeyState(key);
    localStorage.setItem('ai-pass:api-key', key);
  }, []);

  const setAiModel = useCallback((model: string) => {
    setAiModelState(model);
    localStorage.setItem('ai-pass:ai-model', model);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      user,
      signIn,
      signOut,
      updateUser,
      notifications,
      unreadCount,
      markAllRead,
      showOnboarding,
      completeOnboarding,
      apiKey,
      setApiKey,
      aiModel,
      setAiModel,
    }),
    [
      theme,
      resolvedTheme,
      setTheme,
      user,
      signIn,
      signOut,
      updateUser,
      notifications,
      unreadCount,
      markAllRead,
      showOnboarding,
      completeOnboarding,
      apiKey,
      setApiKey,
      aiModel,
      setAiModel,
    ],
  );

  return (
    <SessionProvider>
      <AppContext.Provider value={value}>
        {useLaravelAuth ? (
          <LaravelAuthBridge />
        ) : usePhpAuth ? (
          <PhpAuthBridge />
        ) : (
          <AuthSessionBridge />
        )}
        {children}
      </AppContext.Provider>
    </SessionProvider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProviders');
  return ctx;
}
