import { createId } from '@ai-pass/shared';
import type {
  AISystem,
  AIUseCase,
  Audit,
  Control,
  EmployeeCompliance,
  Evidence,
  Framework,
  FrameworkCode,
  Policy,
  Risk,
  Task,
  TrustCenter,
  Vendor,
} from '../types.js';

export class ComplianceStore {
  frameworks = new Map<string, Framework>();
  controls = new Map<string, Control>();
  tasks = new Map<string, Task>();
  risks = new Map<string, Risk>();
  vendors = new Map<string, Vendor>();
  employees = new Map<string, EmployeeCompliance>();
  policies = new Map<string, Policy>();
  evidence = new Map<string, Evidence>();
  audits: Audit[] = [];
  trustCenters = new Map<string, TrustCenter>();
  aiSystems = new Map<string, AISystem>();
  aiUseCases = new Map<string, AIUseCase>();
  publishedTrustCenters = new Map<string, TrustCenter>();

  seed(items: {
    frameworks: Framework[];
    controls: Control[];
    tasks: Task[];
    risks: Risk[];
    vendors: Vendor[];
    employees: EmployeeCompliance[];
    policies: Policy[];
    evidence: Evidence[];
    audits: Audit[];
    trustCenter: TrustCenter;
    aiSystems: AISystem[];
    aiUseCases: AIUseCase[];
  }): void {
    for (const f of items.frameworks) this.frameworks.set(f.id, f);
    for (const c of items.controls) this.controls.set(c.id, c);
    for (const t of items.tasks) this.tasks.set(t.id, t);
    for (const r of items.risks) this.risks.set(r.id, r);
    for (const v of items.vendors) this.vendors.set(v.id, v);
    for (const e of items.employees) this.employees.set(e.id, e);
    for (const p of items.policies) this.policies.set(p.id, p);
    for (const e of items.evidence) this.evidence.set(e.id, e);
    this.audits = [...items.audits];
    this.trustCenters.set(items.trustCenter.id, items.trustCenter);
    if (items.trustCenter.status === 'published') {
      this.publishedTrustCenters.set(items.trustCenter.orgSlug, items.trustCenter);
    }
    for (const s of items.aiSystems) this.aiSystems.set(s.id, s);
    for (const u of items.aiUseCases) this.aiUseCases.set(u.id, u);
  }

  listByTenant<T extends { tenantId: string }>(map: Map<string, T>, tenantId: string): T[] {
    return [...map.values()].filter((item) => item.tenantId === tenantId);
  }
}

export function hashAudit(details: Record<string, unknown>): string {
  const str = JSON.stringify(details);
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return `sha256:${Math.abs(hash).toString(16)}`;
}

export function newId(prefix: string): string {
  return `${prefix}_${createId()}`;
}

export const ALL_FRAMEWORK_CODES: FrameworkCode[] = [
  'ISO_27001', 'ISO_42001', 'SOC2', 'GDPR', 'NIS2', 'DORA', 'TISAX', 'ISO_9001', 'ISO_27701', 'ISO_27018',
];
