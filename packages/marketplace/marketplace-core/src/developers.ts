import { createId } from '@ai-pass/shared';
import type { DeveloperProfile, Review, TrustCertificate } from './types.js';

export class DeveloperService {
  private developers = new Map<string, DeveloperProfile>();

  register(dev: Omit<DeveloperProfile, 'createdAt'> & { createdAt?: string }): DeveloperProfile {
    const profile: DeveloperProfile = {
      ...dev,
      id: dev.id ?? `dev_${createId()}`,
      createdAt: dev.createdAt ?? new Date().toISOString(),
      slug: dev.slug ?? dev.name.toLowerCase().replace(/\s+/g, '-'),
      appCount: dev.appCount ?? 0,
      skillCount: dev.skillCount ?? 0,
      totalRevenue: dev.totalRevenue ?? 0,
      reputationScore: dev.reputationScore ?? (dev.verified ? 4.5 : 3.5),
      badges: dev.badges ?? (dev.verified
        ? [{ type: 'verified_developer', label: 'Verified Developer', issuedAt: new Date().toISOString() }]
        : []),
    };
    this.developers.set(profile.id, profile);
    return profile;
  }

  get(id: string): DeveloperProfile | undefined {
    return this.developers.get(id);
  }

  list(): DeveloperProfile[] {
    return [...this.developers.values()].sort((a, b) => b.reputationScore - a.reputationScore);
  }

  getTop(limit = 10): DeveloperProfile[] {
    return this.list().slice(0, limit);
  }

  incrementAppCount(developerId: string): void {
    const dev = this.developers.get(developerId);
    if (dev) dev.appCount += 1;
  }

  incrementSkillCount(developerId: string): void {
    const dev = this.developers.get(developerId);
    if (dev) dev.skillCount += 1;
  }
}

export class ReviewService {
  private reviews = new Map<string, Review[]>();

  add(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const entry: Review = {
      ...review,
      id: `rev_${createId()}`,
      createdAt: new Date().toISOString(),
    };
    const existing = this.reviews.get(review.resourceId) ?? [];
    existing.push(entry);
    this.reviews.set(review.resourceId, existing);
    return entry;
  }

  reply(reviewId: string, resourceId: string, reply: string): Review | undefined {
    const reviews = this.reviews.get(resourceId) ?? [];
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return undefined;
    review.developerReply = reply;
    review.developerReplyAt = new Date().toISOString();
    return review;
  }

  reportAbuse(reviewId: string, resourceId: string, reason: string): Review | undefined {
    const reviews = this.reviews.get(resourceId) ?? [];
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return undefined;
    review.abuseReported = true;
    review.abuseReason = reason;
    return review;
  }

  listForResource(resourceId: string): Review[] {
    return this.reviews.get(resourceId) ?? [];
  }

  averageRating(resourceId: string): number {
    const reviews = this.listForResource(resourceId);
    if (!reviews.length) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }
}

export class CertificationRegistry {
  private certificates = new Map<string, TrustCertificate>();

  issue(cert: Omit<TrustCertificate, 'id'> & { id?: string }): TrustCertificate {
    const entry: TrustCertificate = {
      ...cert,
      id: cert.id ?? `cert_${createId()}`,
    };
    this.certificates.set(entry.id, entry);
    return entry;
  }

  get(id: string): TrustCertificate | undefined {
    return this.certificates.get(id);
  }

  listForResource(resourceType: TrustCertificate['resourceType'], resourceId: string): TrustCertificate[] {
    return [...this.certificates.values()].filter(
      (c) => c.resourceType === resourceType && c.resourceId === resourceId,
    );
  }
}
