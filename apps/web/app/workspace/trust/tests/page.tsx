'use client';

import { useState } from 'react';
import { getTrustEngine } from '@ai-pass/trust-engine';
import type { TestScenario } from '@ai-pass/trust-engine';
import { Button, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../trust.module.css';

export default function TestBuilderPage() {
  const engine = getTrustEngine();
  const systems = engine.systems.list();
  const [systemId, setSystemId] = useState(systems[0]?.id ?? '');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<TestScenario['category']>('functional');
  const [scenarios, setScenarios] = useState<TestScenario[]>([]);
  const [suiteId, setSuiteId] = useState<string | null>(null);

  const addScenario = () => {
    if (!name) return;
    setScenarios((prev) => [
      ...prev,
      engine.validation.createScenario({ name, category, input: { test: true }, severity: 'medium' }),
    ]);
    setName('');
  };

  const saveSuite = () => {
    if (!systemId || scenarios.length === 0) return;
    const id = engine.registerTestSuite(systemId, scenarios);
    setSuiteId(id);
  };

  return (
    <WorkspaceLayoutClient title="Test Scenario Builder" subtitle="Build validation test suites for AI systems">
      <Card padding="lg">
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label>Target system</label>
            <select value={systemId} onChange={(e) => setSystemId(e.target.value)}>
              {systems.map((s) => <option key={s.id} value={s.id}>{s.productName}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Scenario name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as TestScenario['category'])}>
              <option value="functional">Functional</option>
              <option value="reliability">Reliability</option>
              <option value="explainability">Explainability</option>
              <option value="compliance">Compliance</option>
              <option value="safety">Safety</option>
              <option value="hallucination">Hallucination</option>
              <option value="adversarial">Adversarial</option>
              <option value="edge_case">Edge case</option>
            </select>
          </div>
          <Button variant="secondary" size="sm" onClick={addScenario}>Add scenario</Button>
        </div>

        <h3 className={styles.sectionTitle} style={{ marginTop: 16 }}>Scenarios ({scenarios.length})</h3>
        {scenarios.map((s) => (
          <div key={s.id} className={styles.row}>
            <span>{s.name}</span>
            <span style={{ fontSize: 11, opacity: 0.7 }}>{s.category}</span>
          </div>
        ))}

        <Button variant="primary" size="sm" style={{ marginTop: 12 }} onClick={saveSuite}>Save test suite</Button>
        {suiteId && <p style={{ fontSize: 12, marginTop: 8 }}>Suite ID: {suiteId}</p>}
      </Card>
    </WorkspaceLayoutClient>
  );
}
