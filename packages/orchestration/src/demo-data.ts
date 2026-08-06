import { createId } from '@ai-pass/shared';
import type { Execution, Plan, PlanInput } from '@ai-pass/runtime-core';

export function demoPlan(goal: string): Plan {
  const input: PlanInput = { goal, membershipTier: 'professional', userId: 'demo-user' };
  const now = new Date().toISOString();
  return {
    id: `plan_demo_${createId()}`,
    input,
    summary: `Demo plan for: ${goal.slice(0, 80)}`,
    estimatedCredits: 18,
    estimatedCostUsd: 0.04,
    requiredTools: ['ocr', 'policy-check'],
    requiredSkills: ['invoice-extract', 'fraud-scan'],
    requiredModels: ['gpt-4o-mini'],
    createdAt: now,
    tasks: [
      {
        id: `task_${createId()}`,
        name: 'Ingest document',
        description: 'Parse uploaded invoice or document',
        type: 'tool',
        toolId: 'ocr',
        dependencies: [],
        status: 'pending',
        estimatedCredits: 4,
        order: 1,
      },
      {
        id: `task_${createId()}`,
        name: 'Extract fields',
        description: 'Structured extraction via model',
        type: 'model',
        dependencies: [],
        status: 'pending',
        estimatedCredits: 6,
        order: 2,
      },
      {
        id: `task_${createId()}`,
        name: 'Policy & fraud check',
        description: 'Run compliance and duplicate detection',
        type: 'skill',
        skillId: 'fraud-scan',
        dependencies: [],
        status: 'pending',
        estimatedCredits: 8,
        order: 3,
      },
    ],
  };
}

export function demoExecution(plan: Plan): Execution {
  const now = new Date().toISOString();
  const executionId = `exec_demo_${createId()}`;
  return {
    id: executionId,
    planId: plan.id,
    status: 'completed',
    mode: 'sequential',
    input: plan.input,
    plan,
    startedAt: now,
    completedAt: now,
    logs: [
      {
        id: `log_${createId()}`,
        executionId,
        level: 'info',
        message: '[Demo] Plan accepted — static hosting, no live runtime API',
        timestamp: now,
      },
      {
        id: `log_${createId()}`,
        executionId,
        level: 'info',
        message: '[Demo] All tasks simulated successfully',
        timestamp: now,
      },
    ],
    metrics: {
      totalDurationMs: 1240,
      planningDurationMs: 180,
      executionDurationMs: 920,
      evaluationDurationMs: 140,
      creditsUsed: plan.estimatedCredits,
      tasksCompleted: plan.tasks.length,
      tasksFailed: 0,
      providerLatencyMs: 420,
      confidence: 0.91,
    },
    output: {
      decision: 'approve',
      confidence: 0.91,
      format: 'executive_summary',
      result: { demo: true, goal: plan.input.goal },
      formatted:
        `[Demo mode]\n\nGoal: ${plan.input.goal}\n\nSimulated result: document parsed, fields extracted, policy checks passed. Connect Node.js or Laravel backend for live orchestration via runtime-core.`,
      evidence: [
        { source: 'ocr', excerpt: 'OCR stub completed', confidence: 0.95 },
        { source: 'extractor', excerpt: 'Extraction fields validated', confidence: 0.92 },
        { source: 'fraud-scan', excerpt: 'No duplicate invoice detected', confidence: 0.88 },
      ],
    },
  };
}
