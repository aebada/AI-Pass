import type { AgentDecision, ExecutionStatus, RiskLevel, SkillCategory, StudioAgentStatus } from './platform.js';

export interface StudioAgent {
  id: string;
  name: string;
  description: string;
  type: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  riskLevel: RiskLevel;
  status: StudioAgentStatus;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentVersion {
  agentId: string;
  versionNumber: number;
  workflowConfig: WorkflowConfig;
  createdAt: string;
}

export interface WorkflowConfig {
  id: string;
  agentId: string;
  steps: WorkflowStepDef[];
}

export interface WorkflowStepDef {
  stepId: string;
  type: 'skill' | 'condition' | 'action';
  skillId?: string;
  input?: Record<string, unknown>;
  output?: string;
  nextStep?: string;
  condition?: Record<string, unknown>;
}

export interface StudioSkill {
  id: string;
  name: string;
  category: SkillCategory;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  executionType: 'internal' | 'api';
  riskLevel: RiskLevel;
  creditCost: number;
}

export interface AgentExecutionResult {
  id: string;
  agentId: string;
  input: Record<string, unknown>;
  output: {
    decision: AgentDecision;
    reasons: string[];
    evidence: string[];
    confidence: number;
  };
  steps: ExecutionStepLog[];
  status: ExecutionStatus;
  creditsUsed: number;
  timestamp: string;
}

export interface ExecutionStepLog {
  stepId: string;
  skillId?: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  durationMs: number;
  status: ExecutionStatus;
}

export interface AgentChain {
  id: string;
  name: string;
  agents: string[];
  dependencies: Record<string, string[]>;
}
