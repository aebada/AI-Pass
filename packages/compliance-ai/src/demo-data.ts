import type {
  AISystem,
  AIUseCase,
  Audit,
  Control,
  EmployeeCompliance,
  Evidence,
  Framework,
  Policy,
  Risk,
  Task,
  TrustCenter,
  Vendor,
} from './types.js';
import type { ComplianceDashboard } from './types.js';

export const DEMO_TENANT_ID = 'tenant_acme';
export const DEMO_ORG_SLUG = 'acme-corp';

export const FRAMEWORK_CATALOG: Omit<Framework, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>[] = [
  { code: 'ISO_27001', name: 'ISO/IEC 27001', version: '2022', description: 'Information security management', active: true, progress: 72, controlCount: 8, implementedCount: 6, ownerId: 'usr_ciso', ownerName: 'Elena Vogt', activatedAt: '2025-09-01T00:00:00Z', targetCertificationDate: '2026-12-01T00:00:00Z', mappedFrameworks: ['SOC2', 'NIS2'] },
  { code: 'GDPR', name: 'GDPR', version: '2018', description: 'EU data protection regulation', active: true, progress: 85, controlCount: 6, implementedCount: 5, ownerId: 'usr_dpo', ownerName: 'Marcus Chen', activatedAt: '2025-06-15T00:00:00Z', mappedFrameworks: ['ISO_27701'] },
  { code: 'ISO_42001', name: 'ISO/IEC 42001', version: '2023', description: 'AI management system', active: true, progress: 58, controlCount: 6, implementedCount: 3, ownerId: 'usr_ai_lead', ownerName: 'Priya Sharma', activatedAt: '2026-01-10T00:00:00Z', targetCertificationDate: '2027-03-01T00:00:00Z', mappedFrameworks: ['ISO_27001'] },
  { code: 'SOC2', name: 'SOC 2 Type II', version: '2024', description: 'Service organization controls', active: false, progress: 0, controlCount: 0, implementedCount: 0, ownerId: 'usr_ciso', ownerName: 'Elena Vogt', mappedFrameworks: ['ISO_27001'] },
  { code: 'NIS2', name: 'NIS2 Directive', version: '2024', description: 'Network and information security', active: false, progress: 0, controlCount: 0, implementedCount: 0, ownerId: 'usr_ciso', ownerName: 'Elena Vogt', mappedFrameworks: ['ISO_27001'] },
  { code: 'DORA', name: 'DORA', version: '2025', description: 'Digital operational resilience', active: false, progress: 0, controlCount: 0, implementedCount: 0, ownerId: 'usr_ciso', ownerName: 'Elena Vogt', mappedFrameworks: [] },
  { code: 'TISAX', name: 'TISAX', version: '6.0', description: 'Automotive information security', active: false, progress: 0, controlCount: 0, implementedCount: 0, ownerId: 'usr_ciso', ownerName: 'Elena Vogt', mappedFrameworks: [] },
  { code: 'ISO_9001', name: 'ISO 9001', version: '2015', description: 'Quality management', active: false, progress: 0, controlCount: 0, implementedCount: 0, ownerId: 'usr_qa', ownerName: 'Anna Kowalski', mappedFrameworks: [] },
  { code: 'ISO_27701', name: 'ISO/IEC 27701', version: '2019', description: 'Privacy information management', active: false, progress: 0, controlCount: 0, implementedCount: 0, ownerId: 'usr_dpo', ownerName: 'Marcus Chen', mappedFrameworks: ['GDPR'] },
  { code: 'ISO_27018', name: 'ISO/IEC 27018', version: '2019', description: 'Cloud privacy controls', active: false, progress: 0, controlCount: 0, implementedCount: 0, ownerId: 'usr_dpo', ownerName: 'Marcus Chen', mappedFrameworks: ['ISO_27001', 'GDPR'] },
];

export const DEMO_FRAMEWORKS: Framework[] = FRAMEWORK_CATALOG.filter((f) => f.active).map((f) => ({
  ...f,
  id: `fw_${f.code.toLowerCase()}`,
  tenantId: DEMO_TENANT_ID,
  createdAt: f.activatedAt ?? '2026-01-01T00:00:00Z',
  updatedAt: '2026-06-28T00:00:00Z',
}));

