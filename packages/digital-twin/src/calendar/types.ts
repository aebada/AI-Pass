import type { CalendarConnection, CalendarEvent } from '../types.js';

/** Pluggable calendar connector — Google OAuth in production via Laravel */
export interface CalendarConnector {
  readonly providerId: 'google' | 'work' | 'mock';
  listConnections(userId: string): Promise<CalendarConnection[]>;
  listEvents(userId: string, date: string): Promise<CalendarEvent[]>;
  getOAuthUrl?(userId: string): string;
  isConnected(userId: string): Promise<boolean>;
}
