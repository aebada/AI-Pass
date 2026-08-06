export type SkillSource = 'marketplace' | 'custom';

export interface MarketplaceSkill {
  id: string;
  slug: string;
  name: string;
  description: string;
  version: string;
  category: string;
  tags: string[];
  creditCost: number;
  certified: boolean;
  icon: string;
  instructions: string;
  installCount: number;
  rating: number;
}

export interface CustomSkill {
  id: string;
  name: string;
  description: string;
  instructions: string;
  tags: string[];
  category: 'custom';
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstalledSkillRef {
  id: string;
  source: SkillSource;
  installedAt: string;
}

export type LibrarySkill = (MarketplaceSkill | CustomSkill) & {
  source: SkillSource;
  installed?: boolean;
};

const INSTALLED_KEY = 'ai-pass-skills-installed';
const CUSTOM_KEY = 'ai-pass-skills-custom';

export const SKILL_ICONS: Record<string, string> = {
  communication: 'mail',
  developer_tools: 'wrench',
  parsing: 'file-text',
  reasoning: 'cpu',
  automation: 'zap',
  finance: 'receipt',
  knowledge: 'book-open',
  analytics: 'bar-chart-3',
  compliance: 'scale',
};

export const DEMO_MARKETPLACE_SKILLS: MarketplaceSkill[] = [
  {
    id: 'skill_email_writer',
    slug: 'email-writer',
    name: 'Email Writer',
    description: 'Draft professional emails, follow-ups, and outreach messages with tone control.',
    version: '1.2.0',
    category: 'communication',
    tags: ['email', 'writing', 'outreach'],
    creditCost: 3,
    certified: true,
    icon: 'mail',
    installCount: 18400,
    rating: 4.8,
    instructions:
      'You are an expert business email writer. Draft clear, professional emails. Match the requested tone (formal, friendly, concise). Include subject line suggestions. Avoid filler and keep paragraphs short.',
  },
  {
    id: 'skill_code_review',
    slug: 'code-review',
    name: 'Code Review',
    description: 'Review pull requests for bugs, security issues, performance, and style consistency.',
    version: '2.0.1',
    category: 'developer_tools',
    tags: ['code', 'review', 'security'],
    creditCost: 8,
    certified: true,
    icon: 'wrench',
    installCount: 22100,
    rating: 4.9,
    instructions:
      'You are a senior software engineer performing code review. Identify bugs, security risks, performance issues, and maintainability concerns. Cite specific lines. Suggest concrete fixes. Prioritize critical issues first.',
  },
  {
    id: 'skill_data_extractor',
    slug: 'data-extractor',
    name: 'Data Extractor',
    description: 'Extract structured fields from unstructured text, PDFs, and web snippets.',
    version: '1.4.0',
    category: 'parsing',
    tags: ['extraction', 'json', 'ocr'],
    creditCost: 5,
    certified: true,
    icon: 'file-text',
    installCount: 12700,
    rating: 4.7,
    instructions:
      'You extract structured data from unstructured input. Return valid JSON with clearly named fields. If a field is missing, use null. Never invent data not present in the source.',
  },
  {
    id: 'skill_meeting_summarizer',
    slug: 'meeting-summarizer',
    name: 'Meeting Summarizer',
    description: 'Turn meeting transcripts into action items, decisions, and owner assignments.',
    version: '1.1.0',
    category: 'reasoning',
    tags: ['meetings', 'summary', 'actions'],
    creditCost: 6,
    certified: true,
    icon: 'cpu',
    installCount: 9800,
    rating: 4.6,
    instructions:
      'Summarize meeting notes or transcripts. Output: key decisions, action items (owner + due date if mentioned), open questions, and a 2-sentence executive summary.',
  },
  {
    id: 'skill_invoice_parser',
    slug: 'invoice-parser',
    name: 'Invoice Parser',
    description: 'Parse invoices into vendor, line items, tax, and totals with validation flags.',
    version: '3.0.0',
    category: 'finance',
    tags: ['invoice', 'ap', 'finance'],
    creditCost: 10,
    certified: true,
    icon: 'receipt',
    installCount: 15600,
    rating: 4.8,
    instructions:
      'Parse invoice documents into structured JSON: vendor, invoice number, date, currency, line items (description, qty, unit price, amount), subtotal, tax, total. Flag anomalies (math mismatch, missing fields).',
  },
  {
    id: 'skill_rag_query',
    slug: 'rag-query',
    name: 'Knowledge Retriever',
    description: 'Answer questions using retrieved context with citations and confidence scores.',
    version: '1.0.3',
    category: 'knowledge',
    tags: ['rag', 'search', 'citations'],
    creditCost: 4,
    certified: false,
    icon: 'book-open',
    installCount: 7200,
    rating: 4.5,
    instructions:
      'Answer using only the provided context. Cite sources inline. If context is insufficient, say so. Include a confidence score (low/medium/high) at the end.',
  },
  {
    id: 'skill_compliance_check',
    slug: 'compliance-check',
    name: 'Compliance Checker',
    description: 'Map policies and controls to evidence gaps for SOC 2, ISO 27001, and GDPR.',
    version: '1.3.0',
    category: 'compliance',
    tags: ['compliance', 'audit', 'gdpr'],
    creditCost: 12,
    certified: true,
    icon: 'scale',
    installCount: 4100,
    rating: 4.7,
    instructions:
      'Review the provided policy or control description against the framework. List gaps, required evidence, and remediation steps. Use clear severity labels: critical, high, medium, low.',
  },
  {
    id: 'skill_report_analyst',
    slug: 'report-analyst',
    name: 'Report Analyst',
    description: 'Analyze metrics dashboards and highlight trends, anomalies, and recommendations.',
    version: '1.0.0',
    category: 'analytics',
    tags: ['analytics', 'kpi', 'insights'],
    creditCost: 7,
    certified: false,
    icon: 'bar-chart-3',
    installCount: 5300,
    rating: 4.4,
    instructions:
      'Analyze the provided metrics or data. Identify trends, anomalies, and correlations. Give 3 actionable recommendations ranked by impact. Use bullet points and plain language.',
  },
  {
    id: 'skill_workflow_automator',
    slug: 'workflow-automator',
    name: 'Workflow Automator',
    description: 'Design automation steps, triggers, and error handling for business workflows.',
    version: '0.9.2',
    category: 'automation',
    tags: ['workflow', 'automation', 'triggers'],
    creditCost: 5,
    certified: false,
    icon: 'zap',
    installCount: 3600,
    rating: 4.3,
    instructions:
      'Design a workflow automation plan: triggers, steps, conditions, error handling, and rollback. Output as numbered steps with tool/integration suggestions.',
  },
];

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  communication: 'Communication',
  developer_tools: 'Developer',
  parsing: 'Parsing',
  reasoning: 'Reasoning',
  finance: 'Finance',
  knowledge: 'Knowledge',
  compliance: 'Compliance',
  analytics: 'Analytics',
  automation: 'Automation',
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadInstalledRefs(): InstalledSkillRef[] {
  return readJson<InstalledSkillRef[]>(INSTALLED_KEY, []);
}

export function saveInstalledRefs(refs: InstalledSkillRef[]): void {
  writeJson(INSTALLED_KEY, refs);
}

export function installSkill(id: string, source: SkillSource): InstalledSkillRef[] {
  const refs = loadInstalledRefs();
  if (refs.some((r) => r.id === id)) return refs;
  const next = [...refs, { id, source, installedAt: new Date().toISOString() }];
  saveInstalledRefs(next);
  return next;
}

export function uninstallSkill(id: string): InstalledSkillRef[] {
  const next = loadInstalledRefs().filter((r) => r.id !== id);
  saveInstalledRefs(next);
  return next;
}

export function reorderInstalledSkills(orderedIds: string[]): InstalledSkillRef[] {
  const refs = loadInstalledRefs();
  const byId = new Map(refs.map((r) => [r.id, r]));
  const next: InstalledSkillRef[] = [];
  for (const id of orderedIds) {
    const ref = byId.get(id);
    if (ref) {
      next.push(ref);
      byId.delete(id);
    }
  }
  for (const ref of byId.values()) next.push(ref);
  saveInstalledRefs(next);
  return next;
}

export function isSkillInstalled(id: string): boolean {
  return loadInstalledRefs().some((r) => r.id === id);
}

export function loadCustomSkills(): CustomSkill[] {
  return readJson<CustomSkill[]>(CUSTOM_KEY, []);
}

export function saveCustomSkill(input: {
  id?: string;
  name: string;
  description: string;
  instructions: string;
  tags: string[];
}): CustomSkill {
  const now = new Date().toISOString();
  const skills = loadCustomSkills();
  const existing = input.id ? skills.find((s) => s.id === input.id) : undefined;

  const skill: CustomSkill = {
    id: existing?.id ?? `custom_${Date.now()}`,
    name: input.name.trim(),
    description: input.description.trim(),
    instructions: input.instructions.trim(),
    tags: input.tags.filter(Boolean),
    category: 'custom',
    version: existing?.version ?? '1.0.0',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const next = existing
    ? skills.map((s) => (s.id === skill.id ? skill : s))
    : [...skills, skill];
  writeJson(CUSTOM_KEY, next);
  return skill;
}

export function deleteCustomSkill(id: string): CustomSkill[] {
  const next = loadCustomSkills().filter((s) => s.id !== id);
  writeJson(CUSTOM_KEY, next);
  uninstallSkill(id);
  return next;
}

export function getMarketplaceSkill(id: string): MarketplaceSkill | undefined {
  return DEMO_MARKETPLACE_SKILLS.find((s) => s.id === id);
}

export function getCustomSkill(id: string): CustomSkill | undefined {
  return loadCustomSkills().find((s) => s.id === id);
}

export function resolveSkill(id: string, source: SkillSource): LibrarySkill | undefined {
  if (source === 'custom') {
    const skill = getCustomSkill(id);
    return skill ? { ...skill, source: 'custom', installed: isSkillInstalled(id) } : undefined;
  }
  const skill = getMarketplaceSkill(id);
  return skill ? { ...skill, source: 'marketplace', installed: isSkillInstalled(id) } : undefined;
}

export function getAllLibrarySkills(): LibrarySkill[] {
  const installed = new Set(loadInstalledRefs().map((r) => r.id));
  const marketplace = DEMO_MARKETPLACE_SKILLS.map((s) => ({
    ...s,
    source: 'marketplace' as const,
    installed: installed.has(s.id),
  }));
  const custom = loadCustomSkills().map((s) => ({
    ...s,
    source: 'custom' as const,
    installed: installed.has(s.id),
  }));
  return [...marketplace, ...custom];
}

export function getMySkills(): LibrarySkill[] {
  const refs = loadInstalledRefs();
  const result: LibrarySkill[] = [];
  for (const ref of refs) {
    const skill = resolveSkill(ref.id, ref.source);
    if (skill) result.push({ ...skill, installed: true });
  }
  const customNotInstalled = loadCustomSkills()
    .filter((s) => !refs.some((r) => r.id === s.id))
    .map((s) => ({ ...s, source: 'custom' as const, installed: false }));
  return [...result, ...customNotInstalled];
}

export function filterSkills(
  skills: LibrarySkill[],
  query: string,
  category: string,
): LibrarySkill[] {
  let result = [...skills];
  if (category !== 'all') {
    result = result.filter((s) => s.category === category || ('tags' in s && s.tags.includes(category)));
  }
  const q = query.trim().toLowerCase();
  if (q) {
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return result;
}

export function formatInstallCount(count: number): string {
  if (count >= 10_000) return `${Math.round(count / 1000)}K+`;
  if (count >= 1_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
  return count.toLocaleString();
}

export function demoExecuteSkill(skill: LibrarySkill, input: string): string {
  const preview = input.trim().slice(0, 120) || '(no input provided)';
  return [
    `[Demo · ${skill.name} v${skill.version}]`,
    '',
    `Input: "${preview}${input.length > 120 ? '…' : ''}"`,
    '',
    'This is demo mode on static hosting. In production, the skill routes through the marketplace runtime with credit checks and audit logging.',
    '',
    'System instructions loaded:',
    '---',
    skill.instructions.slice(0, 400) + (skill.instructions.length > 400 ? '…' : ''),
    '---',
    '',
    'Connect the Node.js deploy or Laravel proxy for live skill execution.',
  ].join('\n');
}
