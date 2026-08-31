import type { MembershipTier } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import { defaultRoutingEngine } from '@ai-pass/provider-hub';
import type { CopilotMessage } from '../types.js';
import { canAccessCopilot } from '../membership-gates.js';
import { defaultComplianceKnowledgeService } from '../knowledge.js';
import { defaultGovernanceIntegration } from '../governance-integration.js';
import { ComplianceStore } from './store.js';

const COPILOT_CREDITS = {
  explain: 3,
  remediate: 5,
  policy: 8,
  gap: 5,
  audit: 10,
  readiness: 8,
  chat: 4,
} as const;

export class CopilotService {
  private sessions = new Map<string, CopilotMessage[]>();

  constructor(private store: ComplianceStore) {}

  async chat(params: {
    tenantId: string;
    userId: string;
    message: string;
    sessionId?: string;
    tier: MembershipTier;
  }): Promise<{ sessionId: string; message: CopilotMessage; creditsUsed: number }> {
    if (!canAccessCopilot(params.tier)) {
      throw new Error('Compliance Copilot requires Power plan or higher');
    }

    const sessionId = params.sessionId ?? `sess_${Date.now()}`;
    const history = this.sessions.get(sessionId) ?? [];

    const frameworks = [...this.store.frameworks.values()].filter((f) => f.tenantId === params.tenantId && f.active);
    const risks = [...this.store.risks.values()].filter((r) => r.tenantId === params.tenantId);
    const policies = [...this.store.policies.values()].filter((p) => p.tenantId === params.tenantId);
    const evidence = [...this.store.evidence.values()].filter((e) => e.tenantId === params.tenantId);
    const govSystems = defaultGovernanceIntegration.listAISystems();

    const rag = await defaultComplianceKnowledgeService.retrieveFrameworkContext(params.message);
    const route = defaultRoutingEngine.select({
      taskType: 'chat',
      membershipTier: params.tier,
      orgId: params.tenantId,
    });

    const intent = this.detectIntent(params.message);
    const creditsUsed = COPILOT_CREDITS[intent] ?? COPILOT_CREDITS.chat;

    const response = this.generateGroundedResponse({
      message: params.message,
      intent,
      frameworks,
      risks,
      policies,
      evidence,
      govSystems: govSystems.length,
      ragExcerpts: rag.excerpts,
      modelId: route.model.id,
    });

    const userMsg: CopilotMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: params.message,
      createdAt: new Date().toISOString(),
    };
    const assistantMsg: CopilotMessage = {
      id: `msg_${Date.now()}_a`,
      role: 'assistant',
      content: response,
      citations: [
        ...frameworks.slice(0, 2).map((f) => ({ type: 'framework', id: f.id, title: f.name })),
        ...risks.slice(0, 2).map((r) => ({ type: 'risk', id: r.id, title: r.title })),
        ...policies.slice(0, 1).map((p) => ({ type: 'policy', id: p.id, title: p.title })),
      ],
      creditsUsed,
      createdAt: new Date().toISOString(),
    };

    history.push(userMsg, assistantMsg);
    this.sessions.set(sessionId, history);

    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: route.provider.name,
      model: route.model.id,
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.002,
      taskType: `compliance_copilot_${intent}`,
      module: 'compliance-ai',
      metadata: { sessionId, intent },
    });

    return { sessionId, message: assistantMsg, creditsUsed };
  }

  private detectIntent(message: string): keyof typeof COPILOT_CREDITS {
    const m = message.toLowerCase();
    if (m.includes('remediat') || m.includes('fix')) return 'remediate';
    if (m.includes('policy') || m.includes('generate')) return 'policy';
    if (m.includes('gap')) return 'gap';
    if (m.includes('audit')) return 'audit';
    if (m.includes('iso') || m.includes('readiness')) return 'readiness';
    if (m.includes('explain') || m.includes('what is')) return 'explain';
    return 'chat';
  }

  private generateGroundedResponse(ctx: {
    message: string;
    intent: string;
    frameworks: { name: string; progress: number; code: string }[];
    risks: { title: string; severity: string; category: string }[];
    policies: { title: string; status: string }[];
    evidence: { title: string; status: string }[];
    govSystems: number;
    ragExcerpts: string[];
    modelId: string;
  }): string {
    const fwSummary = ctx.frameworks.map((f) => `${f.name} (${f.progress}%)`).join(', ') || 'No active frameworks';
    const riskSummary = ctx.risks.filter((r) => r.severity === 'high' || r.severity === 'critical').map((r) => r.title).join('; ') || 'No critical risks';
    const base = `Based on your org data (${ctx.govSystems} AI systems in governance inventory):\n\nActive frameworks: ${fwSummary}.\nHigh-priority risks: ${riskSummary}.\nEvidence items: ${ctx.evidence.length} (${ctx.evidence.filter((e) => e.status === 'validated').length} validated).\n\n`;

    switch (ctx.intent) {
      case 'remediate':
        return `${base}Recommended remediation: Address open high-severity risks first. For "${ctx.risks[0]?.title ?? 'top risk'}", link mitigating controls and collect evidence via automated workflows.`;
      case 'policy':
        return `${base}Policy draft suggestion: Align with ${ctx.frameworks[0]?.code ?? 'ISO 27001'} controls. Current policies: ${ctx.policies.map((p) => p.title).join(', ')}. Use Policy Center templates for AI governance or incident response.`;
      case 'gap':
        return `${base}Gap analysis: ${ctx.frameworks.map((f) => `${f.name} at ${f.progress}% — focus on controls below 70% progress`).join('. ')}.`;
      case 'audit':
        return `${base}Audit prep: ${ctx.evidence.filter((e) => e.status === 'pending').length} evidence items pending. Schedule vendor reviews and complete overdue tasks before external audit.`;
      case 'readiness':
        return `${base}ISO readiness: ISO 27001 at ${ctx.frameworks.find((f) => f.code === 'ISO_27001')?.progress ?? 0}%, ISO 42001 at ${ctx.frameworks.find((f) => f.code === 'ISO_42001')?.progress ?? 0}%. Target certification dates on track with evidence collection workflows.`;
      default:
        return `${base}Framework context: ${ctx.ragExcerpts[0]}\n\n[Routed via ${ctx.modelId}] ${ctx.message.includes('?') ? 'See linked controls, policies, and risks in citations.' : 'Ask about gaps, remediation, policies, or audit readiness.'}`;
    }
  }
}
