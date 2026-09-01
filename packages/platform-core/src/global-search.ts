/** GlobalSearchService — semantic search across the AI OS (demo stub) */

export type SearchResultType =
  | 'module'
  | 'app'
  | 'agent'
  | 'workflow'
  | 'knowledge'
  | 'marketplace'
  | 'report'
  | 'chat';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  route: string;
  icon?: string;
  score: number;
}

export interface SearchOptions {
  query: string;
  types?: SearchResultType[];
  limit?: number;
}

const DEMO_INDEX: SearchResult[] = [
  { id: 'mod-workspace', type: 'module', title: 'Workspace', description: 'Platform home dashboard', route: '/workspace', icon: '◫', score: 1 },
  { id: 'mod-playground', type: 'module', title: 'AI Playground', description: 'Chat, compare, and benchmark models', route: '/workspace/playground', icon: '✦', score: 1 },
  { id: 'mod-agents', type: 'module', title: 'Agents', description: 'Agent Studio integration', route: '/workspace/agents', icon: '🤖', score: 1 },
  { id: 'mod-workflows', type: 'module', title: 'Workflows', description: 'Visual workflow builder', route: '/workspace/workflows', icon: '⟳', score: 1 },
  { id: 'mod-knowledge', type: 'module', title: 'Knowledge', description: 'Knowledge pipeline', route: '/workspace/knowledge', icon: '📚', score: 1 },
  { id: 'mod-marketplace', type: 'module', title: 'Marketplace', description: 'Skills, templates, apps', route: '/workspace/marketplace', icon: '🏪', score: 1 },
  { id: 'mod-discover', type: 'module', title: 'AI Discovery Hub', description: 'Discover, compare, benchmark, install and orchestrate AI tools', route: '/workspace/discover', icon: '⌕', score: 1 },
  { id: 'mod-discover-benchmarks', type: 'marketplace', title: 'AI Benchmarks', description: 'Independent tool and model evaluations', route: '/discover/benchmarks', icon: '📊', score: 0.95 },
  { id: 'mod-discover-enterprise', type: 'marketplace', title: 'Enterprise AI Catalog', description: 'Approve, block, and govern AI inventory', route: '/discover/enterprise', icon: '🏛', score: 0.95 },
  { id: 'app-invoice', type: 'app', title: 'Invoice AI', description: 'Finance automation and invoice lifecycle', route: '/workspace/apps/invoice-ai', icon: '🧾', score: 0.95 },
  { id: 'app-supply', type: 'app', title: 'Supply Chain AI', description: 'Procurement offer evaluation', route: '/workspace/apps/supply-chain', icon: '📦', score: 0.95 },
  { id: 'app-support', type: 'app', title: 'Customer Support AI', description: 'Voice + text support agent', route: '/workspace/apps/customer-support-ai', icon: '💬', score: 0.9 },
  { id: 'app-sales', type: 'app', title: 'Sales AI', description: 'Revenue OS — email, LinkedIn, proposals, CRM', route: '/workspace/apps/sales-ai', icon: '📈', score: 0.92 },
  { id: 'app-compliance', type: 'app', title: 'Compliance AI', description: 'Enterprise compliance operations platform', route: '/workspace/apps/compliance-ai', icon: '⚖', score: 0.92 },
  { id: 'agent-invoice', type: 'agent', title: 'Invoice Processor', description: 'Extracts and validates invoice data', route: '/workspace/agents', icon: '🤖', score: 0.85 },
  { id: 'agent-support', type: 'agent', title: 'Support Triage', description: 'Routes and prioritizes support tickets', route: '/workspace/agents', icon: '🤖', score: 0.85 },
  { id: 'wf-invoice', type: 'workflow', title: 'Invoice approval chain', description: 'Multi-step invoice validation', route: '/workspace/workflows', icon: '⟳', score: 0.8 },
  { id: 'wf-knowledge', type: 'workflow', title: 'Knowledge ingest pipeline', description: 'Document ingestion and indexing', route: '/workspace/workflows', icon: '⟳', score: 0.8 },
  { id: 'kb-q4', type: 'knowledge', title: 'Q4 Financial Reports', description: 'Indexed knowledge base collection', route: '/workspace/knowledge', icon: '📚', score: 0.75 },
  { id: 'mk-hr', type: 'marketplace', title: 'HR AI Template', description: 'Onboarding automation pack', route: '/workspace/marketplace', icon: '🏪', score: 0.7 },
  { id: 'report-usage', type: 'report', title: 'Usage Analytics Report', description: 'Monthly AI spend breakdown', route: '/workspace/analysis', icon: '📊', score: 0.65 },
  { id: 'chat-playground', type: 'chat', title: 'Playground session', description: 'Recent Claude Sonnet conversation', route: '/workspace/playground', icon: '💬', score: 0.6 },
];

function scoreMatch(query: string, item: SearchResult): number {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  if (title === q) return 1;
  if (title.startsWith(q)) return 0.9;
  if (title.includes(q)) return 0.8;
  if (desc.includes(q)) return 0.6;
  const tokens = q.split(/\s+/);
  const matched = tokens.filter((t) => title.includes(t) || desc.includes(t)).length;
  return matched > 0 ? (matched / tokens.length) * 0.5 : 0;
}

export class GlobalSearchService {
  search(options: SearchOptions): SearchResult[] {
    const { query, types, limit = 10 } = options;
    const q = query.trim();
    if (!q) return [];

    let results = DEMO_INDEX
      .map((item) => ({ ...item, score: scoreMatch(q, item) * item.score }))
      .filter((item) => item.score > 0);

    if (types?.length) {
      results = results.filter((r) => types.includes(r.type));
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  suggest(prefix: string, limit = 5): SearchResult[] {
    return this.search({ query: prefix, limit });
  }
}

export const defaultGlobalSearchService = new GlobalSearchService();
