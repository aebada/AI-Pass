export * from './types.js';
export { TrustService } from './trust-service.js';
export { ValidationEngine } from './validation-engine.js';
export { ScoringEngine, type ScoringInput, type ScoringOutput } from './scoring-engine.js';
export { CertificationService } from './certification-service.js';
export { MonitoringService } from './monitoring-service.js';
export { ReportingService, type ExportResult, type ReportFormat } from './reporting-service.js';
export { VerificationService } from './verification-service.js';
export { BadgeService } from './badge-service.js';
export { AuditService } from './audit-service.js';
export {
  createTrustIntegrations,
  getTrustLimits,
  checkValidationEntitlement,
  consumeTrustCredits,
  TRUST_MEMBERSHIP_LIMITS,
  TRUST_CREDIT_COSTS,
  COMPLIANCE_FRAMEWORK_STUBS,
  emitMonitoringAlert,
  type TrustIntegrations,
  type LiveSyncTrustEmitter,
} from './integrations.js';
export {
  createTrustEngine,
  getTrustEngineInstance,
  setTrustEngineInstance,
  resetTrustEngineInstance,
  type TrustEnginePlatform,
} from './trust-engine.js';
export { getTrustEngine, resetTrustEngine, type TrustEngine } from './platform.js';
export { seedTrustEngine, SEED_SYSTEM_IDS, SEED_VERIFICATION_IDS } from './seed-data.js';
export {
  handleTrustValidate,
  handleTrustValidateAsync,
  handleTrustCertify,
  handleTrustSystems,
  handleTrustReports,
  handleTrustVerification,
  handleTrustMonitoring,
  handleTrustDashboard,
  handleTrustTestSuite,
  getTrustSummaryForResource,
} from './api-handlers.js';

// Backward-compatible aliases
export { ValidationEngine as TestExecutionEngine } from './validation-engine.js';
export { MonitoringService as MonitoringEngine } from './monitoring-service.js';
