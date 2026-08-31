export {
  ScoringEngine,
  ValidationEngine,
  ValidationEngine as ValidationOrchestrator,
  CertificationService,
  MonitoringService,
  MonitoringService as MonitoringEngine,
  getTrustEngine,
  getTrustSummaryForResource,
  type ScoringInput,
  type ScoringOutput,
} from '@ai-pass/trust-engine';

import type { TestScenario, TestResult } from '@ai-pass/trust-engine';

export interface TestExecutor {
  execute(testCase: TestScenario): Promise<TestResult>;
}
