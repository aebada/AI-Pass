import type { RoutingDecision } from '@ai-pass/provider-hub';
import type { MembershipTier } from '@ai-pass/shared';

export type InvoiceAITaskType = 'extraction' | 'validation' | 'fraud' | 'compliance' | 'chat';

export interface PIIMaskResult {
  maskedText: string;
  redactedFields: string[];
  piiCount: number;
}

export interface AIRouteRequest {
  taskType: InvoiceAITaskType;
  tenantId: string;
  userId: string;
  membershipTier: MembershipTier;
  orgId?: string;
  preferSpeed?: boolean;
  preferQuality?: boolean;
  preferCost?: boolean;
  preferredModelId?: string;
}

export interface AIRouteResult {
  decision: RoutingDecision;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedCostUsd: number;
}

export interface MiddlewareExtractionRequest {
  tenantId: string;
  userId: string;
  membershipTier: MembershipTier;
  fileName: string;
  mimeType: string;
  rawText?: string;
}

export interface MiddlewareExtractionResult {
  maskedText: string;
  route: AIRouteResult;
  pii: PIIMaskResult;
  creditsUsed: number;
  modelId: string;
  providerId: string;
}
