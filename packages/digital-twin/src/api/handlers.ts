import type { MembershipTier } from '@ai-pass/shared';
import { DigitalTwinService, defaultDigitalTwinService } from '../digital-twin-service.js';

export function parseUserId(headers: Headers): string {
  return headers.get('x-user-id') ?? 'demo-user';
}

export function parseTier(headers: Headers): MembershipTier {
  const tier = headers.get('x-membership-tier');
  if (tier === 'free' || tier === 'professional' || tier === 'power' || tier === 'enterprise') {
    return tier;
  }
  return 'free';
}

export function parseUserName(headers: Headers): string {
  return headers.get('x-user-name') ?? 'User';
}

let serviceInstance: DigitalTwinService | null = null;

export function getDigitalTwinService(): DigitalTwinService {
  if (!serviceInstance) serviceInstance = defaultDigitalTwinService;
  return serviceInstance;
}

export { defaultDigitalTwinService };
