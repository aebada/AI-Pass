import type { SearchResult } from '@ai-pass/shared';

export interface IndexDocument {
  path: string;
  content: string;
  language?: string;
  chunks?: string[];
}

export interface IndexerOptions {
  workspaceRoot: string;
  chunkSize?: number;
  chunkOverlap?: number;
  ignorePatterns?: string[];
}

export interface CodebaseIndexer {
  index(documents: IndexDocument[]): Promise<void>;
  search(query: string, limit?: number): Promise<SearchResult[]>;
  getStatus(): IndexStatus;
}

export interface IndexStatus {
  documentCount: number;
  chunkCount: number;
  lastIndexedAt?: number;
  isIndexing: boolean;
}

export { TextIndexer } from './text-indexer.js';
export { createIndexer } from './factory.js';
