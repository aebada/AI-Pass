'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../agents.module.css';

interface SkillRow {
  id: string;
  name: string;
  skillType: string;
  category: string;
  creditCost: number;
  certified?: boolean;
  description: string;
  riskLevel: string;
}

export default function AgentSkillsPage() {
  const [skills, setSkills] = useState<SkillRow[]>([]);

  useEffect(() => {
    fetch('/api/v1/agents/skills')
      .then((r) => r.json())
      .then((d) => setSkills(d.skills ?? []));
  }, []);

  return (
    <>
      <div className={styles.actions}>
        <Link href="/workspace/marketplace" className={styles.btn}>Browse Marketplace</Link>
      </div>
      <div className={styles.grid}>
        {skills.map((s) => (
          <article key={s.id} className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3>{s.name}</h3>
              {s.certified && <span className={styles.badge}>Certified</span>}
            </div>
            <p>{s.description}</p>
            <p className={styles.meta}>
              {s.skillType} · {s.category} · {s.creditCost} credits · {s.riskLevel} risk
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
