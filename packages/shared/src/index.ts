export type Platform = 'web' | 'desktop' | 'mobile';
export type DesktopOS = 'macos' | 'windows' | 'linux';
export type MobileOS = 'ios' | 'android';

export interface PlatformInfo {
  platform: Platform;
  os?: DesktopOS | MobileOS;
  version?: string;
}

export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  toolCallId?: string;
  toolCalls?: ToolCall[];
  metadata?: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  content: string;
  isError?: boolean;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
  execute: (args: Record<string, unknown>, context: AgentContext) => Promise<string>;
}

export interface ToolParameterSchema {
  type: 'object';
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
}

export interface ToolParameterProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  items?: { type: string };
  enum?: string[];
}

export type AgentStatus = 'idle' | 'thinking' | 'tool_running' | 'streaming' | 'error' | 'done';

export interface AgentState {
  status: AgentStatus;
  messages: Message[];
  currentToolCall?: ToolCall;
  error?: string;
  iteration: number;
  maxIterations: number;
}

export interface EditorSelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  text: string;
}

export interface OpenFile {
  path: string;
  content: string;
  language: string;
  isDirty: boolean;
  selection?: EditorSelection;
}

export interface EditorContext {
  workspaceRoot: string;
  openFiles: OpenFile[];
  activeFilePath?: string;
  selection?: EditorSelection;
}

export type RuleScope = 'user' | 'project';

export interface Rule {
  id: string;
  scope: RuleScope;
  name: string;
  content: string;
  enabled: boolean;
  priority: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  enabled: boolean;
}

export interface AgentContext {
  editor: EditorContext;
  rules: Rule[];
  skills: Skill[];
  cwd: string;
}

export type ProviderId = 'openai' | 'anthropic' | 'openai-compatible';

export interface ModelConfig {
  provider: ProviderId;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  extraHeaders?: Record<string, string>;
}

export interface AppSettings {
  models: {
    chat: ModelConfig;
    completion: ModelConfig;
    agent: ModelConfig;
  };
  rules: Rule[];
  skills: Skill[];
  theme: 'dark' | 'light' | 'system';
  editorFontSize: number;
  enableInlineCompletion: boolean;
  enableCodebaseIndexing: boolean;
}

export interface SearchResult {
  path: string;
  score: number;
  snippet: string;
  lineStart?: number;
  lineEnd?: number;
}

