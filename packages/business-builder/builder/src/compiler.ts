import { createId } from '@ai-pass/shared';
import type { RequirementSpec } from '@ai-pass/requirements';

export type SolutionPlatform = 'web' | 'mobile' | 'desktop' | 'workflow';

export interface SolutionModule {
  id: string;
  templateId: string;
  name: string;
  config: Record<string, unknown>;
}

export interface SolutionSpec {
  id: string;
  requirementId: string;
  name: string;
  description: string;
  platforms: SolutionPlatform[];
  modules: SolutionModule[];
  agents: Array<{ stepId: string; agentName: string; skillIds: string[] }>;
  screens: Array<{ screenId: string; route: string; platform: SolutionPlatform }>;
  governance: {
    requiresApproval: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    auditEnabled: boolean;
  };
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'generated' | 'pending_approval' | 'deployed';
}

export interface SolutionPreview {
  webLayout: Array<{ route: string; title: string; components: string[] }>;
  mobileLayout: Array<{ screen: string; title: string; components: string[] }>;
  workflowGraph: Array<{ stepId: string; label: string; agent?: string }>;
}

export function compileRequirementSpec(spec: RequirementSpec): SolutionSpec {
  const now = new Date().toISOString();
  const primaryEntity = spec.dataEntities[0]?.name.toLowerCase() ?? 'business';

  const templateId =
    primaryEntity.includes('invoice') ? 'invoice-ai' :
    primaryEntity.includes('ticket') || primaryEntity.includes('support') ? 'customer-support' :
    primaryEntity.includes('offer') || primaryEntity.includes('supplier') ? 'supply-chain' :
    'crm-starter';

  const agents = spec.workflows.flatMap((wf) =>
    wf.steps.map((step) => ({
      stepId: step.id,
      agentName: step.agentName ?? 'General Business Agent',
      skillIds: inferSkills(step.description),
    }))
  );

  return {
    id: `sol_${createId()}`,
    requirementId: spec.id,
    name: spec.title,
    description: spec.description,
    platforms: ['web', 'mobile', 'workflow'],
    modules: [
      { id: `mod_${createId()}`, templateId, name: templateId, config: { industry: spec.industry } },
    ],
    agents,
    screens: spec.uiScreens.map((screen) => ({
      screenId: screen.id,
      route: `/${screen.name.toLowerCase().replace(/\s+/g, '-')}`,
      platform: screen.layout === 'mobile' ? 'mobile' as const : 'web' as const,
    })),
    governance: {
      requiresApproval: agents.some((a) => a.skillIds.includes('approval')),
      riskLevel: templateId === 'invoice-ai' || templateId === 'supply-chain' ? 'high' : 'medium',
      auditEnabled: true,
    },
    createdAt: now,
    updatedAt: now,
    status: 'generated',
  };
}

function inferSkills(description: string): string[] {
  const skills: string[] = [];
  if (/\b(extract|parse|ocr)\b/i.test(description)) skills.push('document-extraction');
  if (/\b(approve|review)\b/i.test(description)) skills.push('approval');
  if (/\b(notify|email|alert)\b/i.test(description)) skills.push('notification');
  if (/\b(score|rank|evaluate)\b/i.test(description)) skills.push('scoring');
  if (/\b(support|respond|chat)\b/i.test(description)) skills.push('customer-support');
  if (skills.length === 0) skills.push('general-reasoning');
  return skills;
}

export function buildSolutionPreview(spec: RequirementSpec, solution: SolutionSpec): SolutionPreview {
  return {
    webLayout: spec.uiScreens
      .filter((s) => s.layout !== 'mobile')
      .map((screen) => ({
        route: solution.screens.find((r) => r.screenId === screen.id)?.route ?? '/',
        title: screen.name,
        components: screen.type === 'dashboard'
          ? ['MetricsGrid', 'RecentActivity', 'QuickActions']
          : screen.type === 'form'
            ? ['FormFields', 'SubmitButton', 'ValidationSummary']
            : ['DataTable', 'Filters', 'ExportButton'],
      })),
    mobileLayout: spec.uiScreens
      .filter((s) => s.layout !== 'web')
      .map((screen) => ({
        screen: screen.name,
        title: screen.name,
        components: screen.type === 'dashboard'
          ? ['MobileHeader', 'StatCards', 'ActionFab']
          : ['MobileList', 'PullToRefresh'],
      })),
    workflowGraph: spec.workflows.flatMap((wf) =>
      wf.steps.map((step) => ({
        stepId: step.id,
        label: step.name,
        agent: step.agentName,
      }))
    ),
  };
}
