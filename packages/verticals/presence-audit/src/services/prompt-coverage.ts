import { createId, type Company, type Prompt } from '@ai-pass/shared';

export const PREDEFINED_PROMPTS: Omit<Prompt, 'id' | 'companyId' | 'isCustom'>[] = [
  { prompt: 'Best {industry} platforms for enterprises', language: 'en', category: 'discovery', cluster: 'enterprise' },
  { prompt: 'Top AI visibility tools in {industry}', language: 'en', category: 'ranking', cluster: 'tools' },
  { prompt: 'Alternatives to {competitor} for AI governance', language: 'en', category: 'competitive', cluster: 'alternatives' },
  { prompt: 'How to improve AI recommendation visibility', language: 'en', category: 'education', cluster: 'how-to' },
  { prompt: 'Beste {industry} Plattformen in Europa', language: 'de', category: 'regional', cluster: 'europe', region: 'EU' },
  { prompt: 'Meilleures solutions {industry} en France', language: 'fr', category: 'regional', cluster: 'europe', region: 'FR' },
];

export class PromptCoverage {
  private customPrompts = new Map<string, Prompt[]>();

  buildPrompts(company: Company, customLimit: number): Prompt[] {
    const predefined = PREDEFINED_PROMPTS.map((p) => ({
      ...p,
      id: `prompt_${createId()}`,
      companyId: company.id,
      isCustom: false,
      prompt: p.prompt
        .replace('{industry}', company.industry)
        .replace('{competitor}', company.competitors[0] ?? 'competitor'),
    }));

    const custom = (this.customPrompts.get(company.id) ?? []).slice(0, customLimit);
    return [...predefined, ...custom];
  }

  addCustom(companyId: string, prompt: string, language = 'en', category = 'custom'): Prompt {
    const entry: Prompt = {
      id: `prompt_${createId()}`,
      companyId,
      prompt,
      language,
      category,
      isCustom: true,
    };
    const existing = this.customPrompts.get(companyId) ?? [];
    existing.push(entry);
    this.customPrompts.set(companyId, existing);
    return entry;
  }

  analyzeCoverage(_company: Company, prompts: Prompt[]) {
    const clusters = [...new Set(prompts.map((p) => p.cluster ?? p.category))];
    const languages = [...new Set(prompts.map((p) => p.language))];
    const missing = PREDEFINED_PROMPTS.filter(
      (p) => !prompts.some((q) => q.category === p.category && q.language === p.language),
    ).map((p) => p.prompt);

    return {
      total: prompts.length,
      custom: prompts.filter((p) => p.isCustom).length,
      clusters,
      languages,
      missingPrompts: missing,
      highValuePrompts: prompts.filter((p) => p.category === 'ranking' || p.category === 'competitive'),
    };
  }

  /** Scheduled execution stub */
  scheduleExecution(_companyId: string, _cron: string): { scheduled: boolean; nextRun: string } {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    return { scheduled: true, nextRun: next.toISOString() };
  }
}
