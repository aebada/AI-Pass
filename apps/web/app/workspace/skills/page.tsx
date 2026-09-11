'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { skillAvailabilityLabel, type SkillAvailability } from '@ai-pass/shared';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './skills.module.css';

interface SkillRow {
  id: string;
  name: string;
  category: string;
  creditCost: number;
  certified: boolean;
  description: string;
  availability?: SkillAvailability;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    fetch('/api/v1/agents/skills?scope=member', {
      headers: { 'x-aipass-role': 'builder', 'x-aipass-user-id': 'user_demo_builder' },
    })
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
    <WorkspaceLayoutClient
      title="Skill Library"
      subtitle="Skills visible to you — availability is set per skill in Settings"
    >
      <div className={styles.toolbar}>
        <Link href="/workspace/settings/skills" className={styles.settingsLink}>
          Manage availability & permissions
        </Link>
      </div>
      <div className={styles.grid}>
        {skills.map((s) => (
          <article key={s.id} className={styles.card}>
            <div className={styles.cardTop}>
              <h3>{s.name}</h3>
              <div className={styles.badges}>
                {s.availability && (
                  <span className={styles.availBadge}>{skillAvailabilityLabel(s.availability)}</span>
                )}
                {s.certified && <span className={styles.badge}>Certified</span>}
              </div>
            </div>
            <p>{s.description}</p>
            <p className={styles.meta}>
              {s.category} · {s.creditCost} credits
            </p>
            <button type="button" className={styles.btn} onClick={() => execute(s.id)}>
              Execute
            </button>
          </article>
        ))}
      </div>
      {result && selected && (
        <pre className={styles.output}>
          Result for {selected}:{'\n'}
          {result}
        </pre>
      )}
    </WorkspaceLayoutClient>
  );
}
