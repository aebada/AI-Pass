'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RequirementSpec } from '@ai-pass/requirements';
import { createBuilderPlatform } from '@ai-pass/builder';
import type { SolutionPreview, SolutionSpec } from '@ai-pass/builder';
import { createDeploymentPlatform } from '@ai-pass/deployment';
import { Badge, Card, ProGate } from '@ai-pass/ui';
import { BusinessShell, Button } from '../components/business/BusinessShell';
import { useApp } from '../components/premium/AppProviders';
import styles from './studio.module.css';

const builder = createBuilderPlatform();
const deployment = createDeploymentPlatform();

const CANVAS_ELEMENTS = [
  { id: 'form', icon: '📋', label: 'Form Block' },
  { id: 'workflow', icon: '⚡', label: 'Workflow Step' },
  { id: 'table', icon: '📊', label: 'Data Table' },
  { id: 'agent', icon: '🤖', label: 'Agent Node' },
  { id: 'integration', icon: '🔗', label: 'Integration' },
];

export default function StudioPage() {
  const router = useRouter();
  const { user } = useApp();
  const [spec, setSpec] = useState<RequirementSpec | null>(null);
  const [solution, setSolution] = useState<SolutionSpec | null>(null);
  const [preview, setPreview] = useState<SolutionPreview | null>(null);
  const [deployMessage, setDeployMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'workflow' | 'web' | 'mobile'>('workflow');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [canvasNodes, setCanvasNodes] = useState<string[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('ai-pass:studio-spec') ?? localStorage.getItem('ai-pass:last-requirement');
    if (raw) {
      const parsed = JSON.parse(raw) as RequirementSpec;
      setSpec(parsed);
      const result = builder.compiler.compile(parsed);
      setSolution(result.solution);
      setPreview(result.preview);
      builder.store.save(result.solution);
    }
  }, []);

  function handleGenerate() {
    if (!spec) {
      router.push('/requirements');
      return;
    }
    const result = builder.compiler.compile(spec);
    setSolution(result.solution);
    setPreview(result.preview);
    builder.store.save(result.solution);
    localStorage.setItem('ai-pass:last-solution', JSON.stringify(result.solution));
  }

  function handleDeploy() {
    if (!solution) return;
    const result = deployment.scaffolder.deploy({ solution, requestedBy: 'business_admin' });
    setDeployMessage(result.message);
    if (result.success) {
      solution.status = 'deployed';
      builder.store.save(solution);
      localStorage.setItem('ai-pass:last-solution', JSON.stringify(solution));
      localStorage.setItem('ai-pass:solutions', JSON.stringify([...getStoredSolutions(), solution]));
    }
  }

  function addCanvasElement(label: string) {
    setCanvasNodes((prev) => [...prev, label]);
  }

  return (
    <BusinessShell
      title="Solution Builder Studio"
      subtitle={spec ? spec.title : 'Load requirements to start building'}
    >
      {!spec ? (
        <Card variant="glass" padding="lg">
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No requirements loaded.</p>
          <Button onClick={() => router.push('/requirements')}>Start Requirements Wizard</Button>
        </Card>
      ) : (
        <>
          <div className={styles.toolbar}>
            <Button onClick={handleGenerate}>✨ Generate Solution</Button>
            <ProGate requiredTier="pro" currentTier={user?.plan ?? 'free'} featureName="One-click deploy">
              <Button variant="secondary" onClick={handleDeploy} disabled={!solution}>
                🚀 Deploy
              </Button>
            </ProGate>
            {solution && <Badge variant="success">{solution.status}</Badge>}
            {deployMessage && <span className={styles.deployMsg}>{deployMessage}</span>}
          </div>

          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <Card variant="glass" padding="sm">
                <h3 className={styles.panelTitle}>Canvas Elements</h3>
                <p className={styles.panelHint}>Drag or click to add to canvas</p>
                {CANVAS_ELEMENTS.map((el) => (
                  <button
                    key={el.id}
                    type="button"
                    className={styles.paletteItem}
                    onClick={() => addCanvasElement(el.label)}
                  >
                    <span>{el.icon}</span> {el.label}
                  </button>
                ))}
              </Card>
              {solution && (
                <Card variant="outline" padding="sm" style={{ marginTop: 16 }}>
                  <h3 className={styles.panelTitle}>Governance</h3>
                  <div className={styles.govRow}>
                    Risk: <Badge variant="warning">{solution.governance.riskLevel}</Badge>
                  </div>
                  <div className={styles.govRow}>
                    Approval: {solution.governance.requiresApproval ? 'Required' : 'Not required'}
                  </div>
                  <div className={styles.govRow}>
                    Audit: {solution.governance.auditEnabled ? 'Enabled' : 'Off'}
                  </div>
                </Card>
              )}
            </aside>

            <section className={styles.canvas}>
              <div className={styles.tabs}>
                {(['workflow', 'web', 'mobile'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'workflow' ? '⚡ Workflow' : tab === 'web' ? '🌐 Web' : '📱 Mobile'}
                  </button>
                ))}
              </div>

              <Card variant="glass" padding="lg" className={styles.canvasArea}>
                {activeTab === 'workflow' && preview && (
                  <div className={styles.workflowCanvas}>
                    <div className={styles.canvasGrid} aria-hidden />
                    <h3 className={styles.canvasTitle}>Workflow Canvas</h3>
                    {canvasNodes.map((node, i) => (
                      <div key={`custom-${i}`} className={styles.customNode}>
                        ⊞ {node}
                      </div>
                    ))}
                    {preview.workflowGraph.map((step, i) => (
                      <div key={step.stepId} className={styles.workflowRow}>
                        <button
                          type="button"
                          className={`${styles.workflowNode} ${selectedNode === step.stepId ? styles.workflowNodeSelected : ''}`}
                          onClick={() => setSelectedNode(step.stepId)}
                        >
                          <span className={styles.nodeIndex}>{i + 1}</span>
                          <strong>{step.label}</strong>
                          {step.agent && (
                            <Badge variant="pro">🤖 {step.agent}</Badge>
                          )}
                        </button>
                        {i < preview.workflowGraph.length - 1 && (
                          <div className={styles.connector}>↓</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'web' && preview && (
                  <div>
                    <h3 className={styles.canvasTitle}>Web Layout Preview</h3>
                    <div className={styles.screenGrid}>
                      {preview.webLayout.map((screen) => (
                        <Card key={screen.route} variant="elevated" padding="sm" hover>
                          <div className={styles.screenRoute}>{screen.route}</div>
                          <strong>{screen.title}</strong>
                          <div className={styles.chipRow}>
                            {screen.components.map((c) => (
                              <Badge key={c} variant="outline">{c}</Badge>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'mobile' && preview && (
                  <div className={styles.mobileWrap}>
                    <div className={styles.mobileFrame}>
                      <div className={styles.mobileNotch} />
                      {preview.mobileLayout.map((screen) => (
                        <div key={screen.screen} className={styles.mobileScreen}>
                          <strong>{screen.title}</strong>
                          <div className={styles.chipRow}>
                            {screen.components.map((c) => (
                              <Badge key={c} variant="outline">{c}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </section>
          </div>
        </>
      )}
    </BusinessShell>
  );
}

function getStoredSolutions(): SolutionSpec[] {
  try {
    return JSON.parse(localStorage.getItem('ai-pass:solutions') ?? '[]') as SolutionSpec[];
  } catch {
    return [];
  }
}
