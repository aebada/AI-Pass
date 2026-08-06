import type { ModelProviderId } from './types.js';

const STORAGE_KEY = 'aipass_byo_keys_v1';

export interface StoredKey {
  providerId: ModelProviderId;
  encrypted: string;
  label?: string;
  createdAt: string;
}

/** MVP: base64 obfuscation stub — replace with real encryption in production */
function obfuscate(value: string): string {
  if (typeof btoa === 'function') return btoa(value);
  return value;
}

function deobfuscate(value: string): string {
  try {
    if (typeof atob === 'function') return atob(value);
    return value;
  } catch {
    return '';
  }
}

function readStore(): StoredKey[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredKey[]) : [];
  } catch {
    return [];
  }
}

function writeStore(keys: StoredKey[]): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function saveByoKey(providerId: ModelProviderId, apiKey: string, label?: string): StoredKey {
  const keys = readStore().filter((k) => k.providerId !== providerId);
  const entry: StoredKey = {
    providerId,
    encrypted: obfuscate(apiKey),
    label,
    createdAt: new Date().toISOString(),
  };
  keys.push(entry);
  writeStore(keys);
  return entry;
}

export function getByoKey(providerId: ModelProviderId): string | undefined {
  const entry = readStore().find((k) => k.providerId === providerId);
  if (!entry) return undefined;
  return deobfuscate(entry.encrypted) || undefined;
}

export function listByoKeys(): Array<Omit<StoredKey, 'encrypted'> & { hasKey: boolean }> {
  return readStore().map(({ encrypted, ...rest }) => ({ ...rest, hasKey: Boolean(encrypted) }));
}

export function removeByoKey(providerId: ModelProviderId): boolean {
  const before = readStore();
  const after = before.filter((k) => k.providerId !== providerId);
  if (after.length === before.length) return false;
  writeStore(after);
  return true;
}

export function maskApiKey(key: string): string {
  if (key.length <= 8) return '••••••••';
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

export interface ConnectionTestResult {
  success: boolean;
  latency_ms: number;
  message: string;
}

/** Stub connection test for BYO keys MVP */
export async function testConnection(
  providerId: ModelProviderId,
  apiKey: string,
): Promise<ConnectionTestResult> {
  const latency = 80 + Math.floor(Math.random() * 120);
  await new Promise((r) => setTimeout(r, Math.min(latency, 250)));
  if (apiKey.length < 8) {
    return { success: false, latency_ms: latency, message: 'Invalid API key format' };
  }
  return {
    success: true,
    latency_ms: latency,
    message: `${providerId} connection OK (stub validation)`,
  };
}