export interface GitFileStatus {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'renamed';
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

export interface McpServerConfig {
  id: string;
  name: string;
  command: string;
  args?: string[];
  env?: Record<string, string>;
  enabled: boolean;
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'done' | 'error';
  content?: string;
  toolCall?: ToolCall;
  error?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  models: {
    chat: { provider: 'openai', model: 'gpt-4o', temperature: 0.7, maxTokens: 4096 },
    completion: { provider: 'openai', model: 'gpt-4o-mini', temperature: 0.2, maxTokens: 256 },
    agent: { provider: 'openai', model: 'gpt-4o', temperature: 0.3, maxTokens: 8192 },
  },
  rules: [],
  skills: [],
  theme: 'dark',
  editorFontSize: 14,
  enableInlineCompletion: true,
  enableCodebaseIndexing: true,
};

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createMessage(
  role: MessageRole,
  content: string,
  extras?: Partial<Message>
): Message {
  return {
    id: createId(),
    role,
    content,
    createdAt: Date.now(),
    ...extras,
  };
}

export type {
  AgentDecision,
  RiskLevel,
  CertificationLevel,
  CertificationStatus,
  AppType,
  PricingModel,
  SkillCategory,
  StudioAgentStatus,
  ExecutionStatus,
  StructuredOutput,
  CreditUsage,
  AuditEntry,
  TenantContext,
} from './platform.js';

export type {
  TrustScorecard,
  ValidationRun,
  AISystemSubmission,
  TestCase,
  TestResult,
  CertificationRecord,
} from './trust.js';
export type { MonitoringEvent as TrustMonitoringEvent } from './trust.js';
export { CERTIFICATION_THRESHOLDS, SCORE_WEIGHTS } from './trust.js';

export type {
  StoreCategory,
  StoreAppMetadata,
  AppInstallation,
  AppReview,
  DeveloperProfile,
  StoreSearchFilters,
} from './store.js';

export type {
  AgentSkill,
  SkillInvocation,
  MarketplaceApp,
  RevenueShare,
} from './marketplace.js';
export { DEFAULT_PLATFORM_FEE, DEFAULT_DEVELOPER_SHARE } from './marketplace.js';

export type {
  GovernanceEventType,
  AISystemType,
  ComplianceFramework,
  PolicyCategory,
  RiskCategory,
  RiskStatus,
  ApprovalType,
  MonitoringEventType,
  ExportFormat,
  GovernanceLifecycleStage,
  AISystem,
  AISystemRecord,
  GovernancePolicy,
  PolicyRule,
  Risk,
  AIRiskEntry,
  Approval,
  ApprovalRequest,
  Inventory,
  AuditLog,
  ComplianceMapping,
  Review,
  Exception,
  CertificationReference,
  DriftEvent,
  GovernanceEvaluation,
  GovernanceDashboard,
  GovernanceReportRequest,
} from './governance.js';
export type { MonitoringEvent as GovernanceMonitoringEvent, PolicyStatus as GovernancePolicyStatus } from './governance.js';

export type {
  KnowledgeSourceType,
  SyncStatus,
  ConnectorKind,
  PipelineStage,
  VectorStoreProvider,
  RetrievalMode,
  DataClassification,
  KnowledgeSource,
  Pipeline,
  Document,
  KnowledgeChunk,
  Embedding,
  SemanticEntity,
  Entity,
  RelationshipEdge,
  Relationship,
  KnowledgeGraph,
  RetrievalIndex,
  Metadata,
  RetrievalQuery,
  RetrievalResult,
  RAGRequest,
  RAGResponse,
  SyncEvent,
  SynchronizationEvent,
  LineageRecord,
  KnowledgeStatus,
  GraphQuery,
  GraphQueryResult,
} from './knowledge.js';

export type {
  StudioAgent,
  AgentVersion,
  WorkflowConfig,
  WorkflowStepDef,
  StudioSkill,
  AgentExecutionResult,
  ExecutionStepLog,
  AgentChain,
} from './agent-studio.js';

export type {
  AIProvider,
  IssueSeverity,
  GapType,
  OptimizationCategory,
  MonitoringSchedule,
  AlertChannel,
  AlertType,
  ReportFormat,
  Company,
  CompanyProfile,
  Competitor,
  Prompt,
  AuditQuery,
  ProviderResponse,
  PresenceScore,
  RepresentationInsight,
  PresenceGap,
  PresenceIssue,
  OptimizationRecommendation,
  SimulationResult,
  PresenceMonitoringEvent,
  Alert,
  Report,
  ReportSection,
  Analytics,
  AuditRun,
  AuditReport,
  PresenceDashboard,
} from './presence-audit.js';

export type {
  SupportSession,
  SupportSkillChain,
  InvoiceDocumentType,
  InvoiceRecord,
  InvoiceAutomationPack,
  SourcingEvent,
  SupplierOffer,
  EvaluationRun,
} from './verticals.js';

export type {
  SourcingEventStatus,
  OfferStatus,
  ProcurementPolicyStatus,
  ScApprovalStatus,
  RuleOutcome,
  OfferField,
  Requirement,
  SourcingEvent as ScSourcingEvent,
  Supplier,
  Offer,
  ProcurementPolicy,
  ProcurementRule,
  RuleResult,
  Score,
  Evidence,
  Evaluation,
  EvaluationResult,
  AgentEvaluationResult,
  Decision,
  ScApproval,
  ScAuditLog,
  Artifact,
  ScoringTemplate,
} from './supply-chain-ai.js';

export type {
  MembershipTier,
  MembershipFeature,
  MembershipEntitlements,
  MembershipPlan,
  MembershipUsage,
  OrgMembershipPolicy,
} from './membership.js';

export type {
  WalletBalance,
  ProviderSpendBreakdown,
  UsageRecord,
  WalletSummary,
  RecordUsageInput,
} from './wallet.js';

export type {
  TenantRole,
  TenantRbacPolicy,
  TenantMember,
} from './tenant.js';
export { DEFAULT_RBAC, memberHasPermission } from './tenant.js';

export type {
  SkillAvailability,
  SkillCreatePolicy,
  SkillAvailabilityChangePolicy,
  WorkspaceSkillPermissions,
  SkillGovernanceActor,
} from './skill-governance.js';
export {
  SKILL_AVAILABILITY_OPTIONS,
  DEFAULT_SKILL_AVAILABILITY,
  DEFAULT_WORKSPACE_SKILL_PERMISSIONS,
  actorIsAdmin,
  actorIsBuilder,
  canCreateSkill,
  canChangeSkillAvailability,
  isSkillVisibleToMember,
  isSkillDiscoverableByAgents,
  skillAvailabilityLabel,
} from './skill-governance.js';

export type {
  LiveSyncEventStatus,
  WorkflowExecutionStatus,
  LogLevel,
  EventPriority,
  TriggerTargetType,
  LiveSyncEventType,
  InboundEvent,
  LiveSyncEvent,
  TriggerCondition,
  TriggerMapping,
  WorkflowStep,
  WorkflowDefinition,
  WorkflowExecution,
  AgentExecution,
  ExecutionLog,
  LiveSyncHealth,
  WebhookResponse,
  LiveRunRequest,
  LiveRunResponse,
  LiveSyncChannelTopic,
  LiveSyncChannelMessage,
  EventLogEntry,
  DeadLetterRecord,
  NotificationRecord,
  CorrelationRecord,
  LiveSyncMetrics,
} from './livesync.js';
export { LIVESYNC_EVENT_TYPES } from './livesync.js';
