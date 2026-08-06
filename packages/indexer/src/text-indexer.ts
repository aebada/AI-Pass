import type { SearchResult } from '@ai-pass/shared';
import type { CodebaseIndexer, IndexDocument, IndexerOptions, IndexStatus } from './index.js';

const DEFAULT_IGNORE = ['node_modules', '.git', 'dist', '.turbo', 'coverage'];

export class TextIndexer implements CodebaseIndexer {
  private documents: Map<string, IndexDocument> = new Map();
  private status: IndexStatus = { documentCount: 0, chunkCount: 0, isIndexing: false };
  private options: IndexerOptions;

  constructor(options: IndexerOptions) {
    this.options = {
      chunkSize: 1000,
      chunkOverlap: 200,
      ignorePatterns: DEFAULT_IGNORE,
      ...options,
    };
  }

  async index(documents: IndexDocument[]): Promise<void> {
    this.status.isIndexing = true;
    this.documents.clear();

    for (const doc of documents) {
      if (this.shouldIgnore(doc.path)) continue;
      const chunks = this.chunkContent(doc.content);
      this.documents.set(doc.path, { ...doc, chunks });
    }

    this.status = {
      documentCount: this.documents.size,
      chunkCount: Array.from(this.documents.values()).reduce((n, d) => n + (d.chunks?.length ?? 0), 0),
      lastIndexedAt: Date.now(),
      isIndexing: false,
    };
  }

  async search(query: string, limit = 10): Promise<SearchResult[]> {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results: SearchResult[] = [];

    for (const [path, doc] of this.documents) {
      const content = doc.content.toLowerCase();
      let score = 0;
      for (const term of terms) {
        const matches = content.split(term).length - 1;
        score += matches;
      }
      if (score > 0) {
        const idx = content.indexOf(terms[0] ?? '');
        const snippet = doc.content.slice(Math.max(0, idx - 40), idx + 120);
        results.push({ path, score, snippet: snippet.trim() });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  getStatus(): IndexStatus {
    return { ...this.status };
  }

  private shouldIgnore(path: string): boolean {
    return (this.options.ignorePatterns ?? []).some((p) => path.includes(`/${p}/`) || path.includes(p));
  }

  private chunkContent(content: string): string[] {
    const size = this.options.chunkSize ?? 1000;
    const overlap = this.options.chunkOverlap ?? 200;
    const chunks: string[] = [];
    let start = 0;
    while (start < content.length) {
      chunks.push(content.slice(start, start + size));
      start += size - overlap;
    }
    return chunks;
  }
}
