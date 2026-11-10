import { createId } from '@ai-pass/shared';
import type { Skill, SkillAuditLog } from './types.js';
import { SkillRegistry } from './skill-registry.js';

export interface SkillValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class SkillLifecycleService {
  private auditLogs: SkillAuditLog[] = [];

  constructor(private registry: SkillRegistry) {}

  validate(skill: Skill): SkillValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!skill.name.trim()) errors.push('Skill name is required');
    if (!skill.inputSchema || typeof skill.inputSchema !== 'object') errors.push('inputSchema must be an object');
    if (!skill.outputSchema || typeof skill.outputSchema !== 'object') errors.push('outputSchema must be an object');
    if (skill.creditCost < 0) errors.push('creditCost must be non-negative');
    if (skill.explainabilityRequired && skill.riskLevel === 'critical') {
      warnings.push('Critical-risk skills require governance review');
    }

    this.log({
      skillId: skill.id,
      tenantId: 'system',
      userId: 'system',
      action: 'validate',
      input: { skillId: skill.id },
      output: { valid: errors.length === 0, errors, warnings },
    });

    return { valid: errors.length === 0, errors, warnings };
  }

  estimateCredits(skillId: string, input: Record<string, unknown>): number {
    const skill = this.registry.get(skillId);
    if (!skill) throw new Error(`Skill not found: ${skillId}`);

    let estimate = skill.creditCost;
    const inputSize = JSON.stringify(input).length;
    if (inputSize > 10_000) estimate = Math.ceil(estimate * 1.5);
    if (!skill.deterministic) estimate = Math.ceil(estimate * 1.2);

    this.log({
      skillId,
      tenantId: 'system',
      userId: 'system',
      action: 'estimate',
      input,
      creditsEstimated: estimate,
    });

    return estimate;
  }

  executeMock(skill: Skill, input: Record<string, unknown>): Record<string, unknown> {
    switch (skill.category) {
      case 'parsing':
        return { fields: input, extracted: Object.keys(input).length };
      case 'ocr':
        return { text: String(input.image ?? input.document ?? ''), confidence: 0.91 };
      case 'decision':
        return { decision: 'NEEDS_INFO', input, skill: skill.name };
      case 'retrieval':
      case 'rag':
      case 'knowledge':
        return { documents: [], query: input, skill: skill.name };
      case 'automation':
        return { triggered: true, workflow: skill.name, input };
      case 'communication':
        return { message: 'Response generated', channel: input.channel ?? 'text' };
      case 'analytics':
        return { metrics: { processed: 1 }, input };
      case 'vision':
        return { labels: [], confidence: 0.92 };
      case 'voice':
        return { transcript: String(input.text ?? ''), durationMs: 1200 };
      case 'compliance':
        return { compliant: true, checks: ['policy', 'pii'] };
      case 'translation':
        return { translation: String(input.text ?? ''), targetLang: input.targetLang ?? 'en' };
      case 'api_integration':
        return { synced: true, record: input.record ?? input };
      case 'computer_action':
        return { action: 'completed', target: input.target ?? 'screen' };
      default:
        return { result: 'ok', skill: skill.name, input };
    }
  }

  log(entry: Omit<SkillAuditLog, 'id' | 'timestamp'>): SkillAuditLog {
    const log: SkillAuditLog = {
      ...entry,
      id: `audit_${createId()}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(log);
    return log;
  }

  getAuditLogs(skillId?: string): SkillAuditLog[] {
    return skillId
      ? this.auditLogs.filter((l) => l.skillId === skillId)
      : [...this.auditLogs];
  }
}
