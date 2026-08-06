'use client';

import Link from 'next/link';
import { DragEvent, useCallback, useEffect, useState } from 'react';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import {
  DEMO_WORKFLOW,
  WORKFLOW_BLOCKS,
  WORKFLOW_BLOCK_META,
  createWorkflowStep,
  deleteWorkflowScenario,
  loadWorkflowScenarios,
  saveWorkflowScenario,
  type WorkflowBlockType,
  type WorkflowScenario,
  type WorkflowStep,
} from '../../lib/workflow-scenarios';
import styles from './workflows.module.css';
import { ModuleIcon } from '@ai-pass/ui';

export default function WorkflowsPage() {
  const [scenarios, setScenarios] = useState<WorkflowScenario[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState('New workflow');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  const refreshScenarios = useCallback(() => {
    const loaded = loadWorkflowScenarios();
    if (loaded.length === 0) {
      saveWorkflowScenario(DEMO_WORKFLOW);
      setScenarios([DEMO_WORKFLOW]);
      setActiveId(DEMO_WORKFLOW.id);
      setName(DEMO_WORKFLOW.name);
      setDescription(DEMO_WORKFLOW.description);
      setSteps(DEMO_WORKFLOW.steps);
      return;
    }
    setScenarios(loaded);
    const current = loaded.find((s) => s.id === activeId) ?? loaded[0]!;
    setActiveId(current.id);
    setName(current.name);
    setDescription(current.description);
    setSteps(current.steps);
  }, [activeId]);

  useEffect(() => {
    refreshScenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once on mount
  }, []);

  const selectScenario = (scenario: WorkflowScenario) => {
    setActiveId(scenario.id);
    setName(scenario.name);
    setDescription(scenario.description);
    setSteps(scenario.steps);
  };

  const addStep = (type: WorkflowBlockType) => {
    setSteps((prev) => [...prev, createWorkflowStep(type)]);
  };

  const updateStep = (id: string, patch: Partial<WorkflowStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const moveStep = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= steps.length || to >= steps.length) return;
    setSteps((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
  };

  const handlePaletteDragStart = (e: DragEvent, type: WorkflowBlockType) => {
    e.dataTransfer.setData('application/workflow-block', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleStepDragStart = (e: DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.setData('application/workflow-step-index', String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnList = (e: DragEvent, targetIndex: number) => {
    e.preventDefault();
    const blockType = e.dataTransfer.getData('application/workflow-block') as WorkflowBlockType;
    const fromIndex = Number(e.dataTransfer.getData('application/workflow-step-index'));

    if (blockType && WORKFLOW_BLOCK_META[blockType]) {
      const step = createWorkflowStep(blockType);
      setSteps((prev) => {
        const next = [...prev];
        next.splice(targetIndex, 0, step);
        return next;
      });
    } else if (!Number.isNaN(fromIndex) && fromIndex >= 0) {
      moveStep(fromIndex, targetIndex);
    }

    setDragIndex(null);
    setOverIndex(null);
  };

  const handleSave = () => {
    const saved = saveWorkflowScenario({
      id: activeId ?? undefined,
      name,
      description,
      steps,
    });
    setActiveId(saved.id);
    setScenarios(loadWorkflowScenarios());
    setToast('Workflow saved');
    window.setTimeout(() => setToast(''), 2500);
  };

  const handleNew = () => {
    setActiveId(null);
    setName('New workflow');
    setDescription('');
    setSteps([createWorkflowStep('trigger')]);
  };

  const handleDelete = (id: string) => {
    deleteWorkflowScenario(id);
    const next = loadWorkflowScenarios();
    setScenarios(next);
    if (activeId === id) {
      if (next[0]) selectScenario(next[0]);
      else handleNew();
    }
  };

  return (
    <WorkspaceLayoutClient
      title="Workflows"
      subtitle="Drag-and-drop workflow builder with local scenario storage"
    >
      <div className={styles.shell}>
        <p className={styles.demoBanner}>
          Demo mode on static hosting — scenarios persist in localStorage. For LiveSync orchestration
          see <Link href="/workspace/workflows/livesync">LiveSync Engine →</Link>
        </p>

        <div className={styles.builderLayout}>
          <aside className={styles.palette}>
            <h2 className={styles.paletteTitle}>Step palette</h2>
            {WORKFLOW_BLOCKS.map((block) => (
              <button
                key={block.type}
                type="button"
                className={styles.paletteBlock}
                draggable
                onDragStart={(e) => handlePaletteDragStart(e, block.type)}
                onClick={() => addStep(block.type)}
              >
                <span aria-hidden><ModuleIcon name={block.icon} size={16} /></span>
                {block.label}
              </button>
            ))}
          </aside>

          <div className={styles.canvas}>
            <div className={styles.canvasHeader}>
              <h2 className={styles.canvasTitle}>Workflow canvas</h2>
              <div className={styles.toolbar}>
                <button type="button" className={styles.btnSecondary} onClick={handleNew}>
                  New
                </button>
                <button type="button" className={styles.btn} onClick={handleSave}>
                  Save scenario
                </button>
              </div>
            </div>

            <div className={styles.metaRow}>
              <input
                className={styles.formInput}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workflow name"
                aria-label="Workflow name"
              />
              <input
                className={styles.formInput}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description"
                aria-label="Workflow description"
              />
            </div>

            <div
              className={styles.stepList}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDropOnList(e, steps.length)}
            >
              {steps.length === 0 ? (
                <div className={styles.stepListEmpty}>
                  Drag steps from the palette or click a block type to start building.
                </div>
              ) : (
                steps.map((step, index) => {
                  const meta = WORKFLOW_BLOCK_META[step.type];
                  return (
                    <div key={step.id}>
                      <div
                        className={`${styles.stepCard} ${dragIndex === index ? styles.stepCardDragging : ''} ${overIndex === index ? styles.stepCardOver : ''}`}
                        draggable
                        onDragStart={(e) => handleStepDragStart(e, index)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setOverIndex(index);
                        }}
                        onDragLeave={() => setOverIndex(null)}
                        onDrop={(e) => handleDropOnList(e, index)}
                      >
                        <span className={styles.dragHandle} aria-hidden>
                          ⋮⋮
                        </span>
                        <div className={styles.stepBody}>
                          <div className={styles.stepHeader}>
                            <span
                              className={styles.stepTypeBadge}
                              style={{ borderColor: meta.color, color: meta.color }}
                            >
                              <ModuleIcon name={meta.icon} size={14} /> {meta.label}
                            </span>
                            <input
                              className={styles.stepTitleInput}
                              value={step.title}
                              onChange={(e) => updateStep(step.id, { title: e.target.value })}
                              aria-label="Step title"
                            />
                            <div className={styles.stepActions}>
                              <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => removeStep(step.id)}
                                aria-label="Remove step"
                              >
                                <ModuleIcon name="x" size={16} />
                              </button>
                            </div>
                          </div>
                          <textarea
                            className={styles.formTextarea}
                            value={step.instructions}
                            onChange={(e) => updateStep(step.id, { instructions: e.target.value })}
                            placeholder={meta.description}
                            aria-label="Step instructions"
                          />
                        </div>
                      </div>
                      {index < steps.length - 1 && (
                        <div className={styles.connector} aria-hidden>
                          ↓
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {scenarios.length > 0 && (
          <section>
            <h3 className={styles.paletteTitle}>Saved scenarios</h3>
            <div className={styles.savedList}>
              {scenarios.map((scenario) => (
                <article
                  key={scenario.id}
                  className={`${styles.savedCard} ${activeId === scenario.id ? styles.savedCardActive : ''}`}
                  onClick={() => selectScenario(scenario)}
                  onKeyDown={(e) => e.key === 'Enter' && selectScenario(scenario)}
                  role="button"
                  tabIndex={0}
                >
                  <h4>{scenario.name}</h4>
                  <p>
                    {scenario.steps.length} steps · updated{' '}
                    {new Date(scenario.updatedAt).toLocaleDateString()}
                  </p>
                  {scenario.id !== DEMO_WORKFLOW.id && (
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      style={{ marginTop: '0.5rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(scenario.id);
                      }}
                    >
                      Delete
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </WorkspaceLayoutClient>
  );
}
