import type { EmployeeCompliance } from '../types.js';
import { emitEmployeeLifecycle } from '../livesync.js';
import { defaultWorkflowIntegration } from '../workflow-integration.js';
import { ComplianceStore } from './store.js';

export class EmployeeComplianceService {
  constructor(private store: ComplianceStore) {}

  list(tenantId: string): EmployeeCompliance[] {
    return this.store.listByTenant(this.store.employees, tenantId);
  }

  get(id: string): EmployeeCompliance | undefined {
    return this.store.employees.get(id);
  }

  async onboard(params: {
    tenantId: string;
    employeeId: string;
    employeeName: string;
    email: string;
    department: string;
  }): Promise<EmployeeCompliance> {
    const now = new Date().toISOString();
    const record: EmployeeCompliance = {
      id: `emp_${params.employeeId}`,
      tenantId: params.tenantId,
      employeeId: params.employeeId,
      employeeName: params.employeeName,
      email: params.email,
      department: params.department,
      status: 'pending',
      onboardingComplete: false,
      trainingCompleted: [],
      trainingPending: ['security_101', 'gdpr_basics'],
      policiesAccepted: [],
      policiesPending: ['pol_001', 'pol_003', 'pol_004'],
      taskHistory: [],
      createdAt: now,
      updatedAt: now,
    };
    this.store.employees.set(record.id, record);
    await emitEmployeeLifecycle({ tenantId: params.tenantId, employeeId: params.employeeId, event: 'join' });
    await defaultWorkflowIntegration.triggerEmployeeTask(params.employeeId, params.tenantId);
    return record;
  }

  async offboard(employeeId: string, tenantId: string): Promise<EmployeeCompliance | undefined> {
    const record = this.list(tenantId).find((e) => e.employeeId === employeeId);
    if (!record) return undefined;
    const updated = {
      ...record,
      offboardingScheduled: new Date().toISOString(),
      status: 'non_compliant' as const,
      updatedAt: new Date().toISOString(),
    };
    this.store.employees.set(record.id, updated);
    await emitEmployeeLifecycle({ tenantId, employeeId, event: 'leave' });
    return updated;
  }

  sendReminder(employeeId: string, tenantId: string): boolean {
    const record = this.list(tenantId).find((e) => e.employeeId === employeeId);
    if (!record) return false;
    this.store.employees.set(record.id, {
      ...record,
      lastReminderAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  }

  getComplianceRate(tenantId: string): number {
    const employees = this.list(tenantId);
    if (!employees.length) return 0;
    return Math.round((employees.filter((e) => e.status === 'compliant').length / employees.length) * 100);
  }
}
