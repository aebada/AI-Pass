/** AI Visibility Intelligence — presence audit across ChatGPT, Claude, Gemini, Perplexity */

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'perplexity';

export type IssueSeverity = 'critical' | 'medium' | 'low';

export type GapType =
  | 'missing_presence'
  | 'weak_positioning'
  | 'incorrect_info'
  | 'outdated'
  | 'competitor_dominance';

export type OptimizationCategory =
  | 'website'
  | 'landing_pages'
  | 'structured_data'
  | 'schema_org'
  | 'knowledge_base'
  | 'faq'
  | 'docs'
  | 'external_refs'
  | 'pr'
  | 'directories'
  | 'entity_optimization'
  | 'ai_ready_content'
  | 'content'
  | 'authority'
  | 'prompt_coverage'
  | 'ai_answer';

export type MonitoringSchedule = 'daily' | 'weekly' | 'monthly' | 'custom';

export type AlertChannel = 'email' | 'slack' | 'teams' | 'push' | 'webhook';

export type AlertType =
  | 'ranking_drop'
  | 'competitor_overtake'
  | 'misinformation'
  | 'company_disappears'
  | 'trust_score_change';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json' | 'html';

export interface Company {
  id: string;
  tenantId: string;
  name: string;
  website: string;
  industry: string;
  products: string[];
  services: string[];
  countries: string[];
  competitors: string[];
  keywords: string[];
  brandDescription: string;
  valueProposition: string;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated Use Company — kept for backward compatibility */
export interface CompanyProfile {
  id: string;
  name: string;
  website: string;
  categories: string[];
  targetMarket: string;
  competitors: string[];
  valuePropositions: string[];
  keyFacts: string[];
  createdAt: string;
}

export interface Competitor {
  id: string;
  companyId: string;
  name: string;
  website?: string;
  visibilityScore: number;
  rankingScore: number;
  recommendationFrequency: number;
  shareOfRecommendations: number;
  strengths: string[];
  weaknesses: string[];
  lastAuditedAt?: string;
}

export interface Prompt {
  id: string;
  companyId?: string;
  prompt: string;
  language: string;
  category: string;
  cluster?: string;
  region?: string;
  isCustom: boolean;
  scheduled?: boolean;
}

/** @deprecated Use Prompt */
export interface AuditQuery {
  id: string;
  prompt: string;
  language: string;
  category: string;
}

export interface ProviderResponse {
  id: string;
  auditRunId: string;
  provider: AIProvider;
  promptId: string;
  queryId: string;
  fullAnswer: string;
  companyMentioned: boolean;
  rankingPosition?: number;
  competitorsMentioned: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  tone?: string;
  hallucinations?: string[];
  outdatedInfo?: string[];
  timestamp: string;
  creditsUsed?: number;
}

export interface PresenceScore {
  visibility: number;
  recommendation: number;
  ranking: number;
  consistency: number;
  accuracy: number;
  overall: number;
}

export interface RepresentationInsight {
  brandPositioning: string;
  productPositioning: string;
  strengths: string[];
  weaknesses: string[];
  missingCapabilities: string[];
  tone: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  hallucinations: string[];
  outdatedInfo: string[];
}

export interface PresenceGap {
  id: string;
  type: GapType;
  severity: IssueSeverity;
  description: string;
  promptId?: string;
  provider?: AIProvider;
  recommendation?: string;
}

/** @deprecated Use PresenceGap */
export interface PresenceIssue {
  id: string;
  type: GapType;
  severity: IssueSeverity;
  description: string;
  queryId?: string;
  provider?: AIProvider;
}

export interface OptimizationRecommendation {
  id: string;
  companyId: string;
  category: OptimizationCategory;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  estimatedLift?: number;
  status: 'open' | 'in_progress' | 'done';
  trustRisk?: 'low' | 'medium' | 'high';
}

export interface SimulationResult {
  id: string;
  companyId: string;
  scenario: 'landing_page' | 'faq' | 'structured_data' | 'positioning';
  input: Record<string, unknown>;
  predictedVisibilityLift: number;
  predictedRankingLift: number;
  summary: string;
  createdAt: string;
}

export interface PresenceMonitoringEvent {
  id: string;
  companyId: string;
  type: 'audit_completed' | 'ranking_change' | 'competitor_change' | 'opportunity' | 'visibility_lost' | 'misinformation';
  title: string;
  description: string;
  severity: IssueSeverity;
  schedule: MonitoringSchedule;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Alert {
  id: string;
  companyId: string;
  type: AlertType;
  channel: AlertChannel;
  title: string;
  message: string;
  severity: IssueSeverity;
  acknowledged: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  companyId: string;
  type: 'executive' | 'visibility' | 'competitor' | 'optimization' | 'history' | 'provider_comparison';
  title: string;
  format: ReportFormat;
  generatedAt: string;
  summary: string;
  sections: ReportSection[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  metrics?: Record<string, number>;
}

export interface Analytics {
  companyId: string;
  period: string;
  auditCount: number;
  avgPresenceScore: number;
  visibilityTrend: number[];
  recommendationTrend: number[];
  providerBreakdown: Record<AIProvider, number>;
  topOpportunities: string[];
  criticalIssueCount: number;
  optimizationProgress: number;
}

export interface AuditRun {
  id: string;
  companyId: string;
  tenantId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  providers: AIProvider[];
  prompts: Prompt[];
  responses: ProviderResponse[];
  score: PresenceScore;
  representation: RepresentationInsight;
  gaps: PresenceGap[];
  competitorSnapshot: Competitor[];
  startedAt: string;
  completedAt?: string;
}

/** @deprecated Use AuditRun */
export interface AuditReport {
  id: string;
  companyId: string;
  score: PresenceScore;
  issues: PresenceIssue[];
  recommendations: OptimizationRecommendation[];
  competitorComparison: Record<string, number>;
  generatedAt: string;
}

export interface PresenceDashboard {
  company: Company;
  latestAudit?: AuditRun;
  score: PresenceScore;
  visibilityTrend: number[];
  recommendationScore: number;
  competitorRanking: Array<{ name: string; score: number; rank: number }>;
  platformsAudited: AIProvider[];
  opportunities: string[];
  criticalIssues: PresenceGap[];
  optimizationProgress: number;
  recentAudits: AuditRun[];
  trustScore?: number;
  trustCertified?: boolean;
}
