import { createId, type ConnectorKind, type KnowledgeSource, type KnowledgeSourceType } from '@ai-pass/shared';

export const FILE_CONNECTORS: ConnectorKind[] = ['pdf', 'docx', 'txt', 'html', 'csv', 'excel', 'json', 'xml'];
export const DB_CONNECTORS: ConnectorKind[] = ['postgres', 'mysql', 'sqlserver', 'oracle', 'mongodb', 'snowflake', 'bigquery'];
export const ENTERPRISE_CONNECTORS: ConnectorKind[] = ['sap', 'salesforce', 'servicenow', 'sharepoint', 'confluence', 'jira', 'm365', 'google'];
export const API_CONNECTORS: ConnectorKind[] = ['rest', 'graphql', 'webhook'];
export const STREAM_CONNECTORS: ConnectorKind[] = ['kafka', 'mqtt', 'livesync'];

export interface ConnectSourceParams {
  name: string;
  type: KnowledgeSourceType;
  connector: string;
  connectorKind?: ConnectorKind;
  tenantId: string;
  embeddingModel?: string;
  accessRoles?: string[];
  ownerId?: string;
  config?: Record<string, unknown>;
}

/** Manages knowledge source connectors — files, databases, enterprise, APIs, streaming */
export class ConnectorService {
  private sources = new Map<string, KnowledgeSource>();
  private configs = new Map<string, Record<string, unknown>>();

  addSource(params: ConnectSourceParams): KnowledgeSource {
    const entry: KnowledgeSource = {
      id: `src_${createId()}`,
      name: params.name,
      type: params.type,
      connector: params.connector,
      connectorKind: params.connectorKind,
      tenantId: params.tenantId,
      syncStatus: 'idle',
      chunkCount: 0,
      documentCount: 0,
      embeddingModel: params.embeddingModel ?? 'text-embedding-3-small',
      accessRoles: params.accessRoles ?? ['knowledge:read'],
      ownerId: params.ownerId,
      trustScore: 0.85,
      createdAt: new Date().toISOString(),
    };
    this.sources.set(entry.id, entry);
    if (params.config) this.configs.set(entry.id, params.config);
    return entry;
  }

  getSource(sourceId: string): KnowledgeSource | undefined {
    return this.sources.get(sourceId);
  }

  listSources(tenantId?: string): KnowledgeSource[] {
    const all = [...this.sources.values()];
    return tenantId ? all.filter((s) => s.tenantId === tenantId) : all;
  }

  updateSyncStatus(sourceId: string, status: KnowledgeSource['syncStatus'], chunkCount?: number): void {
    const source = this.sources.get(sourceId);
    if (!source) return;
    source.syncStatus = status;
    source.lastSyncedAt = new Date().toISOString();
    if (chunkCount !== undefined) source.chunkCount = chunkCount;
    this.sources.set(sourceId, source);
  }

  getConfig(sourceId: string): Record<string, unknown> | undefined {
    return this.configs.get(sourceId);
  }

  listConnectorCatalog(): { category: string; connectors: ConnectorKind[]; status: 'available' | 'stub' }[] {
    return [
      { category: 'Files', connectors: FILE_CONNECTORS, status: 'available' },
      { category: 'Databases', connectors: DB_CONNECTORS, status: 'stub' },
      { category: 'Enterprise', connectors: ENTERPRISE_CONNECTORS, status: 'stub' },
      { category: 'APIs', connectors: API_CONNECTORS, status: 'available' },
      { category: 'Streaming', connectors: STREAM_CONNECTORS, status: 'stub' },
    ];
  }

  testConnection(sourceId: string): { ok: boolean; message: string } {
    const source = this.sources.get(sourceId);
    if (!source) return { ok: false, message: 'Source not found' };
    return { ok: true, message: `Connection to ${source.connector} verified (stub)` };
  }
}

/** @deprecated Use ConnectorService */
export class IngestionService extends ConnectorService {}
