import { createId, type CertificationLevel } from '@ai-pass/shared';
import type { Badge, Certification } from './types.js';

const LEVEL_COLORS: Record<CertificationLevel, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

export class BadgeService {
  private badges = new Map<string, Badge>();

  generate(cert: Certification): Badge {
    const color = LEVEL_COLORS[cert.level];
    const svgStub = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <circle cx="60" cy="60" r="55" fill="${color}" stroke="#1a1a2e" stroke-width="3"/>
  <text x="60" y="50" text-anchor="middle" font-size="10" fill="#1a1a2e" font-weight="bold">AI-PASS</text>
  <text x="60" y="68" text-anchor="middle" font-size="14" fill="#1a1a2e" font-weight="bold">${cert.level.toUpperCase()}</text>
  <text x="60" y="82" text-anchor="middle" font-size="8" fill="#1a1a2e">CERTIFIED</text>
</svg>`;

    const verificationUrl = `https://ai-pass.com${cert.verificationUrl}`;
    const badge: Badge = {
      id: `badge_${createId()}`,
      systemId: cert.systemId,
      certificationId: cert.id,
      level: cert.level,
      trustScore: cert.scorecard.overall,
      verificationId: cert.verificationId,
      verificationUrl,
      svgStub,
      pngStubUrl: `/api/trust/badges/${cert.verificationId}.png`,
      qrMetadata: { url: verificationUrl, issuedAt: cert.validFrom },
      embedCodes: {
        html: `<a href="${verificationUrl}" target="_blank" rel="noopener"><img src="/api/trust/badges/${cert.verificationId}.svg" alt="AI-Pass ${cert.level} Certified" width="80"/></a>`,
        markdown: `[![AI-Pass ${cert.level} Certified](${verificationUrl}/badge.svg)](${verificationUrl})`,
        iframe: `<iframe src="${verificationUrl}/embed" width="140" height="140" frameborder="0"></iframe>`,
      },
    };

    this.badges.set(badge.id, badge);
    this.badges.set(cert.verificationId, badge);
    return badge;
  }

  get(verificationId: string): Badge | undefined {
    return this.badges.get(verificationId);
  }

  listBySystem(systemId: string): Badge[] {
    const seen = new Set<string>();
    return [...this.badges.values()].filter((b) => {
      if (b.systemId !== systemId || seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }
}
