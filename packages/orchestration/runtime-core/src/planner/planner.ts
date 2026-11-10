import { createId } from '@ai-pass/shared';
import type { Plan, PlanInput, Task } from '../types.js';

const TASK_TEMPLATES: Array<{
  match: RegExp;
  name: string;
  type: Task['type'];
  skillId?: string;
  credits: number;
}> = [
  { match: /parse|extract|ocr|invoice/i, name: 'Parse & extract', type: 'skill', skillId: 'skill_invoice_parser', credits: 12 },
  { match: /search|retrieve|rag|knowledge/i, name: 'Retrieve knowledge', type: 'skill', skillId: 'skill_rag_search', credits: 8 },
  { match: /decide|approve|recommend|rank/i, name: 'Decision reasoning', type: 'skill', skillId: 'skill_decision_engine', credits: 15 },
  { match: /email|slack|notify|message/i, name: 'Send notification', type: 'skill', skillId: 'skill_notify', credits: 5 },
  { match: /workflow|automate|trigger/i, name: 'Run automation', type: 'automation', credits: 10 },
  { match: /report|summary|executive/i, name: 'Compose report', type: 'skill', skillId: 'skill_reporting', credits: 10 },
  { match: /browser|click|form|portal|upload/i, name: 'Computer action', type: 'action', credits: 20 },
];

function inferTasks(goal: string, _input: PlanInput): Task[] {
  const tasks: Task[] = [];
  let order = 0;

  const addTask = (tpl: (typeof TASK_TEMPLATES)[number]) => {
    tasks.push({
      id: `task_${createId()}`,
      name: tpl.name,
      description: `${tpl.name} for: ${goal.slice(0, 80)}`,
      type: tpl.type,
      skillId: tpl.skillId,
      dependencies: order > 0 ? [tasks[order - 1].id] : [],
      status: 'pending',
      estimatedCredits: tpl.credits,
      order,
    });
    order += 1;
  };

  for (const tpl of TASK_TEMPLATES) {
    if (tpl.match.test(goal)) addTask(tpl);
  }

  if (tasks.length === 0) {
    tasks.push({
      id: `task_${createId()}`,
      name: 'Reason & respond',
      description: `Process goal: ${goal}`,
      type: 'model',
      dependencies: [],
      status: 'pending',
      estimatedCredits: 10,
      order: 0,
    });
  }

  const finalTask: Task = {
    id: `task_${createId()}`,
    name: 'Evaluate & compose output',
    description: 'Run evaluator and format structured output',
    type: 'tool',
    toolId: 'evaluator',
    dependencies: [tasks[tasks.length - 1].id],
    status: 'pending',
    estimatedCredits: 3,
    order: tasks.length,
  };
  tasks.push(finalTask);

  return tasks;
}

export function generateExecutionPlan(input: PlanInput): Plan {
  const goal = input.goal.trim();
  const tasks = inferTasks(goal, input);

  const requiredSkills = [...new Set(tasks.filter((t) => t.skillId).map((t) => t.skillId!))];
  const requiredTools = [...new Set(tasks.filter((t) => t.toolId).map((t) => t.toolId!))];
  const requiredModels = tasks.some((t) => t.type === 'model') ? ['routed-via-provider-hub'] : [];

  const estimatedCredits = tasks.reduce((sum, t) => sum + t.estimatedCredits, 0);
  const estimatedCostUsd = Math.round((estimatedCredits * 0.002 + Number.EPSILON) * 100) / 100;

  return {
    id: `plan_${createId()}`,
    input,
    tasks,
    requiredTools,
    requiredSkills,
    requiredModels,
    estimatedCredits,
    estimatedCostUsd,
    summary: `${tasks.length} tasks · ${estimatedCredits} credits est. · ${requiredSkills.length} skills`,
    createdAt: new Date().toISOString(),
  };
}
