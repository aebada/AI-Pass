'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { skillAvailabilityLabel, type SkillAvailability } from '@ai-pass/shared';
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
  availability?: SkillAvailability;
}

export default function AgentSkillsPage() {
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [discoverable, setDiscoverable] = useState<SkillRow[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/agents/skills?scope=member', {
        headers: { 'x-aipass-role': 'builder', 'x-aipass-user-id': 'user_demo_builder' },
      }).then((r) => r.json()),
      fetch('/api/v1/agents/skills?scope=agents').then((r) => r.json()),
    ]).then(([memberData, agentData]) => {
      setSkills(memberData.skills ?? []);
      setDiscoverable(agentData.skills ?? []);
    });
  }, []);

  return (
    <>
      <div className={styles.actions}>
        <Link href="/workspace/marketplace" className={styles.btn}>
          Browse Marketplace
        </Link>
        <Link href="/workspace/settings/skills" className={styles.btn}>
          Availability settings
        </Link>
      </div>

      <div className={styles.card} style={{ marginBottom: 16 }}>
        <h3>Agent discovery</h3>
        <p className={styles.meta}>
          Skills with <strong>Members and Agents</strong> availability can be found and activated
          automatically when they match a task. Currently discoverable:{' '}
          {discoverable.length === 0
            ? 'none — set availability in Settings → Skills.'
            : discoverable.map((s) => s.name).join(', ')}
        </p>
      </div>

      <div className={styles.grid}>
        {skills.map((s) => (
          <article key={s.id} className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <h3>{s.name}</h3>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {s.availability && (
                  <span className={styles.badge}>{skillAvailabilityLabel(s.availability)}</span>
                )}
                {s.certified && <span className={styles.badge}>Certified</span>}
              </div>
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
