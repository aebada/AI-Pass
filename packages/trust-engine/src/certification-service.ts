import {
  CERTIFICATION_THRESHOLDS,
  createId,
  type CertificationLevel,
  type TrustScorecard,
  type RiskLevel,
} from '@ai-pass/shared';
import type { Certification, MonitoringPolicy, RenewalPolicy } from './types.js';

const VALIDITY_MONTHS: Record<CertificationLevel, number> = {
  bronze: 6,
  silver: 9,
  gold: 12,
  platinum: 12,
};

const LEVEL_CONTROLS: Record<CertificationLevel, string[]> = {
  bronze: ['Basic functional testing', 'Output logging', 'Annual review'],
  silver: ['Reliability testing', 'Explainability checks', 'Quarterly monitoring'],
  gold: ['Compliance mapping', 'Safety guardrails', 'Continuous monitoring', 'Incident response plan'],
  platinum: [
    'Full adversarial testing',
    'Multi-model validation',
    'Real-time monitoring',
    'ISO 42001 alignment',
    'Executive attestation',
  ],
};

const MONITORING_POLICIES: Record<CertificationLevel, MonitoringPolicy> = {
  bronze: { intervalHours: 168, alertThresholds: { score_drop: 15 }, autoRevalidation: false },
  silver: { intervalHours: 72, alertThresholds: { score_drop: 12, hallucination_rate: 5 }, autoRevalidation: false },
  gold: { intervalHours: 24, alertThresholds: { score_drop: 10, hallucination_rate: 3 }, autoRevalidation: true },
  platinum: { intervalHours: 6, alertThresholds: { score_drop: 5, hallucination_rate: 2 }, autoRevalidation: true },
};

const RENEWAL_POLICIES: Record<CertificationLevel, RenewalPolicy> = {
  bronze: { autoRenew: false, gracePeriodDays: 14, requiresRevalidation: true },
  silver: { autoRenew: false, gracePeriodDays: 21, requiresRevalidation: true },
  gold: { autoRenew: true, gracePeriodDays: 30, requiresRevalidation: true },
  platinum: { autoRenew: true, gracePeriodDays: 45, requiresRevalidation: false },
};

export class CertificationService {
  private records = new Map<string, Certification>();

  issue(params: {
    systemId: string;
    companyName: string;
    productName: string;
    level: CertificationLevel;
    scorecard: TrustScorecard;
    riskClass: RiskLevel;
    validUntil?: string;
    verificationId?: string;
  }): Certification {
    const now = new Date();
    const durationMonths = VALIDITY_MONTHS[params.level];
    const validUntil = params.validUntil
      ? new Date(params.validUntil)
      : (() => {
          const d = new Date(now);
          d.setMonth(d.getMonth() + durationMonths);
          return d;
        })();

    const verificationId = params.verificationId ?? `AIP-${createId().slice(0, 8).toUpperCase()}`;
    const id = `cert_${createId()}`;

    const record: Certification = {
      id,
      systemId: params.systemId,
      companyName: params.companyName,
      productName: params.productName,
      level: params.level,
      status: 'certified',
      validFrom: now.toISOString(),
      validUntil: validUntil.toISOString(),
      verificationId,
      verificationUrl: `/verify/${verificationId}`,
      scorecard: params.scorecard,
      riskClass: params.riskClass,
      controls: LEVEL_CONTROLS[params.level],
      monitoringPolicy: MONITORING_POLICIES[params.level],
      renewalPolicy: RENEWAL_POLICIES[params.level],
      durationMonths,
    };

    this.records.set(id, record);
    this.records.set(verificationId, record);
    return record;
  }

  get(certId: string): Certification | undefined {
    return this.records.get(certId);
  }

  getByVerificationId(verificationId: string): Certification | undefined {
    return this.records.get(verificationId);
  }

  verify(verificationId: string): Certification | undefined {
    const record = this.records.get(verificationId);
    if (!record) return undefined;

    if (record.status === 'revoked') return { ...record, status: 'revoked' };
    if (new Date(record.validUntil) < new Date()) {
      return { ...record, status: 'expired' };
    }
    return record;
  }

  revoke(certId: string): Certification | undefined {
    const record = this.records.get(certId);
    if (!record) return undefined;
    const revoked = { ...record, status: 'revoked' as const };
    this.records.set(certId, revoked);
    this.records.set(record.verificationId, revoked);
    return revoked;
  }

  listBySystem(systemId: string): Certification[] {
    const seen = new Set<string>();
    return [...this.records.values()].filter((r) => {
      if (r.systemId !== systemId || seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
  }

  listExpiring(withinDays = 30): Certification[] {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);
    const now = new Date();
    const seen = new Set<string>();
    return [...this.records.values()].filter((r) => {
      if (seen.has(r.id) || r.status !== 'certified') return false;
      seen.add(r.id);
      const expiry = new Date(r.validUntil);
      return expiry > now && expiry <= cutoff;
    });
  }

  listCertified(): Certification[] {
    const seen = new Set<string>();
    return [...this.records.values()].filter((r) => {
      if (seen.has(r.id) || r.status !== 'certified') return false;
      seen.add(r.id);
      return new Date(r.validUntil) >= new Date();
    });
  }

  meetsLevelRequirements(scorecard: TrustScorecard, level: CertificationLevel): boolean {
    const threshold = CERTIFICATION_THRESHOLDS[level];
    if (scorecard.overall < threshold.overall) return false;
    return Object.entries(threshold.requirements).every(
      ([key, min]) => scorecard[key as keyof TrustScorecard] >= min,
    );
  }
}
