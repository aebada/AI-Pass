import { useState } from 'react';
import type { AppSettings, McpServerConfig, ProviderId, Skill } from '@ai-pass/shared';
import styles from './SettingsModal.module.css';

const DEFAULT_SKILLS: Skill[] = [
  { id: 'automate', name: 'Automations', description: 'Create workflow automations', path: '.ai-pass/skills/automate', enabled: true },
  { id: 'create-skill', name: 'Create Skill', description: 'Author agent skills', path: '.ai-pass/skills/create-skill', enabled: true },
  { id: 'create-rule', name: 'Create Rule', description: 'Project rules and conventions', path: '.ai-pass/skills/create-rule', enabled: true },
  { id: 'sdk', name: 'Agent SDK', description: 'Programmatic agent integration', path: '.ai-pass/skills/sdk', enabled: false },
];

function loadMcpServers(): McpServerConfig[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('ai-pass-mcp');
    return raw ? (JSON.parse(raw) as McpServerConfig[]) : [];
  } catch {
    return [];
  }
}

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

const PROVIDERS: { id: ProviderId; label: string }[] = [
  { id: 'openai', label: 'OpenAI' },
  { id: 'anthropic', label: 'Anthropic' },
  { id: 'openai-compatible', label: 'OpenAI Compatible (Ollama, etc.)' },
];

