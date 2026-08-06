import type { TwinMemoryCategory, TwinMemoryEntry } from './types.js';

const DEFAULT_DEMO_MEMORY: TwinMemoryEntry[] = [
  {
    id: 'mem-1',
    category: 'business',
    key: 'role',
    value: 'Product lead at a mid-size SaaS company',
    updatedAt: new Date().toISOString(),
    consentGranted: true,
  },
  {
    id: 'mem-2',
    category: 'private',
    key: 'morning_routine',
    value: 'Prefers planning day before 9am standup',
    updatedAt: new Date().toISOString(),
    consentGranted: true,
  },
  {
    id: 'mem-3',
    category: 'connections',
    key: 'key_contact',
    value: 'Alex (manager) — weekly 1:1 on Thursdays',
    updatedAt: new Date().toISOString(),
    consentGranted: true,
  },
  {
    id: 'mem-4',
    category: 'integrations',
    key: 'whatsapp',
    value: 'WhatsApp integration pending — roadmap Q3',
    updatedAt: new Date().toISOString(),
    consentGranted: false,
  },
];

export class TwinMemoryStore {
  private store = new Map<string, TwinMemoryEntry[]>();

  getAll(userId: string): TwinMemoryEntry[] {
    return this.store.get(userId) ?? [...DEFAULT_DEMO_MEMORY];
  }

  getByCategory(userId: string, category: TwinMemoryCategory): TwinMemoryEntry[] {
    return this.getAll(userId).filter((e) => e.category === category);
  }

  upsert(userId: string, entry: Omit<TwinMemoryEntry, 'id' | 'updatedAt'> & { id?: string }): TwinMemoryEntry {
    const items = [...this.getAll(userId)];
    const id = entry.id ?? `mem-${Date.now()}`;
    const existing = items.findIndex((e) => e.id === id);
    const record: TwinMemoryEntry = {
      ...entry,
      id,
      updatedAt: new Date().toISOString(),
    };
    if (existing >= 0) {
      items[existing] = record;
    } else {
      items.push(record);
    }
    this.store.set(userId, items);
    return record;
  }

  setConsent(userId: string, category: TwinMemoryCategory, granted: boolean): TwinMemoryEntry[] {
    const items = this.getAll(userId).map((e) =>
      e.category === category ? { ...e, consentGranted: granted } : e,
    );
    this.store.set(userId, items);
    return items;
  }

  buildContext(userId: string, allowedCategories?: TwinMemoryCategory[]): string {
    const entries = this.getAll(userId).filter(
      (e) => e.consentGranted && (!allowedCategories || allowedCategories.includes(e.category)),
    );
    if (entries.length === 0) return 'No personal memory stored yet.';
    return entries.map((e) => `[${e.category}] ${e.key}: ${e.value}`).join('\n');
  }
}

export const defaultTwinMemoryStore = new TwinMemoryStore();
