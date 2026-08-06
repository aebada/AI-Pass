import type { CalendarConnection, CalendarEvent } from '../types.js';
import type { CalendarConnector } from './types.js';

const DEMO_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Team standup',
    start: '09:00',
    end: '09:30',
    location: 'Zoom',
    source: 'mock',
    attendees: ['you@company.com', 'team@company.com'],
  },
  {
    id: 'evt-2',
    title: 'Product review',
    start: '11:00',
    end: '12:00',
    location: 'Conference Room B',
    source: 'mock',
  },
  {
    id: 'evt-3',
    title: '1:1 with manager',
    start: '14:00',
    end: '14:30',
    source: 'mock',
  },
  {
    id: 'evt-4',
    title: 'Focus block — deep work',
    start: '15:00',
    end: '17:00',
    source: 'mock',
  },
];

export class MockCalendarConnector implements CalendarConnector {
  readonly providerId = 'mock' as const;

  async listConnections(_userId: string): Promise<CalendarConnection[]> {
    return [
      {
        id: 'mock-work',
        provider: 'mock',
        label: 'Work calendar (demo)',
        connected: true,
        lastSyncAt: new Date().toISOString(),
      },
    ];
  }

  async listEvents(_userId: string, _date: string): Promise<CalendarEvent[]> {
    return DEMO_EVENTS;
  }

  async isConnected(_userId: string): Promise<boolean> {
    return true;
  }
}

export const defaultMockCalendar = new MockCalendarConnector();
