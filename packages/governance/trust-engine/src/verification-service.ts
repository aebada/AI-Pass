import type { Certification, VerificationRecord } from './types.js';

export class VerificationService {
  constructor(private getCert: (id: string) => Certification | undefined) {}

  verify(verificationId: string): VerificationRecord | undefined {
    const cert = this.getCert(verificationId);
    if (!cert) return undefined;

    const now = new Date();
    const expired = new Date(cert.validUntil) < now;
    let publicStatus: VerificationRecord['publicStatus'] = 'active';

    if (cert.status === 'revoked') publicStatus = 'revoked';
    else if (cert.status === 'under_review') publicStatus = 'under_review';
    else if (expired || cert.status === 'expired') publicStatus = 'expired';

    return {
      verificationId: cert.verificationId,
      companyName: cert.companyName,
      productName: cert.productName,
      certificationStatus: cert.status,
      trustScore: cert.scorecard.overall,
      riskLevel: cert.riskClass,
      certificationLevel: cert.level,
      scope: `${cert.productName} — ${cert.level} certification with ${cert.controls.length} controls`,
      validFrom: cert.validFrom,
      validUntil: cert.validUntil,
      issuedAt: cert.validFrom,
      publicStatus,
    };
  }

  isValid(verificationId: string): boolean {
    const record = this.verify(verificationId);
    return record?.publicStatus === 'active';
  }
}
