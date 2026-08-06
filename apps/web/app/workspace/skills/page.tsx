'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import {
  DEMO_MARKETPLACE_SKILLS,
  SKILL_CATEGORY_LABELS,
  SKILL_ICONS,
  deleteCustomSkill,
  demoExecuteSkill,
  filterSkills,
  formatInstallCount,
  getAllLibrarySkills,
  getMySkills,
  installSkill,
  loadCustomSkills,
  saveCustomSkill,
  uninstallSkill,
  type CustomSkill,
  type LibrarySkill,
  type MarketplaceSkill,
} from '../../lib/skills-library';
import styles from './skills.module.css';
import { ModuleIcon } from '@ai-pass/ui';

type Tab = 'marketplace' | 'library' | 'custom';

export default function SkillsPage() {
  const [tab, setTab] = useState<Tab>('marketplace');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [skills, setSkills] = useState<LibrarySkill[]>([]);
  const [selected, setSelected] = useState<LibrarySkill | null>(null);
  const [runInput, setRunInput] = useState('');
  const [runOutput, setRunOutput] = useState('');
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (tab === 'library') {
      setSkills(getMySkills());
    } else if (tab === 'custom') {
      setSkills(
        loadCustomSkills().map((s) => ({ ...s, source: 'custom' as const, installed: false })),
      );
    } else {
      setSkills(getAllLibrarySkills().filter((s) => s.source === 'marketplace'));
    }
  }, [tab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(
    () => filterSkills(skills, query, category),
    [skills, query, category],
  );

  const handleInstall = (skill: MarketplaceSkill) => {
    installSkill(skill.id, 'marketplace');
    refresh();
  };

  const handleUninstall = (id: string) => {
    uninstallSkill(id);
    refresh();
    if (selected?.id === id) setSelected(null);
  };

  const handleRun = (skill: LibrarySkill) => {
    setSelected(skill);
    setRunOutput(demoExecuteSkill(skill, runInput));
  };

  const handleCustomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customInstructions.trim()) return;
    const saved = saveCustomSkill({
      id: editingId ?? undefined,
      name: customName,
      description: customDesc,
      instructions: customInstructions,
      tags: customTags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    installSkill(saved.id, 'custom');
    setCustomName('');
    setCustomDesc('');
    setCustomInstructions('');
    setCustomTags('');
    setEditingId(null);
    setTab('library');
    refresh();
  };

  const startEdit = (skill: CustomSkill) => {
    setEditingId(skill.id);
    setCustomName(skill.name);
    setCustomDesc(skill.description);
    setCustomInstructions(skill.instructions);
    setCustomTags(skill.tags.join(', '));
    setTab('custom');
  };

  return (
    <WorkspaceLayoutClient
      title="Skills Library"
      subtitle="Browse marketplace skills, create custom skills, and run scenarios"
    >
      <div className={styles.shell}>
        <div className={styles.tabs} role="tablist" aria-label="Skills library views">
          {(
            [
              ['marketplace', 'Marketplace'],
              ['library', 'My Skills'],
              ['custom', 'Create Custom'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`${styles.tab} ${tab === key ? styles.tabActive : ''}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab !== 'custom' && (
          <div className={styles.toolbar}>
            <input
              className={styles.search}
              placeholder="Search skills…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              {Object.entries(SKILL_CATEGORY_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        )}

        {tab === 'custom' ? (
          <form className={styles.customForm} onSubmit={handleCustomSubmit}>
            <h3 className={styles.customTitle}>
              {editingId ? 'Edit custom skill' : 'Create a custom skill'}
            </h3>
            <label className={styles.field}>
              <span>Name</span>
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Contract reviewer"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Description</span>
              <input
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="What this skill does"
              />
            </label>
            <label className={styles.field}>
              <span>System instructions</span>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={6}
                placeholder="Instructions the AI follows when this skill runs…"
                required
              />
            </label>
            <label className={styles.field}>
              <span>Tags (comma-separated)</span>
              <input
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                placeholder="legal, contracts, review"
              />
            </label>
            <div className={styles.customActions}>
              <button type="submit" className={styles.btnPrimary}>
                {editingId ? 'Save skill' : 'Create & install'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => {
                    setEditingId(null);
                    setCustomName('');
                    setCustomDesc('');
                    setCustomInstructions('');
                    setCustomTags('');
                  }}
                >
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className={styles.grid}>
            {filtered.map((skill) => {
              const icon =
                'icon' in skill && skill.icon
                  ? skill.icon
                  : SKILL_ICONS[skill.category] ?? 'sparkles';
              return (
                <article key={`${skill.source}-${skill.id}`} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardIcon} aria-hidden>
                      <ModuleIcon name={icon} size={18} />
                    </span>
                    <div>
                      <h3>{skill.name}</h3>
                      <p className={styles.meta}>
                        v{skill.version}
                        {'creditCost' in skill ? ` · ${skill.creditCost} credits` : ''}
                        {'rating' in skill && skill.rating
                          ? ` · ★ ${skill.rating}`
                          : ''}
                      </p>
                    </div>
                    {skill.certified ? <span className={styles.badge}>Certified</span> : null}
                  </div>
                  <p className={styles.desc}>{skill.description}</p>
                  {'installCount' in skill && (
                    <p className={styles.meta}>
                      {formatInstallCount(skill.installCount)} installs ·{' '}
                      {SKILL_CATEGORY_LABELS[skill.category] ?? skill.category}
                    </p>
                  )}
                  <div className={styles.cardActions}>
                    {tab === 'marketplace' && (
                      skill.installed ? (
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          onClick={() => handleUninstall(skill.id)}
                        >
                          Installed
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          onClick={() => handleInstall(skill as MarketplaceSkill)}
                        >
                          Install
                        </button>
                      )
                    )}
                    {tab === 'library' && skill.source === 'custom' && (
                      <>
                        <button
                          type="button"
                          className={styles.btnSecondary}
                          onClick={() => startEdit(skill as CustomSkill)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.btnDanger}
                          onClick={() => {
                            deleteCustomSkill(skill.id);
                            refresh();
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className={styles.btn}
                      onClick={() => handleRun(skill)}
                    >
                      Try scenario
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {tab === 'marketplace' && filtered.length === 0 && (
          <p className={styles.empty}>
            No marketplace skills match your filters. Showing {DEMO_MARKETPLACE_SKILLS.length}{' '}
            certified skills in the catalog.
          </p>
        )}

        {selected && (
          <section className={styles.runner} aria-label="Skill scenario runner">
            <h3>Scenario: {selected.name}</h3>
            <textarea
              className={styles.runnerInput}
              rows={3}
              value={runInput}
              onChange={(e) => setRunInput(e.target.value)}
              placeholder="Enter sample input for this skill scenario…"
            />
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => setRunOutput(demoExecuteSkill(selected, runInput))}
            >
              Run demo
            </button>
            {runOutput && <pre className={styles.output}>{runOutput}</pre>}
          </section>
        )}
      </div>
    </WorkspaceLayoutClient>
  );
}
