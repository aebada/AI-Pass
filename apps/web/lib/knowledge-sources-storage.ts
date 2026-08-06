export const KNOWLEDGE_SOURCES_STORAGE_KEY = 'ai-pass:knowledge-sources';

export type KnowledgeConnector =
  | 'pdf'
  | 'docx'
  | 'txt'
  | 'csv'
  | 'postgres'
  | 'sharepoint'
  | 'rest'
  | 'kafka'
  | 's3';

export interface KnowledgeSource {
  id: string;
  name: string;
  connector: KnowledgeConnector;
  type: string;
  syncStatus: 'connected' | 'syncing' | 'error';
  lastSyncedAt: string;
  chunkCount: number;
  connectedAt: string;
}

export const KNOWLEDGE_CONNECTORS: KnowledgeConnector[] = [
  'pdf',
  'docx',
  'txt',
  'csv',
  'postgres',
  's3',
  'sharepoint',
  'rest',
  'kafka',
];

const CONNECTOR_TYPE: Record<KnowledgeConnector, string> = {
  pdf: 'file',
  docx: 'file',
  txt: 'file',
  csv: 'file',
  postgres: 'database',
  s3: 'object storage',
  sharepoint: 'enterprise',
  rest: 'api',
  kafka: 'stream',
};

export function connectorType(connector: KnowledgeConnector): string {
  return CONNECTOR_TYPE[connector] ?? 'connector';
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const DEMO_KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  {
    id: 'demo-postgres-1',
    name: 'Product catalog (Postgres)',
    connector: 'postgres',
    type: connectorType('postgres'),
    syncStatus: 'connected',
    lastSyncedAt: hoursAgo(2),
    chunkCount: 18420,
    connectedAt: hoursAgo(72),
  },
  {
    id: 'demo-kafka-1',
    name: 'Customer events (Kafka)',
    connector: 'kafka',
    type: connectorType('kafka'),
    syncStatus: 'connected',
    lastSyncedAt: hoursAgo(0.25),
    chunkCount: 9320,
    connectedAt: hoursAgo(48),
  },
];

function normalizeSource(raw: Partial<KnowledgeSource>): KnowledgeSource | null {
  if (!raw.id || !raw.name || !raw.connector) return null;
  const connector = raw.connector as KnowledgeConnector;
  return {
    id: raw.id,
    name: raw.name,
    connector,
    type: raw.type ?? connectorType(connector),
    syncStatus: raw.syncStatus ?? 'connected',
    lastSyncedAt: raw.lastSyncedAt ?? new Date().toISOString(),
    chunkCount: typeof raw.chunkCount === 'number' ? raw.chunkCount : 0,
    connectedAt: raw.connectedAt ?? new Date().toISOString(),
  };
}

export function loadKnowledgeSources(): KnowledgeSource[] {
  if (typeof window === 'undefined') return [...DEMO_KNOWLEDGE_SOURCES];
  try {
    const raw = localStorage.getItem(KNOWLEDGE_SOURCES_STORAGE_KEY);
    if (!raw) {
      const seeded = [...DEMO_KNOWLEDGE_SOURCES];
      localStorage.setItem(KNOWLEDGE_SOURCES_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<KnowledgeSource>[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const seeded = [...DEMO_KNOWLEDGE_SOURCES];
      localStorage.setItem(KNOWLEDGE_SOURCES_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return parsed
      .map(normalizeSource)
      .filter((s): s is KnowledgeSource => s !== null);
  } catch {
    return [...DEMO_KNOWLEDGE_SOURCES];
  }
}

export function saveKnowledgeSources(sources: KnowledgeSource[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KNOWLEDGE_SOURCES_STORAGE_KEY, JSON.stringify(sources));
}

export function addKnowledgeSource(
  name: string,
  connector: KnowledgeConnector,
): KnowledgeSource {
  const source: KnowledgeSource = {
    id: `src-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    connector,
    type: connectorType(connector),
    syncStatus: 'connected',
    lastSyncedAt: new Date().toISOString(),
    chunkCount: 0,
    connectedAt: new Date().toISOString(),
  };
  const next = [...loadKnowledgeSources(), source];
  saveKnowledgeSources(next);
  return source;
}

export function touchKnowledgeSourceSync(sourceId: string): KnowledgeSource[] {
  const next = loadKnowledgeSources().map((s) =>
    s.id === sourceId
      ? {
          ...s,
          syncStatus: 'connected' as const,
          lastSyncedAt: new Date().toISOString(),
          chunkCount: s.chunkCount + Math.floor(Math.random() * 120) + 10,
        }
      : s,
  );
  saveKnowledgeSources(next);
  return next;
}

export function formatLastSync(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleString();
}
