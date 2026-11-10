import { defaultInvoiceAIService } from '@ai-pass/invoice-ai';
import { createId, type AgentDecision, type InvoiceDocumentType, type InvoiceRecord } from '@ai-pass/shared';

export { INVOICE_AUTOMATION_PACKS } from '@ai-pass/invoice-ai';

/** @deprecated Use InvoiceAIService from @ai-pass/invoice-ai */
export class InvoiceAIEngine {
  processInvoice(params: {
    tenantId: string;
    documentType: InvoiceDocumentType;
    direction: InvoiceRecord['direction'];
    rawFields: Record<string, unknown>;
    amount?: number;
    currency?: string;
  }): InvoiceRecord {
    const extractedFields: InvoiceRecord['extractedFields'] = {};
    for (const [key, value] of Object.entries(params.rawFields)) {
      extractedFields[key] = { value, confidence: 0.85 + Math.random() * 0.1 };
    }

    const hasRequired = Boolean(params.rawFields.invoice_number || params.rawFields.vendor);
    const amountValid = params.amount === undefined || params.amount > 0;
    const decision: AgentDecision = hasRequired && amountValid ? 'PASS' : 'NEEDS_INFO';

    const record: InvoiceRecord = {
      id: `inv_${createId()}`,
      tenantId: params.tenantId,
      documentType: params.documentType,
      direction: params.direction,
      extractedFields,
      decision,
      amount: params.amount,
      currency: params.currency ?? 'EUR',
      processedAt: new Date().toISOString(),
    };

    return record;
  }

  getInvoice(id: string) {
    return defaultInvoiceAIService.getInvoice(id);
  }

  listByTenant(tenantId: string) {
    return defaultInvoiceAIService.listInvoices(tenantId);
  }
}
