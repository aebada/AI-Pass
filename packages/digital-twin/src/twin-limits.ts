import type { MembershipTier } from '@ai-pass/shared';
import type { TwinLimits } from './types.js';

/** Digital Twin limits mapped to universal membership tiers */
export const TWIN_TIER_LIMITS: Record<MembershipTier, TwinLimits> = {
  free: {
    tier: 'free',
    label: 'Free',
    priceLabel: '$0',
    monthlyMessages: 50,
    speech: false,
    calendarSync: false,
    maxCalendars: 0,
    memoryCategories: false,
    whatsappIntegration: false,
    medicalVault: false,
    teamTwins: false,
  },
  professional: {
    tier: 'professional',
    label: 'Starter',
    priceLabel: '$19/mo',
    monthlyMessages: 500,
    speech: true,
    calendarSync: true,
    maxCalendars: 1,
    memoryCategories: false,
    whatsappIntegration: false,
    medicalVault: false,
    teamTwins: false,
  },
  power: {
    tier: 'power',
    label: 'Pro',
    priceLabel: '$49/mo',
    monthlyMessages: null,
    speech: true,
    calendarSync: true,
    maxCalendars: null,
    memoryCategories: true,
    whatsappIntegration: false,
    medicalVault: false,
    teamTwins: false,
  },
  enterprise: {
    tier: 'enterprise',
    label: 'Enterprise',
    priceLabel: 'Custom',
    monthlyMessages: null,
    speech: true,
    calendarSync: true,
    maxCalendars: null,
    memoryCategories: true,
    whatsappIntegration: true,
    medicalVault: true,
    teamTwins: true,
  },
};

export const TWIN_PRICING_TABLE = Object.values(TWIN_TIER_LIMITS);

export function getTwinLimits(tier: MembershipTier): TwinLimits {
  return TWIN_TIER_LIMITS[tier];
}
