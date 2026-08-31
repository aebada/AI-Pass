import { createId, type AgentDecision } from '@ai-pass/shared';
import type { Invoice, ValidationResult, Vendor } from '@ai-pass/shared/invoice-ai';

export class ValidationEngine {
  validate(invoice: Invoice, vendor?: Vendor): ValidationResult {
    const checks: ValidationResult['checks'] = [];

    const hasNumber = Boolean(invoice.invoiceNumber);
    checks.push({
      rule: 'required_fields',
      passed: hasNumber && Boolean(invoice.vendorName),
      message: hasNumber ? 'All required fields present' : 'Missing invoice number',
      severity: hasNumber ? 'info' : 'error',
    });

    const amountOk = invoice.amount > 0;
    checks.push({
      rule: 'amount_positive',
      passed: amountOk,
      message: amountOk ? 'Amount is valid' : 'Amount must be positive',
      severity: amountOk ? 'info' : 'error',
    });

    const budgetOk = invoice.amount <= 15000;
    checks.push({
      rule: 'budget_check',
      passed: budgetOk,
      message: budgetOk ? 'Within budget threshold' : 'Exceeds department budget threshold',
      severity: budgetOk ? 'info' : 'warning',
    });

    if (vendor) {
      const vendorOk = vendor.status === 'active';
      checks.push({
        rule: 'vendor_status',
        passed: vendorOk,
        message: vendorOk ? 'Vendor is active' : `Vendor status: ${vendor.status}`,
        severity: vendorOk ? 'info' : 'error',
      });
    }

    const errors = checks.filter((c) => !c.passed && c.severity === 'error');
    const warnings = checks.filter((c) => !c.passed && c.severity === 'warning');
    const passed = errors.length === 0;
    let decision: AgentDecision = 'PASS';
    if (errors.length > 0) decision = 'FAIL';
    else if (warnings.length > 0) decision = 'NEEDS_INFO';

    return {
      id: `val_${createId()}`,
      invoiceId: invoice.id,
      passed,
      decision,
      checks,
      confidence: passed ? 0.92 : warnings.length ? 0.78 : 0.45,
      validatedAt: new Date().toISOString(),
    };
  }
}
