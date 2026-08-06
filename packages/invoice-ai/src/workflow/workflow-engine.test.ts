import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WorkflowEngine } from './workflow-engine.js';
import type { WorkflowRunContext } from './types.js';
import type { InvoiceWorkflow } from '@ai-pass/shared/invoice-ai';

const baseWorkflow: InvoiceWorkflow = {
  id: 'wf_test',
  tenantId: 'tenant_acme',
  name: 'Test Workflow',
  mode: 'semi_automated',
  isActive: true,
  version: 1,
  steps: [
    { id: 's1', type: 'trigger', label: 'Upload', next: ['s2'] },
    { id: 's2', type: 'validate', label: 'Validate', agentId: 'agent_validation', next: ['s3'] },
    {
      id: 's3',
      type: 'condition',
      label: 'Amount check',
      next: ['s4'],
      config: { conditions: [{ field: 'amount', operator: 'gt', value: 1000 }] },
    },
    { id: 's4', type: 'approve', label: 'Approve', next: [] },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('WorkflowEngine', () => {
  const engine = new WorkflowEngine();

  it('evaluates eq and gt conditions', () => {
    assert.equal(engine.evaluateCondition({ field: 'status', operator: 'eq', value: 'validated' }, { status: 'validated' }), true);
    assert.equal(engine.evaluateCondition({ field: 'amount', operator: 'gt', value: 1000 }, { amount: 5000 }), true);
    assert.equal(engine.evaluateCondition({ field: 'amount', operator: 'gt', value: 1000 }, { amount: 100 }), false);
  });

  it('executes workflow through approve gate in assisted mode', async () => {
    const context: WorkflowRunContext = {
      tenantId: 'tenant_acme',
      userId: 'user_1',
      invoiceId: 'inv_1',
      fileName: 'invoice.pdf',
      variables: { amount: 5000, status: 'validated' },
    };

    const result = await engine.execute(baseWorkflow, context);
    assert.equal(result.status, 'awaiting_approval');
    assert.ok(result.steps.some((s) => s.stepType === 'approve' && s.status === 'awaiting_approval'));
  });

  it('auto-approves in autonomous mode', async () => {
    const autonomous = { ...baseWorkflow, mode: 'autonomous' as const };
    const result = await engine.execute(autonomous, {
      tenantId: 'tenant_acme',
      userId: 'user_1',
      invoiceId: 'inv_1',
      variables: { amount: 5000 },
    });
    assert.equal(result.status, 'completed');
    const approveStep = result.steps.find((s) => s.stepType === 'approve');
    assert.equal(approveStep?.output?.autoApproved, true);
  });

  it('skips branch when condition fails', async () => {
    const result = await engine.execute(baseWorkflow, {
      tenantId: 'tenant_acme',
      userId: 'user_1',
      invoiceId: 'inv_1',
      variables: { amount: 50 },
    });
    const conditionStep = result.steps.find((s) => s.stepType === 'condition');
    assert.equal(conditionStep?.output?.passed, false);
  });
});
