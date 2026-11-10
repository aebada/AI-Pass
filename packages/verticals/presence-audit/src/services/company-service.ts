import { createId, type Company } from '@ai-pass/shared';

export class CompanyService {
  private companies = new Map<string, Company>();

  create(
    tenantId: string,
    input: Omit<Company, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Company {
    const now = new Date().toISOString();
    const company: Company = {
      ...input,
      id: `co_${createId()}`,
      tenantId,
      createdAt: now,
      updatedAt: now,
    };
    this.companies.set(company.id, company);
    return company;
  }

  get(id: string): Company | undefined {
    return this.companies.get(id);
  }

  getByTenant(tenantId: string): Company | undefined {
    return [...this.companies.values()].find((c) => c.tenantId === tenantId);
  }

  update(id: string, patch: Partial<Omit<Company, 'id' | 'tenantId' | 'createdAt'>>): Company | undefined {
    const existing = this.companies.get(id);
    if (!existing) return undefined;
    const updated: Company = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.companies.set(id, updated);
    return updated;
  }

  list(tenantId?: string): Company[] {
    const all = [...this.companies.values()];
    return tenantId ? all.filter((c) => c.tenantId === tenantId) : all;
  }

  seed(company: Company): void {
    this.companies.set(company.id, company);
  }
}