export const DEMO_CONTROLS: Control[] = [
  { id: 'ctl_001', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_27001', frameworkCode: 'ISO_27001', controlRef: 'A.5.1', title: 'Information security policies', description: 'Policies for information security', status: 'verified', ownerId: 'usr_ciso', ownerName: 'Elena Vogt', evidenceIds: ['ev_001'], riskIds: [], policyIds: ['pol_001'], mappedControlRefs: [{ frameworkCode: 'SOC2', controlRef: 'CC1.1' }], progress: 100, lastReviewedAt: '2026-06-01T00:00:00Z', version: 2, createdAt: '2025-09-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'ctl_002', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_27001', frameworkCode: 'ISO_27001', controlRef: 'A.8.2', title: 'Privileged access rights', description: 'Allocation and use of privileged access', status: 'implemented', ownerId: 'usr_it', ownerName: 'Tom Bradley', evidenceIds: ['ev_002'], riskIds: ['risk_001'], policyIds: [], mappedControlRefs: [], progress: 90, dueDate: '2026-07-15T00:00:00Z', version: 1, createdAt: '2025-09-15T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z' },
  { id: 'ctl_003', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_27001', frameworkCode: 'ISO_27001', controlRef: 'A.8.9', title: 'Configuration management', description: 'Secure configuration of systems', status: 'in_progress', ownerId: 'usr_it', ownerName: 'Tom Bradley', evidenceIds: [], riskIds: ['risk_002'], policyIds: [], mappedControlRefs: [], progress: 60, dueDate: '2026-08-01T00:00:00Z', version: 1, createdAt: '2025-10-01T00:00:00Z', updatedAt: '2026-06-25T00:00:00Z' },
  { id: 'ctl_004', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_27001', frameworkCode: 'ISO_27001', controlRef: 'A.8.16', title: 'Monitoring activities', description: 'Networks and systems monitoring', status: 'implemented', ownerId: 'usr_soc', ownerName: 'Lisa Park', evidenceIds: ['ev_003'], riskIds: [], policyIds: [], mappedControlRefs: [{ frameworkCode: 'NIS2', controlRef: 'NIS2.12' }], progress: 85, version: 1, createdAt: '2025-10-15T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z' },
  { id: 'ctl_005', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_27001', frameworkCode: 'ISO_27001', controlRef: 'A.5.24', title: 'Incident management planning', description: 'Incident response procedures', status: 'verified', ownerId: 'usr_ciso', ownerName: 'Elena Vogt', evidenceIds: ['ev_004'], riskIds: ['risk_003'], policyIds: ['pol_006'], mappedControlRefs: [], progress: 100, version: 2, createdAt: '2025-11-01T00:00:00Z', updatedAt: '2026-05-15T00:00:00Z' },
  { id: 'ctl_006', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_27001', frameworkCode: 'ISO_27001', controlRef: 'A.5.19', title: 'Supplier relationships', description: 'Information security in supplier agreements', status: 'in_progress', ownerId: 'usr_ciso', ownerName: 'Elena Vogt', evidenceIds: [], riskIds: ['risk_004'], policyIds: [], mappedControlRefs: [], progress: 45, dueDate: '2026-07-30T00:00:00Z', version: 1, createdAt: '2025-11-15T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' },
  { id: 'ctl_007', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_27001', frameworkCode: 'ISO_27001', controlRef: 'A.8.10', title: 'Information deletion', description: 'Secure deletion of information', status: 'implemented', ownerId: 'usr_dpo', ownerName: 'Marcus Chen', evidenceIds: ['ev_005'], riskIds: [], policyIds: ['pol_005'], mappedControlRefs: [{ frameworkCode: 'GDPR', controlRef: 'Art.17' }], progress: 80, version: 1, createdAt: '2025-12-01T00:00:00Z', updatedAt: '2026-06-05T00:00:00Z' },
  { id: 'ctl_008', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_27001', frameworkCode: 'ISO_27001', controlRef: 'A.5.7', title: 'Threat intelligence', description: 'Collection and analysis of threat information', status: 'not_started', ownerId: 'usr_soc', ownerName: 'Lisa Park', evidenceIds: [], riskIds: [], policyIds: [], mappedControlRefs: [], progress: 0, dueDate: '2026-09-01T00:00:00Z', version: 1, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'ctl_009', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_gdpr', frameworkCode: 'GDPR', controlRef: 'Art.30', title: 'Records of processing activities', description: 'Maintain RoPA', status: 'verified', ownerId: 'usr_dpo', ownerName: 'Marcus Chen', evidenceIds: ['ev_006'], riskIds: [], policyIds: ['pol_003'], mappedControlRefs: [], progress: 100, version: 3, createdAt: '2025-06-15T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'ctl_010', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_gdpr', frameworkCode: 'GDPR', controlRef: 'Art.32', title: 'Security of processing', description: 'Appropriate technical and organizational measures', status: 'implemented', ownerId: 'usr_ciso', ownerName: 'Elena Vogt', evidenceIds: ['ev_001', 'ev_003'], riskIds: ['risk_005'], policyIds: [], mappedControlRefs: [{ frameworkCode: 'ISO_27001', controlRef: 'A.8.2' }], progress: 90, version: 2, createdAt: '2025-07-01T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z' },
  { id: 'ctl_011', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_gdpr', frameworkCode: 'GDPR', controlRef: 'Art.35', title: 'Data protection impact assessment', description: 'DPIA for high-risk processing', status: 'in_progress', ownerId: 'usr_dpo', ownerName: 'Marcus Chen', evidenceIds: [], riskIds: ['risk_006'], policyIds: [], mappedControlRefs: [], progress: 55, dueDate: '2026-07-20T00:00:00Z', version: 1, createdAt: '2025-08-01T00:00:00Z', updatedAt: '2026-06-22T00:00:00Z' },
  { id: 'ctl_012', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_gdpr', frameworkCode: 'GDPR', controlRef: 'Art.33', title: 'Breach notification', description: '72-hour breach notification process', status: 'verified', ownerId: 'usr_dpo', ownerName: 'Marcus Chen', evidenceIds: ['ev_004'], riskIds: [], policyIds: ['pol_006'], mappedControlRefs: [], progress: 100, version: 2, createdAt: '2025-08-15T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'ctl_013', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_gdpr', frameworkCode: 'GDPR', controlRef: 'Art.7', title: 'Conditions for consent', description: 'Valid consent mechanisms', status: 'implemented', ownerId: 'usr_dpo', ownerName: 'Marcus Chen', evidenceIds: ['ev_007'], riskIds: [], policyIds: ['pol_003'], mappedControlRefs: [], progress: 85, version: 1, createdAt: '2025-09-01T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z' },
  { id: 'ctl_014', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_gdpr', frameworkCode: 'GDPR', controlRef: 'Art.25', title: 'Data protection by design', description: 'Privacy by design and default', status: 'in_progress', ownerId: 'usr_dpo', ownerName: 'Marcus Chen', evidenceIds: [], riskIds: ['risk_006'], policyIds: ['pol_003'], mappedControlRefs: [], progress: 70, version: 1, createdAt: '2025-10-01T00:00:00Z', updatedAt: '2026-06-18T00:00:00Z' },
  { id: 'ctl_015', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_42001', frameworkCode: 'ISO_42001', controlRef: '6.1.2', title: 'AI risk assessment', description: 'Identify and assess AI-related risks', status: 'in_progress', ownerId: 'usr_ai_lead', ownerName: 'Priya Sharma', evidenceIds: [], riskIds: ['risk_007', 'risk_008'], policyIds: ['pol_002'], mappedControlRefs: [], progress: 50, dueDate: '2026-08-15T00:00:00Z', version: 1, createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' },
  { id: 'ctl_016', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_42001', frameworkCode: 'ISO_42001', controlRef: '6.1.4', title: 'AI system impact assessment', description: 'Assess societal and individual impacts', status: 'not_started', ownerId: 'usr_ai_lead', ownerName: 'Priya Sharma', evidenceIds: [], riskIds: [], policyIds: [], mappedControlRefs: [], progress: 0, dueDate: '2026-09-30T00:00:00Z', version: 1, createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
  { id: 'ctl_017', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_42001', frameworkCode: 'ISO_42001', controlRef: '8.2', title: 'AI system operation', description: 'Operational controls for AI systems', status: 'implemented', ownerId: 'usr_ai_lead', ownerName: 'Priya Sharma', evidenceIds: ['ev_008'], riskIds: ['risk_007'], policyIds: ['pol_002'], mappedControlRefs: [], progress: 75, version: 1, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z' },
  { id: 'ctl_018', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_42001', frameworkCode: 'ISO_42001', controlRef: '8.4', title: 'AI system monitoring', description: 'Monitor AI system performance and drift', status: 'in_progress', ownerId: 'usr_ai_lead', ownerName: 'Priya Sharma', evidenceIds: [], riskIds: ['risk_008'], policyIds: [], mappedControlRefs: [], progress: 40, dueDate: '2026-07-25T00:00:00Z', version: 1, createdAt: '2026-02-15T00:00:00Z', updatedAt: '2026-06-25T00:00:00Z' },
  { id: 'ctl_019', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_42001', frameworkCode: 'ISO_42001', controlRef: '7.2', title: 'AI competence', description: 'Ensure personnel AI competence', status: 'implemented', ownerId: 'usr_hr', ownerName: 'Sofia Reyes', evidenceIds: ['ev_009'], riskIds: [], policyIds: [], mappedControlRefs: [], progress: 80, version: 1, createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'ctl_020', tenantId: DEMO_TENANT_ID, frameworkId: 'fw_iso_42001', frameworkCode: 'ISO_42001', controlRef: '9.1', title: 'AI performance evaluation', description: 'Evaluate AI system performance', status: 'not_started', ownerId: 'usr_ai_lead', ownerName: 'Priya Sharma', evidenceIds: [], riskIds: [], policyIds: [], mappedControlRefs: [], progress: 0, dueDate: '2026-10-01T00:00:00Z', version: 1, createdAt: '2026-03-15T00:00:00Z', updatedAt: '2026-03-15T00:00:00Z' },
];

export const DEMO_TASKS: Task[] = [
  { id: 'task_001', tenantId: DEMO_TENANT_ID, controlId: 'ctl_003', frameworkId: 'fw_iso_27001', title: 'Complete baseline config audit', description: 'Run CIS benchmark on production servers', status: 'in_progress', assigneeId: 'usr_it', assigneeName: 'Tom Bradley', dueDate: '2026-07-10T00:00:00Z', priority: 'high', evidenceRequired: true, createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' },
  { id: 'task_002', tenantId: DEMO_TENANT_ID, controlId: 'ctl_006', frameworkId: 'fw_iso_27001', title: 'Vendor security questionnaire batch', description: 'Send TPRM questionnaires to critical vendors', status: 'open', assigneeId: 'usr_ciso', assigneeName: 'Elena Vogt', dueDate: '2026-07-30T00:00:00Z', priority: 'medium', evidenceRequired: false, createdAt: '2026-06-15T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z' },
  { id: 'task_003', tenantId: DEMO_TENANT_ID, controlId: 'ctl_011', frameworkId: 'fw_gdpr', title: 'Complete DPIA for customer analytics', description: 'DPIA for new ML personalization feature', status: 'in_progress', assigneeId: 'usr_dpo', assigneeName: 'Marcus Chen', dueDate: '2026-07-20T00:00:00Z', priority: 'high', evidenceRequired: true, createdAt: '2026-06-10T00:00:00Z', updatedAt: '2026-06-27T00:00:00Z' },
  { id: 'task_004', tenantId: DEMO_TENANT_ID, controlId: 'ctl_015', frameworkId: 'fw_iso_42001', title: 'AI risk register review', description: 'Quarterly AI risk review with governance board', status: 'open', assigneeId: 'usr_ai_lead', assigneeName: 'Priya Sharma', dueDate: '2026-08-01T00:00:00Z', priority: 'high', evidenceRequired: false, createdAt: '2026-06-20T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z' },
  { id: 'task_005', tenantId: DEMO_TENANT_ID, controlId: 'ctl_008', frameworkId: 'fw_iso_27001', title: 'Implement threat intel feed', description: 'Integrate MISP threat intelligence', status: 'overdue', assigneeId: 'usr_soc', assigneeName: 'Lisa Park', dueDate: '2026-06-15T00:00:00Z', priority: 'medium', evidenceRequired: true, createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-06-16T00:00:00Z' },
];

export const DEMO_RISKS: Risk[] = [
  { id: 'risk_001', tenantId: DEMO_TENANT_ID, title: 'Excessive privileged access', description: 'Too many users with admin privileges', category: 'security', severity: 'high', likelihood: 4, impact: 4, riskScore: 16, ownerId: 'usr_it', ownerName: 'Tom Bradley', controlIds: ['ctl_002'], mitigationPlan: 'Implement PAM solution and quarterly access reviews', mitigationStatus: 'in_progress', reviewSchedule: 'quarterly', nextReviewAt: '2026-09-01T00:00:00Z', status: 'mitigating', createdAt: '2025-10-01T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z' },
  { id: 'risk_002', tenantId: DEMO_TENANT_ID, title: 'Misconfigured cloud resources', description: 'Public S3 buckets detected in staging', category: 'security', severity: 'critical', likelihood: 3, impact: 5, riskScore: 15, ownerId: 'usr_it', ownerName: 'Tom Bradley', controlIds: ['ctl_003'], mitigationPlan: 'Enable AWS Config rules and auto-remediation', mitigationStatus: 'in_progress', reviewSchedule: 'monthly', nextReviewAt: '2026-07-15T00:00:00Z', status: 'open', createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-06-25T00:00:00Z' },
  { id: 'risk_003', tenantId: DEMO_TENANT_ID, title: 'Delayed incident response', description: 'MTTR exceeds SLA for P1 incidents', category: 'operational', severity: 'medium', likelihood: 3, impact: 3, riskScore: 9, ownerId: 'usr_ciso', ownerName: 'Elena Vogt', controlIds: ['ctl_005'], mitigationPlan: 'Tabletop exercises and runbook updates', mitigationStatus: 'planned', reviewSchedule: 'quarterly', nextReviewAt: '2026-08-01T00:00:00Z', status: 'open', createdAt: '2025-11-01T00:00:00Z', updatedAt: '2026-05-15T00:00:00Z' },
  { id: 'risk_004', tenantId: DEMO_TENANT_ID, title: 'Third-party data breach', description: 'Critical vendor without recent security review', category: 'vendor', severity: 'high', likelihood: 3, impact: 4, riskScore: 12, ownerId: 'usr_ciso', ownerName: 'Elena Vogt', controlIds: ['ctl_006'], mitigationPlan: 'Complete vendor assessments and contract updates', mitigationStatus: 'in_progress', reviewSchedule: 'quarterly', nextReviewAt: '2026-07-30T00:00:00Z', vendorId: 'vnd_001', status: 'mitigating', createdAt: '2025-12-01T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' },
  { id: 'risk_005', tenantId: DEMO_TENANT_ID, title: 'Encryption gaps', description: 'Legacy systems without encryption at rest', category: 'privacy', severity: 'high', likelihood: 2, impact: 5, riskScore: 10, ownerId: 'usr_dpo', ownerName: 'Marcus Chen', controlIds: ['ctl_010'], mitigationPlan: 'Migration plan for legacy databases', mitigationStatus: 'planned', reviewSchedule: 'quarterly', nextReviewAt: '2026-09-15T00:00:00Z', status: 'open', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-06-15T00:00:00Z' },
  { id: 'risk_006', tenantId: DEMO_TENANT_ID, title: 'Incomplete DPIA coverage', description: 'New AI features launched without DPIA', category: 'privacy', severity: 'medium', likelihood: 4, impact: 3, riskScore: 12, ownerId: 'usr_dpo', ownerName: 'Marcus Chen', controlIds: ['ctl_011', 'ctl_014'], mitigationPlan: 'Embed DPIA in product development lifecycle', mitigationStatus: 'in_progress', reviewSchedule: 'monthly', nextReviewAt: '2026-07-20T00:00:00Z', status: 'mitigating', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-06-22T00:00:00Z' },
  { id: 'risk_007', tenantId: DEMO_TENANT_ID, title: 'LLM prompt injection', description: 'Customer-facing chatbot vulnerable to jailbreak', category: 'ai', severity: 'high', likelihood: 4, impact: 4, riskScore: 16, ownerId: 'usr_ai_lead', ownerName: 'Priya Sharma', controlIds: ['ctl_015', 'ctl_017'], mitigationPlan: 'Input guardrails and output filtering', mitigationStatus: 'in_progress', reviewSchedule: 'monthly', nextReviewAt: '2026-07-25T00:00:00Z', aiSystemId: 'ais_support_bot', status: 'open', createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' },
  { id: 'risk_008', tenantId: DEMO_TENANT_ID, title: 'Model drift in fraud detection', description: 'Fraud model accuracy declining over 3 months', category: 'ai', severity: 'medium', likelihood: 3, impact: 4, riskScore: 12, ownerId: 'usr_ai_lead', ownerName: 'Priya Sharma', controlIds: ['ctl_018'], mitigationPlan: 'Retrain model and implement drift monitoring', mitigationStatus: 'planned', reviewSchedule: 'monthly', nextReviewAt: '2026-07-25T00:00:00Z', aiSystemId: 'ais_fraud_model', status: 'open', createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-06-25T00:00:00Z' },
];

export const DEMO_VENDORS: Vendor[] = [
  { id: 'vnd_001', tenantId: DEMO_TENANT_ID, name: 'CloudServe Inc', category: 'Cloud Infrastructure', riskClass: 'high', dataAccess: true, criticality: 'high', contractExpiry: '2027-01-15T00:00:00Z', lastSecurityReview: '2025-12-01T00:00:00Z', nextReviewAt: '2026-07-30T00:00:00Z', questionnaireStatus: 'overdue', integrationProvider: 'aws', contactEmail: 'security@cloudserve.io', status: 'under_review', createdAt: '2024-06-01T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' },
  { id: 'vnd_002', tenantId: DEMO_TENANT_ID, name: 'DataFlow Analytics', category: 'Analytics', riskClass: 'medium', dataAccess: true, criticality: 'medium', contractExpiry: '2026-12-31T00:00:00Z', lastSecurityReview: '2026-03-15T00:00:00Z', nextReviewAt: '2026-09-15T00:00:00Z', questionnaireStatus: 'completed', integrationProvider: 'azure', contactEmail: 'dpo@dataflow.com', status: 'active', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2026-03-15T00:00:00Z' },
  { id: 'vnd_003', tenantId: DEMO_TENANT_ID, name: 'SecureAuth Pro', category: 'Identity', riskClass: 'low', dataAccess: false, criticality: 'high', contractExpiry: '2028-06-01T00:00:00Z', lastSecurityReview: '2026-05-01T00:00:00Z', nextReviewAt: '2026-11-01T00:00:00Z', questionnaireStatus: 'completed', contactEmail: 'trust@secureauth.pro', status: 'active', createdAt: '2023-03-01T00:00:00Z', updatedAt: '2026-05-01T00:00:00Z' },
  { id: 'vnd_004', tenantId: DEMO_TENANT_ID, name: 'Atlassian (Jira)', category: 'Productivity', riskClass: 'medium', dataAccess: true, criticality: 'medium', contractExpiry: '2027-03-01T00:00:00Z', questionnaireStatus: 'sent', integrationProvider: 'jira', contactEmail: 'admin@atlassian.com', status: 'active', createdAt: '2022-01-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'vnd_005', tenantId: DEMO_TENANT_ID, name: 'Personio HR', category: 'HR', riskClass: 'medium', dataAccess: true, criticality: 'medium', contractExpiry: '2027-06-01T00:00:00Z', lastSecurityReview: '2026-01-15T00:00:00Z', nextReviewAt: '2026-07-15T00:00:00Z', questionnaireStatus: 'completed', integrationProvider: 'personio', contactEmail: 'security@personio.de', status: 'active', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
];

export const DEMO_POLICIES: Policy[] = [
  { id: 'pol_001', tenantId: DEMO_TENANT_ID, title: 'Information Security Policy', templateType: 'security', status: 'published', currentVersionId: 'pv_001_v2', versions: [{ id: 'pv_001_v2', policyId: 'pol_001', version: 2, content: 'Organization-wide information security requirements...', status: 'published', approvedBy: 'CEO', approvedAt: '2026-01-15T00:00:00Z', publishedAt: '2026-01-20T00:00:00Z', changeSummary: 'Updated remote work section', createdAt: '2026-01-10T00:00:00Z' }], ownerId: 'usr_ciso', ownerName: 'Elena Vogt', acceptanceRequired: true, acceptanceRate: 94, frameworkCodes: ['ISO_27001'], createdAt: '2025-09-01T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z' },
  { id: 'pol_002', tenantId: DEMO_TENANT_ID, title: 'AI Governance Policy', templateType: 'ai_governance', status: 'published', currentVersionId: 'pv_002_v1', versions: [{ id: 'pv_002_v1', policyId: 'pol_002', version: 1, content: 'Responsible AI development and deployment standards...', status: 'published', approvedBy: 'CTO', approvedAt: '2026-02-01T00:00:00Z', publishedAt: '2026-02-05T00:00:00Z', changeSummary: 'Initial release', createdAt: '2026-01-25T00:00:00Z' }], ownerId: 'usr_ai_lead', ownerName: 'Priya Sharma', acceptanceRequired: true, acceptanceRate: 87, frameworkCodes: ['ISO_42001'], createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-02-05T00:00:00Z' },
  { id: 'pol_003', tenantId: DEMO_TENANT_ID, title: 'Privacy & Data Protection Policy', templateType: 'privacy', status: 'published', currentVersionId: 'pv_003_v3', versions: [{ id: 'pv_003_v3', policyId: 'pol_003', version: 3, content: 'GDPR-aligned data handling procedures...', status: 'published', approvedBy: 'DPO', approvedAt: '2026-03-01T00:00:00Z', publishedAt: '2026-03-05T00:00:00Z', changeSummary: 'Added AI processing section', createdAt: '2026-02-20T00:00:00Z' }], ownerId: 'usr_dpo', ownerName: 'Marcus Chen', acceptanceRequired: true, acceptanceRate: 96, frameworkCodes: ['GDPR'], createdAt: '2025-06-15T00:00:00Z', updatedAt: '2026-03-05T00:00:00Z' },
  { id: 'pol_004', tenantId: DEMO_TENANT_ID, title: 'Acceptable Use Policy', templateType: 'acceptable_use', status: 'published', currentVersionId: 'pv_004_v1', versions: [{ id: 'pv_004_v1', policyId: 'pol_004', version: 1, content: 'Acceptable use of company IT resources...', status: 'published', approvedBy: 'CISO', approvedAt: '2025-10-01T00:00:00Z', publishedAt: '2025-10-05T00:00:00Z', changeSummary: 'Initial release', createdAt: '2025-09-20T00:00:00Z' }], ownerId: 'usr_ciso', ownerName: 'Elena Vogt', acceptanceRequired: true, acceptanceRate: 98, frameworkCodes: ['ISO_27001'], createdAt: '2025-09-01T00:00:00Z', updatedAt: '2025-10-05T00:00:00Z' },
  { id: 'pol_005', tenantId: DEMO_TENANT_ID, title: 'Data Retention Policy', templateType: 'data_retention', status: 'approved', currentVersionId: 'pv_005_v2', versions: [{ id: 'pv_005_v2', policyId: 'pol_005', version: 2, content: 'Data retention and deletion schedules...', status: 'approved', approvedBy: 'DPO', approvedAt: '2026-06-01T00:00:00Z', changeSummary: 'Updated log retention periods', createdAt: '2026-05-20T00:00:00Z' }], ownerId: 'usr_dpo', ownerName: 'Marcus Chen', acceptanceRequired: false, acceptanceRate: 0, frameworkCodes: ['GDPR', 'ISO_27001'], createdAt: '2025-08-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'pol_006', tenantId: DEMO_TENANT_ID, title: 'Incident Response Plan', templateType: 'incident_response', status: 'published', currentVersionId: 'pv_006_v2', versions: [{ id: 'pv_006_v2', policyId: 'pol_006', version: 2, content: 'Security incident classification and response...', status: 'published', approvedBy: 'CISO', approvedAt: '2026-04-01T00:00:00Z', publishedAt: '2026-04-05T00:00:00Z', changeSummary: 'Added ransomware playbook', createdAt: '2026-03-15T00:00:00Z' }], ownerId: 'usr_ciso', ownerName: 'Elena Vogt', acceptanceRequired: true, acceptanceRate: 91, frameworkCodes: ['ISO_27001', 'GDPR'], createdAt: '2025-11-01T00:00:00Z', updatedAt: '2026-04-05T00:00:00Z' },
];

export const DEMO_EVIDENCE: Evidence[] = [
  { id: 'ev_001', tenantId: DEMO_TENANT_ID, title: 'Information Security Policy v2 (signed)', type: 'document', status: 'validated', controlIds: ['ctl_001', 'ctl_010'], frameworkCodes: ['ISO_27001', 'GDPR'], source: 'manual', fileName: 'isp-v2-signed.pdf', collectedAt: '2026-01-20T00:00:00Z', validatedAt: '2026-01-21T00:00:00Z', uploadedBy: 'usr_ciso', createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-01-21T00:00:00Z' },
  { id: 'ev_002', tenantId: DEMO_TENANT_ID, title: 'PAM access review Q2 2026', type: 'log', status: 'validated', controlIds: ['ctl_002'], frameworkCodes: ['ISO_27001'], source: 'auto_collection', collectedAt: '2026-06-15T00:00:00Z', validatedAt: '2026-06-16T00:00:00Z', uploadedBy: 'system', createdAt: '2026-06-15T00:00:00Z', updatedAt: '2026-06-16T00:00:00Z' },
  { id: 'ev_003', tenantId: DEMO_TENANT_ID, title: 'SIEM alert coverage report', type: 'ai_validation', status: 'validated', controlIds: ['ctl_004', 'ctl_010'], frameworkCodes: ['ISO_27001'], source: 'api_integration', collectedAt: '2026-06-10T00:00:00Z', validatedAt: '2026-06-11T00:00:00Z', validationReport: 'Trust Engine validation: 94% coverage', uploadedBy: 'system', createdAt: '2026-06-10T00:00:00Z', updatedAt: '2026-06-11T00:00:00Z' },
  { id: 'ev_004', tenantId: DEMO_TENANT_ID, title: 'Incident response tabletop exercise', type: 'document', status: 'validated', controlIds: ['ctl_005', 'ctl_012'], frameworkCodes: ['ISO_27001', 'GDPR'], source: 'manual', fileName: 'ir-tabletop-jun2026.pdf', collectedAt: '2026-06-05T00:00:00Z', validatedAt: '2026-06-06T00:00:00Z', uploadedBy: 'usr_ciso', createdAt: '2026-06-05T00:00:00Z', updatedAt: '2026-06-06T00:00:00Z' },
  { id: 'ev_005', tenantId: DEMO_TENANT_ID, title: 'Data deletion audit log', type: 'log', status: 'collected', controlIds: ['ctl_007'], frameworkCodes: ['ISO_27001', 'GDPR'], source: 'workflow', collectedAt: '2026-06-05T00:00:00Z', expiresAt: '2026-12-05T00:00:00Z', uploadedBy: 'system', createdAt: '2026-06-05T00:00:00Z', updatedAt: '2026-06-05T00:00:00Z' },
  { id: 'ev_006', tenantId: DEMO_TENANT_ID, title: 'Records of Processing Activities', type: 'document', status: 'validated', controlIds: ['ctl_009'], frameworkCodes: ['GDPR'], source: 'manual', fileName: 'ropa-2026.xlsx', collectedAt: '2026-06-01T00:00:00Z', validatedAt: '2026-06-02T00:00:00Z', uploadedBy: 'usr_dpo', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-02T00:00:00Z' },
  { id: 'ev_007', tenantId: DEMO_TENANT_ID, title: 'Consent management platform export', type: 'config', status: 'validated', controlIds: ['ctl_013'], frameworkCodes: ['GDPR'], source: 'api_integration', collectedAt: '2026-06-10T00:00:00Z', validatedAt: '2026-06-10T00:00:00Z', uploadedBy: 'system', createdAt: '2026-06-10T00:00:00Z', updatedAt: '2026-06-10T00:00:00Z' },
  { id: 'ev_008', tenantId: DEMO_TENANT_ID, title: 'AI system operational checklist', type: 'document', status: 'collected', controlIds: ['ctl_017'], frameworkCodes: ['ISO_42001'], source: 'manual', fileName: 'ai-ops-checklist.pdf', collectedAt: '2026-06-20T00:00:00Z', uploadedBy: 'usr_ai_lead', createdAt: '2026-06-20T00:00:00Z', updatedAt: '2026-06-20T00:00:00Z' },
  { id: 'ev_009', tenantId: DEMO_TENANT_ID, title: 'AI training completion report', type: 'log', status: 'validated', controlIds: ['ctl_019'], frameworkCodes: ['ISO_42001'], source: 'api_integration', collectedAt: '2026-06-01T00:00:00Z', validatedAt: '2026-06-02T00:00:00Z', uploadedBy: 'system', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-02T00:00:00Z' },
  { id: 'ev_010', tenantId: DEMO_TENANT_ID, title: 'Vendor SOC2 report — CloudServe', type: 'certificate', status: 'pending', controlIds: ['ctl_006'], frameworkCodes: ['ISO_27001'], source: 'manual', fileName: 'cloudserve-soc2-2025.pdf', uploadedBy: 'usr_ciso', createdAt: '2026-06-28T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' },
];

export const DEMO_EMPLOYEES: EmployeeCompliance[] = [
  { id: 'emp_001', tenantId: DEMO_TENANT_ID, employeeId: 'e001', employeeName: 'Sarah Müller', email: 'sarah.mueller@acme.de', department: 'Engineering', status: 'compliant', onboardingComplete: true, trainingCompleted: ['security_101', 'gdpr_basics', 'ai_ethics'], trainingPending: [], policiesAccepted: ['pol_001', 'pol_003', 'pol_004'], policiesPending: [], accessReviewDue: '2026-09-01T00:00:00Z', taskHistory: [{ taskId: 'task_001', title: 'Security training', completedAt: '2025-09-15T00:00:00Z' }], createdAt: '2025-09-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'emp_002', tenantId: DEMO_TENANT_ID, employeeId: 'e002', employeeName: 'James Wilson', email: 'james.wilson@acme.com', department: 'Sales', status: 'pending', onboardingComplete: true, trainingCompleted: ['security_101'], trainingPending: ['gdpr_basics'], policiesAccepted: ['pol_004'], policiesPending: ['pol_003'], lastReminderAt: '2026-06-25T00:00:00Z', taskHistory: [], createdAt: '2026-05-01T00:00:00Z', updatedAt: '2026-06-25T00:00:00Z' },
  { id: 'emp_003', tenantId: DEMO_TENANT_ID, employeeId: 'e003', employeeName: 'Anna Kowalski', email: 'anna.k@acme.pl', department: 'HR', status: 'overdue', onboardingComplete: true, trainingCompleted: [], trainingPending: ['security_101', 'gdpr_basics'], policiesAccepted: [], policiesPending: ['pol_001', 'pol_003', 'pol_004'], accessReviewDue: '2026-06-20T00:00:00Z', lastReminderAt: '2026-06-28T00:00:00Z', taskHistory: [], createdAt: '2026-04-01T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' },
];

export const DEMO_AI_SYSTEMS: AISystem[] = [
  { id: 'ais_support_bot', tenantId: DEMO_TENANT_ID, name: 'Customer Support Bot', type: 'agent', governanceSystemId: 'ais_gov_support', riskLevel: 'high', complianceStatus: 'review', iso42001EvidenceIds: ['ev_008'], createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-06-28T00:00:00Z' },
  { id: 'ais_fraud_model', tenantId: DEMO_TENANT_ID, name: 'Fraud Detection Model', type: 'model', governanceSystemId: 'ais_gov_fraud', riskLevel: 'medium', complianceStatus: 'compliant', iso42001EvidenceIds: [], createdAt: '2025-06-01T00:00:00Z', updatedAt: '2026-06-25T00:00:00Z' },
];

export const DEMO_AI_USE_CASES: AIUseCase[] = [
  { id: 'auc_001', tenantId: DEMO_TENANT_ID, name: 'Customer support automation', description: 'AI-powered tier-1 support', riskLevel: 'high', governanceSystemId: 'ais_gov_support', frameworkCodes: ['ISO_42001'], status: 'production', createdAt: '2026-01-15T00:00:00Z' },
  { id: 'auc_002', tenantId: DEMO_TENANT_ID, name: 'Invoice fraud detection', description: 'ML-based invoice anomaly detection', riskLevel: 'medium', governanceSystemId: 'ais_gov_fraud', frameworkCodes: ['ISO_42001', 'ISO_27001'], status: 'production', createdAt: '2025-06-01T00:00:00Z' },
];

export const DEMO_TRUST_CENTER: TrustCenter = {
  id: 'tc_001',
  tenantId: DEMO_TENANT_ID,
  orgSlug: DEMO_ORG_SLUG,
  orgName: 'Acme Corporation',
  status: 'published',
  publishedAt: '2026-06-01T00:00:00Z',
  frameworks: [
    { code: 'ISO_27001', status: 'In progress — 72%', progress: 72 },
    { code: 'GDPR', status: 'Compliant — 85%', progress: 85 },
    { code: 'ISO_42001', status: 'In progress — 58%', progress: 58 },
  ],
  certifications: [
    { name: 'SOC 2 Type II', level: 'silver', validUntil: '2026-12-31T00:00:00Z', verificationUrl: 'https://ai-pass.com/verify/cert_demo_001' },
  ],
  commitments: [
    { id: 'c1', title: 'Data encryption at rest and in transit', description: 'AES-256 encryption for all customer data', category: 'security' },
    { id: 'c2', title: 'GDPR data subject rights', description: '30-day response SLA for data subject requests', category: 'privacy' },
    { id: 'c3', title: 'Responsible AI principles', description: 'Human oversight for high-risk AI decisions', category: 'ai_governance' },
    { id: 'c4', title: 'ISO 27001 certification target', description: 'Targeting certification by Q4 2026', category: 'certification' },
  ],
  auditStatus: 'Internal audit completed — external audit scheduled Q3 2026',
  trustScore: 82,
  aiGovernanceSummary: 'ISO 42001 AI management system implementation in progress. All production AI systems registered in governance inventory.',
  updatedAt: '2026-06-28T00:00:00Z',
};

export const DEMO_AUDIT_LOGS: Audit[] = [
  { id: 'aud_001', tenantId: DEMO_TENANT_ID, entityType: 'framework', entityId: 'fw_iso_42001', action: 'framework.activated', actorId: 'usr_ai_lead', actorName: 'Priya Sharma', details: { code: 'ISO_42001' }, immutableHash: 'sha256:abc123', timestamp: '2026-01-10T00:00:00Z' },
  { id: 'aud_002', tenantId: DEMO_TENANT_ID, entityType: 'policy', entityId: 'pol_002', action: 'policy.published', actorId: 'usr_ai_lead', actorName: 'Priya Sharma', details: { version: 1 }, immutableHash: 'sha256:def456', timestamp: '2026-02-05T00:00:00Z' },
  { id: 'aud_003', tenantId: DEMO_TENANT_ID, entityType: 'risk', entityId: 'risk_007', action: 'risk.created', actorId: 'usr_ai_lead', actorName: 'Priya Sharma', details: { severity: 'high' }, immutableHash: 'sha256:ghi789', timestamp: '2026-02-01T00:00:00Z' },
  { id: 'aud_004', tenantId: DEMO_TENANT_ID, entityType: 'trust_center', entityId: 'tc_001', action: 'trust_center.published', actorId: 'usr_ciso', actorName: 'Elena Vogt', details: { orgSlug: DEMO_ORG_SLUG }, immutableHash: 'sha256:jkl012', timestamp: '2026-06-01T00:00:00Z' },
];

export function getDashboardStats(
  frameworks: Framework[],
  risks: Risk[],
  evidence: Evidence[],
  vendors: Vendor[],
  employees: EmployeeCompliance[],
  trustCenter: TrustCenter,
): ComplianceDashboard {
  const activeFrameworks = frameworks.filter((f) => f.active);
  const avgProgress = activeFrameworks.length
    ? Math.round(activeFrameworks.reduce((s, f) => s + f.progress, 0) / activeFrameworks.length)
    : 0;
  const openRisks = risks.filter((r) => r.status === 'open' || r.status === 'mitigating');
  const criticalRisks = openRisks.filter((r) => r.severity === 'critical' || r.severity === 'high');
  const collected = evidence.filter((e) => e.status === 'validated' || e.status === 'collected');
  const pending = evidence.filter((e) => e.status === 'pending');
  const compliantEmployees = employees.filter((e) => e.status === 'compliant');
  const implementedControls = DEMO_CONTROLS.filter((c) => c.status === 'implemented' || c.status === 'verified').length;

  return {
    complianceScore: avgProgress,
    activeFrameworks: activeFrameworks.length,
    openRisks: openRisks.length,
    criticalRisks: criticalRisks.length,
    evidenceCollected: collected.length,
    evidencePending: pending.length,
    vendorHighRisk: vendors.filter((v) => v.riskClass === 'high' || v.riskClass === 'critical').length,
    aiGovernanceStatus: 'ISO 42001 — 58% complete',
    employeeComplianceRate: employees.length ? Math.round((compliantEmployees.length / employees.length) * 100) : 0,
    auditReadiness: Math.round((implementedControls / DEMO_CONTROLS.length) * 100),
    trustCenterStatus: trustCenter.status,
    upcomingReviews: [
      { id: 'task_005', title: 'Threat intel implementation', dueAt: '2026-06-15T00:00:00Z', type: 'task' },
      { id: 'vnd_001', title: 'CloudServe security review', dueAt: '2026-07-30T00:00:00Z', type: 'vendor' },
      { id: 'risk_007', title: 'LLM prompt injection review', dueAt: '2026-07-25T00:00:00Z', type: 'risk' },
      { id: 'task_003', title: 'DPIA — customer analytics', dueAt: '2026-07-20T00:00:00Z', type: 'task' },
    ],
  };
}
