import { createId } from '@ai-pass/shared';
import type { InvoiceUseCase, InvoiceUseCaseId } from '@ai-pass/shared/invoice-ai';

export const BUILTIN_USE_CASES: InvoiceUseCase[] = [
  {
    id: 'bookkeeping',
    name: 'Bookkeeping Automation',
    description:
      'Auto-post double-entry journal lines, DATEV SKR03 mapping, accounts payable reconciliation',
    industry: 'accounting',
    complianceFrameworks: ['DATEV', 'EU_VAT'],
    enabled: true,
  },
  {
    id: 'tax_declaration',
    name: 'Tax Declaration',
    description:
      'VAT validation, EU fiscal reporting, ZATCA e-invoicing, UAE FTA compliance, quarterly declarations',
    industry: 'tax',
    complianceFrameworks: ['EU_VAT', 'ZATCA', 'UAE_FTA'],
    enabled: false,
  },
  {
    id: 'insurance_claims',
    name: 'Insurance Claims',
    description:
      'Claims validation, coverage verification, medical billing cross-check, fraud scoring for insurers',
    industry: 'insurance',
    complianceFrameworks: ['Insurance_Claims', 'GDPR'],
    enabled: false,
  },
  {
    id: 'public_sector',
    name: 'Public Sector Procurement',
    description:
      'Tender compliance, budget authorization, multi-department approval, audit-ready exports',
    industry: 'public_sector',
    complianceFrameworks: ['EU_VAT', 'Public_Procurement'],
    enabled: false,
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Medical Billing',
    description: 'Treatment codes, reimbursement validation, duplicate claim detection',
    industry: 'healthcare',
    complianceFrameworks: ['GDPR', 'EU_VAT'],
    enabled: false,
  },
  {
    id: 'financial_services',
    name: 'Financial Services',
    description: 'AML anomaly detection, multi-entity cost allocation, tax classification',
    industry: 'financial_services',
    complianceFrameworks: ['AML', 'EU_VAT'],
    enabled: false,
  },
  {
    id: 'construction_procure_to_pay',
    name: 'Construction Procure-to-Pay',
    description:
      'Digital delivery notes, PO matching, 3-way invoice verification, AI account assignments, cash discount tracking, material consumption — comstruct.com-style',
    industry: 'construction',
    complianceFrameworks: ['DATEV', 'EU_VAT', 'Procure_to_Pay'],
    enabled: false,
  },
  {
    id: 'supply_chain',
    name: 'Supply Chain Sourcing',
    description:
      'Multi-vendor offer intake, quote comparison, user-defined procurement rules, vendor risk scoring, and AI award recommendations',
    industry: 'construction',
    complianceFrameworks: ['EU_VAT', 'Procure_to_Pay', 'Public_Procurement'],
    enabled: false,
  },
];

export class UseCaseEngine {
  private useCases = new Map<string, InvoiceUseCase>();
  private activeUseCaseId: string = 'bookkeeping';

  constructor() {
    for (const uc of BUILTIN_USE_CASES) {
      this.useCases.set(uc.id, { ...uc });
    }
  }

  listUseCases(): InvoiceUseCase[] {
    return [...this.useCases.values()];
  }

  getActiveUseCase(): InvoiceUseCase {
    return this.useCases.get(this.activeUseCaseId) ?? BUILTIN_USE_CASES[0]!;
  }

  setActiveUseCase(id: string): InvoiceUseCase {
    const uc = this.useCases.get(id);
    if (!uc) throw new Error(`Use case not found: ${id}`);
    for (const [key, value] of this.useCases) {
      this.useCases.set(key, { ...value, enabled: key === id });
    }
    this.activeUseCaseId = id;
    return uc;
  }

  createCustomUseCase(params: {
    name: string;
    description: string;
    industry: string;
    complianceFrameworks: string[];
  }): InvoiceUseCase {
    const id = `custom_${createId()}`;
    const useCase: InvoiceUseCase = {
      id,
      name: params.name,
      description: params.description,
      industry: params.industry,
      complianceFrameworks: params.complianceFrameworks,
      enabled: false,
      isCustom: true,
    };
    this.useCases.set(id, useCase);
    return useCase;
  }

  installPackAsUseCase(packId: string, packName: string, industry: string): InvoiceUseCase {
    const mapping: Record<string, InvoiceUseCaseId> = {
      pack_insurance: 'insurance_claims',
      pack_healthcare: 'healthcare',
      pack_financial_services: 'financial_services',
      pack_public_sector: 'public_sector',
      pack_construction: 'construction_procure_to_pay',
      pack_supply_chain: 'supply_chain',
    };
    const builtinId = mapping[packId];
    if (builtinId) {
      return this.setActiveUseCase(builtinId);
    }
    return this.createCustomUseCase({
      name: packName,
      description: `Automation pack: ${packName}`,
      industry,
      complianceFrameworks: ['EU_VAT'],
    });
  }
}
