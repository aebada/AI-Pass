/** GDPR / PII / consent / retention compliance stubs */
export interface ConsentRecord {
  customerId: string;
  tenantId: string;
  purposes: string[];
  grantedAt: string;
  expiresAt?: string;
}

export interface PiiScanResult {
  hasPii: boolean;
  fields: string[];
  redactedText: string;
}

export class ComplianceService {
  private consents = new Map<string, ConsentRecord>();

  recordConsent(record: ConsentRecord): ConsentRecord {
    this.consents.set(`${record.tenantId}:${record.customerId}`, record);
    return record;
  }

  hasConsent(tenantId: string, customerId: string): boolean {
    return this.consents.has(`${tenantId}:${customerId}`);
  }

  scanPii(text: string): PiiScanResult {
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
    const phonePattern = /\+?\d[\d\s-]{8,}/g;
    const fields: string[] = [];
    let redacted = text;

    if (emailPattern.test(text)) {
      fields.push('email');
      redacted = redacted.replace(emailPattern, '[EMAIL_REDACTED]');
    }
    if (phonePattern.test(text)) {
      fields.push('phone');
      redacted = redacted.replace(phonePattern, '[PHONE_REDACTED]');
    }

    return { hasPii: fields.length > 0, fields, redactedText: redacted };
  }

  getRetentionDays(tenantId: string): number {
    return tenantId ? 365 : 90;
  }

  shouldRetain(createdAt: string, retentionDays: number): boolean {
    const age = Date.now() - new Date(createdAt).getTime();
    return age < retentionDays * 86400000;
  }
}

export const defaultComplianceService = new ComplianceService();
