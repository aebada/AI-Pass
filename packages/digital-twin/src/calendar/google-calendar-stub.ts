import type { CalendarConnection, CalendarEvent } from '../types.js';
import type { CalendarConnector } from './types.js';

/**
 * Google Calendar OAuth stub.
 * Production: Laravel route `/api/v1/twin/calendar/oauth/google` handles OAuth flow.
 */
export class GoogleCalendarStubConnector implements CalendarConnector {
  readonly providerId = 'google' as const;

  getOAuthUrl(userId: string): string {
    const base = process.env.AUTH_API_URL ?? process.env.NEXT_PUBLIC_AUTH_API_URL ?? '';
    if (base) {
      return `${base.replace(/\/$/, '')}/api/v1/twin/calendar/oauth/google?user=${encodeURIComponent(userId)}`;
    }
    return `/api/v1/twin/calendar/oauth/google?user=${encodeURIComponent(userId)}`;
  }

  async listConnections(userId: string): Promise<CalendarConnection[]> {
    const connected = await this.isConnected(userId);
    return [
      {
        id: 'google-primary',
        provider: 'google',
        label: 'Google Calendar',
        connected,
        lastSyncAt: connected ? new Date().toISOString() : undefined,
      },
    ];
  }

  async listEvents(_userId: string, _date: string): Promise<CalendarEvent[]> {
    return [];
  }

  async isConnected(_userId: string): Promise<boolean> {
    return false;
  }
}

export const defaultGoogleCalendarStub = new GoogleCalendarStubConnector();
