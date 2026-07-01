import type { CodebaseIndexer, IndexerOptions } from './index.js';
import { TextIndexer } from './text-indexer.js';

export type IndexerType = 'text' | 'vector';

export function createIndexer(type: IndexerType, options: IndexerOptions): CodebaseIndexer {
  switch (type) {
    case 'text':
      return new TextIndexer(options);
    case 'vector':
      // Vector/embedding indexer stub — swap in when embedding provider is wired
      return new TextIndexer(options);
    default:
      return new TextIndexer(options);
  }
}
