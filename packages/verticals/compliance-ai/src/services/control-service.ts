import type { Control, Task } from '../types.js';
import { ComplianceStore, newId } from './store.js';
import type { AuditService } from './audit-service.js';

export class ControlService {
  constructor(
    private store: ComplianceStore,
    private audit: AuditService,
  ) {}

  list(tenantId: string, frameworkId?: string): Control[] {
    return this.store.listByTenant(this.store.controls, tenantId).filter(
      (c) => !frameworkId || c.frameworkId === frameworkId,
    );
  }

  get(id: string): Control | undefined {
    return this.store.controls.get(id);
  }

  create(params: {
    tenantId: string;
    frameworkId: string;
    controlRef: string;
    title: string;
    description: string;
    ownerId: string;
    ownerName: string;
  }): Control {
    const framework = this.store.frameworks.get(params.frameworkId);
    if (!framework) throw new Error('Framework not found');

    const now = new Date().toISOString();
    const control: Control = {
      id: newId('ctl'),
      tenantId: params.tenantId,
      frameworkId: params.frameworkId,
      frameworkCode: framework.code,
      controlRef: params.controlRef,
      title: params.title,
      description: params.description,
      status: 'not_started',
      ownerId: params.ownerId,
      ownerName: params.ownerName,
      evidenceIds: [],
      riskIds: [],
      policyIds: [],
      mappedControlRefs: [],
      progress: 0,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.store.controls.set(control.id, control);
    return control;
  }

  updateStatus(id: string, status: Control['status'], actorId: string, actorName: string): Control {
    const control = this.store.controls.get(id);
    if (!control) throw new Error('Control not found');
    const updated = { ...control, status, updatedAt: new Date().toISOString(), progress: status === 'verified' ? 100 : control.progress };
    this.store.controls.set(id, updated);
    this.audit.log({
      tenantId: control.tenantId,
      entityType: 'control',
      entityId: id,
      action: 'control.status_updated',
      actorId,
      actorName,
      details: { status },
    });
    return updated;
  }
}

export class TaskService {
  constructor(private store: ComplianceStore) {}

  list(tenantId: string, controlId?: string): Task[] {
    return this.store.listByTenant(this.store.tasks, tenantId).filter(
      (t) => !controlId || t.controlId === controlId,
    );
  }

  get(id: string): Task | undefined {
    return this.store.tasks.get(id);
  }

  create(params: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const now = new Date().toISOString();
    const task: Task = { ...params, id: newId('task'), createdAt: now, updatedAt: now };
    this.store.tasks.set(task.id, task);
    return task;
  }
}
