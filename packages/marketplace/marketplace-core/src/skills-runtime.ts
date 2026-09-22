import type { Skill, SkillAuditLog } from './types.js';
import { SkillRegistry } from './skill-registry.js';
import { SkillLifecycleService } from './skill-lifecycle.js';

/** Runtime skill types mapped to marketplace categories */
export type RuntimeSkillType =
  | 'parsing'
  | 'ocr'
  | 'reasoning'
  | 'decision'
  | 'email'
  | 'slack'
  | 'retrieval'
  | 'rag'
  | 'voice'
  | 'translation'
  | 'api'
  | 'automation'
  | 'reporting'
  | 'compliance'
  | 'knowledge';

export const RUNTIME_SKILL_TYPES: RuntimeSkillType[] = [
  'parsing', 'ocr', 'reasoning', 'decision', 'email', 'slack',
  'retrieval', 'rag', 'voice', 'translation', 'api', 'automation',
  'reporting', 'compliance', 'knowledge',
];

export interface SkillExecuteRequest {
  skillId: string;
  input: Record<string, unknown>;
  tenantId: string;
  userId: string;
}

export interface SkillExecuteResponse {
  skillId: string;
  output: Record<string, unknown>;
  creditsUsed: number;
  confidence: number;
  auditLogId: string;
}

export interface SkillsListResponse {
  skills: Skill[];
  total: number;
}

/**
 * Skills Framework facade — Register, Validate, Execute, Log, Version, Monitor.
 * Execution routes through marketplace lifecycle; production runs use runtime-core Tool Router.
 */
export class SkillsRuntimeService {
  constructor(
    private registry: SkillRegistry,
    private lifecycle: SkillLifecycleService,
  ) {}

  list(category?: string): SkillsListResponse {
    const skills = this.registry.list(category as never);
    return { skills, total: skills.length };
  }

  get(skillId: string): Skill | undefined {
    return this.registry.get(skillId);
  }

  register(skill: Parameters<SkillRegistry['register']>[0]): Skill {
    const validation = this.lifecycle.validate(skill as Skill);
    if (!validation.valid) {
      throw new Error(`Skill validation failed: ${validation.errors.join(', ')}`);
    }
    return this.registry.register(skill);
  }

  execute(request: SkillExecuteRequest): SkillExecuteResponse {
    const skill = this.registry.get(request.skillId);
    if (!skill) throw new Error(`Skill not found: ${request.skillId}`);

    const validation = this.lifecycle.validate(skill);
    if (!validation.valid) {
      throw new Error(`Skill validation failed: ${validation.errors.join(', ')}`);
    }

    const creditsUsed = this.lifecycle.estimateCredits(request.skillId, request.input);
    const output = this.lifecycle.executeMock(skill, request.input);

    const log = this.lifecycle.log({
      skillId: request.skillId,
      tenantId: request.tenantId,
      userId: request.userId,
      action: 'execute',
      input: request.input,
      output,
      creditsUsed,
    });

    return {
      skillId: request.skillId,
      output,
      creditsUsed,
      confidence: skill.deterministic ? 0.95 : 0.72,
      auditLogId: log.id,
    };
  }

  getAuditLogs(skillId?: string): SkillAuditLog[] {
    return this.lifecycle.getAuditLogs(skillId);
  }

  publishVersion(skillId: string, version: string, changelog?: string) {
    return this.registry.publishVersion(skillId, version, changelog);
  }
}
