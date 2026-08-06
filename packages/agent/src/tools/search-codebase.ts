import type { ToolDefinition } from '@ai-pass/shared';
import type { SearchAdapter } from './index.js';

export function searchCodebaseTool(search: SearchAdapter): ToolDefinition {
  return {
    name: 'search_codebase',
    description: 'Semantic and text search across the project codebase.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        limit: { type: 'number', description: 'Max results (default 10)' },
      },
      required: ['query'],
    },
    async execute(args) {
      const query = String(args.query);
      const limit = typeof args.limit === 'number' ? args.limit : 10;
      try {
        const results = await search.search(query, { limit });
        if (!results.length) return 'No results found.';
        return results
          .map((r, i) => `${i + 1}. ${r.path} (score: ${r.score.toFixed(2)})\n${r.snippet}`)
          .join('\n\n');
      } catch (err) {
        return `Search error: ${err instanceof Error ? err.message : String(err)}`;
      }
    },
  };
}
