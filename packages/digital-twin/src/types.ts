import type { MembershipTier } from '@ai-pass/shared';

/** Per-user memory category — consent-gated in UI */
export type TwinMemoryCategory =
  | 'private'
  | 'business'
  | 'medical'
  | 'connections'
  | 'integrations';

export interface TwinMemoryEntry {
  id: string;
  category: TwinMemoryCategory;
  key: string;
  value: string;
  updatedAt: string;
  consentGranted: boolean;
}

export interface TwinUserProfile {
  userId: string;
  displayName: string;
  timezone: string;
  preferences: TwinPreferences;
}

export interface TwinPreferences {
  tone: 'professional' | 'friendly' | 'concise';
  proactiveReminders: boolean;
  speechEnabled: boolean;
  memoryCategoriesEnabled: TwinMemoryCategory[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  source: 'google' | 'work' | 'mock';
  attendees?: string[];
}

export interface CalendarConnection {
  id: string;
  provider: 'google' | 'work' | 'mock';
  label: string;
  connected: boolean;
  lastSyncAt?: string;
}

export interface TwinChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface TwinChatRequest {
  userId: string;
  message: string;
  tier: MembershipTier;
  profile?: Partial<TwinUserProfile>;
  history?: TwinChatMessage[];
}

export interface TwinChatResponse {
  reply: string;
  creditsUsed?: number;
  modelId?: string;
  suggestedActions?: string[];
  messagesRemaining?: number | null;
}

export interface TwinLimits {
  tier: MembershipTier;
  label: string;
  priceLabel: string;
  monthlyMessages: number | null;
  speech: boolean;
  calendarSync: boolean;
  maxCalendars: number | null;
  memoryCategories: boolean;
  whatsappIntegration: boolean;
  medicalVault: boolean;
  teamTwins: boolean;
}

export interface TwinUsage {
  userId: string;
  messagesThisMonth: number;
  periodStart: string;
}
