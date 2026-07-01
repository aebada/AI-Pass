'use client';

import { useEffect, useState } from 'react';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './skills.module.css';

interface SkillRow {
  id: string;
  name: string;
  category: string;
  creditCost: number;
  certified: boolean;
  description: string;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    fetch('/api/v1/runtime/skills')
      .then((r) => r.json())
      .then((d) => setSkills(d.skills ?? []));
  }, []);

  const execute = async (skillId: string) => {
    setSelected(skillId);
    const res = await fetch('/api/v1/runtime/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillId, input: { demo: true } }),
    });
    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
  };

  return (
    <WorkspaceLayoutClient title="Skill Library" subtitle="Browse, install, and execute versioned marketplace skills">
      <div className={styles.grid}>
        {skills.map((s) => (
          <article key={s.id} className={styles.card}>
            <div className={styles.cardTop}>
              <h3>{s.name}</h3>
              {s.certified && <span className={styles.badge}>Certified</span>}
            </div>
            <p>{s.description}</p>
            <p className={styles.meta}>{s.category} · {s.creditCost} credits</p>
            <button type="button" className={styles.btn} onClick={() => execute(s.id)}>
              Execute
            </button>
          </article>
        ))}
      </div>
      {result && selected && (
        <pre className={styles.output}>Result for {selected}:{'\n'}{result}</pre>
      )}
    </WorkspaceLayoutClient>
  );
}
