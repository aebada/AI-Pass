import type { Rule } from '@ai-pass/shared';

const RULES_STORAGE_KEY = 'ai-pass-rules';

const DEFAULT_PROJECT_RULES: Rule[] = [
  {
    id: 'project-default',
    scope: 'project',
    name: 'AI Pass conventions',
    content:
      'Use TypeScript with strict types. Match existing code style. Prefer minimal, focused changes. Business routes stay under /studio, /requirements, /marketplace.',
    enabled: true,
    priority: 1,
  },
];

export function loadRules(): Rule[] {
  if (typeof window === 'undefined') return DEFAULT_PROJECT_RULES;

  try {
    const stored = localStorage.getItem(RULES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Rule[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fall through to defaults
  }

  return DEFAULT_PROJECT_RULES;
}

export function saveRules(rules: Rule[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
}

export function parseRulesFromText(content: string, scope: Rule['scope'] = 'project'): Rule[] {
  const blocks = content
    .split(/\n---\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return blocks.map((block, i) => {
    const lines = block.split('\n');
    const name = lines[0]?.replace(/^#\s*/, '') || `Rule ${i + 1}`;
    const body = lines.slice(1).join('\n').trim() || block;
    return {
      id: `rule-${scope}-${i}`,
      scope,
      name,
      content: body,
      enabled: true,
      priority: i,
    };
  });
}