export function SettingsModal({ settings, onSave, onClose }: SettingsModalProps) {
  const [draft, setDraft] = useState<AppSettings>(() => {
    const base = structuredClone(settings);
    if (!base.skills.length) base.skills = DEFAULT_SKILLS;
    return base;
  });
  const [mcpServers, setMcpServers] = useState<McpServerConfig[]>(loadMcpServers);
  const [activeTab, setActiveTab] = useState<'models' | 'editor' | 'rules' | 'skills' | 'mcp'>('models');

  const updateModel = (
    role: 'chat' | 'completion' | 'agent',
    field: string,
    value: string | number | boolean
  ) => {
    setDraft((prev) => ({
      ...prev,
      models: {
        ...prev.models,
        [role]: { ...prev.models[role], [field]: value },
      },
    }));
  };

  return (
    <div className={styles.overlay} onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()} role="presentation">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Settings">
        <header className={styles.header}>
          <h2>Settings</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className={styles.body}>
          <nav className={styles.tabs}>
            {(['models', 'editor', 'rules', 'skills', 'mcp'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? styles.activeTab : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className={styles.content}>
            {activeTab === 'models' && (
              <div className={styles.section}>
                {(['chat', 'agent', 'completion'] as const).map((role) => (
                  <fieldset key={role} className={styles.fieldset}>
                    <legend>{role.charAt(0).toUpperCase() + role.slice(1)} Model</legend>
                    <label>
                      Provider
                      <select
                        value={draft.models[role].provider}
                        onChange={(e) => updateModel(role, 'provider', e.target.value)}
                      >
                        {PROVIDERS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Model
                      <input
                        type="text"
                        value={draft.models[role].model}
                        onChange={(e) => updateModel(role, 'model', e.target.value)}
                      />
                    </label>
                    <label>
                      API Key
                      <input
                        type="password"
                        value={draft.models[role].apiKey ?? ''}
                        onChange={(e) => updateModel(role, 'apiKey', e.target.value)}
                        placeholder="sk-..."
                      />
                    </label>
                    <label>
                      Base URL (optional)
                      <input
                        type="text"
                        value={draft.models[role].baseUrl ?? ''}
                        onChange={(e) => updateModel(role, 'baseUrl', e.target.value)}
                        placeholder="https://api.openai.com/v1"
                      />
                    </label>
                  </fieldset>
                ))}
              </div>
            )}

            {activeTab === 'editor' && (
              <div className={styles.section}>
                <label>
                  Theme
                  <select
                    value={draft.theme}
                    onChange={(e) => setDraft((p) => ({ ...p, theme: e.target.value as AppSettings['theme'] }))}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </label>
                <label>
                  Font Size
                  <input
                    type="number"
                    min={10}
                    max={24}
                    value={draft.editorFontSize}
                    onChange={(e) => setDraft((p) => ({ ...p, editorFontSize: Number(e.target.value) }))}
                  />
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={draft.enableInlineCompletion}
                    onChange={(e) => setDraft((p) => ({ ...p, enableInlineCompletion: e.target.checked }))}
                  />
                  Enable inline AI completion
                </label>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={draft.enableCodebaseIndexing}
                    onChange={(e) => setDraft((p) => ({ ...p, enableCodebaseIndexing: e.target.checked }))}
                  />
                  Enable codebase indexing
                </label>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className={styles.section}>
                <p className={styles.note}>
                  Project rules load from localStorage (`.ai-pass/rules` file support in desktop). One rule per
                  block, separated by <code>---</code>. First line is the rule name.
                </p>
                <label>
                  Rules (markdown)
                  <textarea
                    className={styles.rulesEditor}
                    rows={12}
                    value={draft.rules.map((r) => `# ${r.name}\n${r.content}`).join('\n---\n')}
                    onChange={(e) => {
                      const blocks = e.target.value.split(/\n---\n/);
                      const rules = blocks
                        .map((block, i) => {
                          const lines = block.trim().split('\n');
                          const name = lines[0]?.replace(/^#\s*/, '') || `Rule ${i + 1}`;
                          const content = lines.slice(1).join('\n').trim() || block.trim();
                          return {
                            id: draft.rules[i]?.id ?? `rule-${i}`,
                            scope: 'project' as const,
                            name,
                            content,
                            enabled: true,
                            priority: i,
                          };
                        })
                        .filter((r) => r.content);
                      setDraft((p) => ({ ...p, rules }));
                    }}
                  />
                </label>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className={styles.section}>
                <p className={styles.note}>
                  Agent skills extend chat and agent modes. Toggle which skills are active for this workspace.
                </p>
                {draft.skills.map((skill, i) => (
                  <div key={skill.id} className={styles.skillRow}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={skill.enabled}
                        onChange={(e) => {
                          const skills = [...draft.skills];
                          skills[i] = { ...skill, enabled: e.target.checked };
                          setDraft((p) => ({ ...p, skills }));
                        }}
                      />
                      <strong>{skill.name}</strong>
                    </label>
                    <p className={styles.skillDesc}>{skill.description}</p>
                    <code className={styles.skillPath}>{skill.path}</code>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'mcp' && (
              <div className={styles.section}>
                <p className={styles.note}>
                  MCP servers connect external tools to the agent. On static hosting, MCP runs client-side stubs;
                  desktop builds use full stdio transport.
                </p>
                {mcpServers.map((server, i) => (
                  <fieldset key={server.id} className={styles.fieldset}>
                    <legend>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={server.enabled}
                          onChange={(e) => {
                            const next = [...mcpServers];
                            next[i] = { ...server, enabled: e.target.checked };
                            setMcpServers(next);
                          }}
                        />
                        {server.name}
                      </label>
                    </legend>
                    <label>
                      Command
                      <input
                        type="text"
                        value={server.command}
                        onChange={(e) => {
                          const next = [...mcpServers];
                          next[i] = { ...server, command: e.target.value };
                          setMcpServers(next);
                        }}
                      />
                    </label>
                  </fieldset>
                ))}
                <button
                  type="button"
                  className={styles.addMcpBtn}
                  onClick={() =>
                    setMcpServers((prev) => [
                      ...prev,
                      {
                        id: `mcp-${Date.now()}`,
                        name: 'New MCP Server',
                        command: 'npx',
                        args: ['-y', '@modelcontextprotocol/server-filesystem', '.'],
                        enabled: true,
                      },
                    ])
                  }
                >
                  + Add MCP Server
                </button>
              </div>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={() => {
              localStorage.setItem('ai-pass-mcp', JSON.stringify(mcpServers));
              onSave(draft);
            }}
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}
