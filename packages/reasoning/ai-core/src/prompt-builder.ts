import type { AgentContext, Rule, Skill } from '@ai-pass/shared';

export function buildSystemPrompt(context: AgentContext, mode: 'chat' | 'agent' | 'composer' = 'chat'): string {
  const parts: string[] = [
    'You are AI Pass, an AI-powered code editor assistant.',
    `Mode: ${mode}`,
    `Workspace: ${context.editor.workspaceRoot}`,
  ];

  if (context.editor.activeFilePath) {
    parts.push(`Active file: ${context.editor.activeFilePath}`);
  }

  if (context.editor.selection?.text) {
    parts.push(`Selected code:\n\`\`\`\n${context.editor.selection.text}\n\`\`\``);
  }

  const enabledRules = context.rules.filter((r) => r.enabled).sort((a, b) => b.priority - a.priority);
  if (enabledRules.length) {
    parts.push('Rules:\n' + enabledRules.map(formatRule).join('\n'));
  }

  const enabledSkills = context.skills.filter((s) => s.enabled);
  if (enabledSkills.length) {
    parts.push('Available skills:\n' + enabledSkills.map(formatSkill).join('\n'));
  }

  if (context.editor.openFiles.length) {
    parts.push(
      'Open files:\n' +
        context.editor.openFiles.map((f) => `- ${f.path} (${f.language})`).join('\n')
    );
  }

  return parts.join('\n\n');
}

function formatRule(rule: Rule): string {
  return `[${rule.scope}] ${rule.name}: ${rule.content}`;
}

function formatSkill(skill: Skill): string {
  return `- ${skill.name}: ${skill.description}`;
}
