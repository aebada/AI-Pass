import type {
  AISystem,
  AIUseCase,
  Audit,
  ComplianceDashboard,
  ComplianceReport,
  Control,
  CopilotMessage,
  EmployeeCompliance,
  Evidence,
  Framework,
  Policy,
  Risk,
  Task,
  TrustCenter,
  Vendor,
} from './types.js';

export interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface FrameworkActivateRequest {
  frameworkCode: string;
  ownerId?: string;
  targetCertificationDate?: string;
}

export interface CreateControlRequest {
  frameworkId: string;
  controlRef: string;
  title: string;
  description?: string;
  ownerId?: string;
}

export interface CreateRiskRequest {
  title: string;
  description: string;
  category: Risk['category'];
  severity: Risk['severity'];
  likelihood: number;
  impact: number;
  ownerId?: string;
  mitigationPlan?: string;
}

export interface CreateVendorRequest {
  name: string;
  category: string;
  riskClass?: Vendor['riskClass'];
  dataAccess?: boolean;
  contactEmail: string;
}

export interface CreatePolicyRequest {
  title: string;
  templateType?: Policy['templateType'];
  content: string;
  frameworkCodes?: string[];
}

export interface CreateEvidenceRequest {
  title: string;
  type: Evidence['type'];
  controlIds?: string[];
  fileName?: string;
}

export interface TrustCenterPublishRequest {
  orgSlug: string;
  orgName: string;
}

export interface TrustCenterPublishResponse {
  trustCenter: TrustCenter;
  publicUrl: string;
}

export interface CopilotChatRequest {
  message: string;
  sessionId?: string;
}

export interface CopilotChatResponse {
  sessionId: string;
  message: CopilotMessage;
  creditsUsed: number;
}

export interface ReportsQuery {
  type?: ComplianceReport['type'];
  format?: ComplianceReport['format'];
}

export interface DashboardResponse {
  dashboard: ComplianceDashboard;
  frameworks: Framework[];
  recentRisks: Risk[];
  recentEvidence: Evidence[];
}

export type {
  AISystem,
  AIUseCase,
  Audit,
  ComplianceDashboard,
  ComplianceReport,
  Control,
  CopilotMessage,
  EmployeeCompliance,
  Evidence,
  Framework,
  Policy,
  Risk,
  Task,
  TrustCenter,
  Vendor,
};
