'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  SKILL_AVAILABILITY_OPTIONS,
  skillAvailabilityLabel,
  type SkillAvailability,
  type SkillAvailabilityChangePolicy,
  type SkillCreatePolicy,
  type WorkspaceSkillPermissions,
} from '@ai-pass/shared';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from './skills-settings.module.css';

interface SkillRow {
  id: string;
  name: string;
  description: string;
  availability: SkillAvailability;
  editorIds: string[];
  skillType?: string;
  category: string;
}

export default function SkillSettingsPage() {
  const [permissions, setPermissions] = useState<WorkspaceSkillPermissions | null>(null);
  const [skills, setSkills] = useState<SkillRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const [permRes, skillsRes] = await Promise.all([
      fetch('/api/v1/workspace/skills/permissions', {
        headers: { 'x-aipass-role': 'admin', 'x-aipass-user-id': 'user_demo_admin' },
      }),
      fetch('/api/v1/agents/skills?scope=all', {
        headers: { 'x-aipass-role': 'admin', 'x-aipass-user-id': 'user_demo_admin' },
      }),
    ]);
    const permData = await permRes.json();
    const skillsData = await skillsRes.json();
    setPermissions(permData.permissions);
    setSkills(skillsData.skills ?? []);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function savePermissions(patch: Partial<WorkspaceSkillPermissions>) {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/workspace/skills/permissions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-aipass-role': 'admin',
          'x-aipass-user-id': 'user_demo_admin',
        },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      setPermissions(data.permissions);
      setMessage('Workspace skill permissions saved.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function setAvailability(skillId: string, availability: SkillAvailability) {
    setMessage(null);
    const res = await fetch('/api/v1/agents/skills', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-aipass-role': 'admin',
        'x-aipass-user-id': 'user_demo_admin',
      },
      body: JSON.stringify({ skillId, availability }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? 'Could not update availability');
      return;
    }
    setSkills((prev) => prev.map((s) => (s.id === skillId ? { ...s, availability } : s)));
    setMessage(`Updated ${data.skill.name} → ${skillAvailabilityLabel(availability)}`);
  }

  return (
    <WorkspaceLayoutClient
      title="Skill availability & permissions"
      subtitle="Control visibility, agent discoverability, and who can manage skills"
    >
      <div className={styles.layout}>
        <section className={styles.panel}>
          <h2>Skill permissions</h2>
          <p className={styles.lead}>
            Separately control who can create skills and who can change their availability. These
            settings govern management — not Space or Pod access.
          </p>

          {permissions && (
            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>Who can create skills</span>
                <select
                  value={permissions.createSkills}
                  disabled={saving}
                  onChange={(e) =>
                    void savePermissions({ createSkills: e.target.value as SkillCreatePolicy })
                  }
                >
                  <option value="admins">Admins only</option>
                  <option value="admins_and_builders">Admins and builders</option>
                  <option value="all_members">All members</option>
                </select>
              </label>

              <label className={styles.field}>
                <span>Who can change availability</span>
                <select
                  value={permissions.changeAvailability}
                  disabled={saving}
                  onChange={(e) =>
                    void savePermissions({
                      changeAvailability: e.target.value as SkillAvailabilityChangePolicy,
                    })
                  }
                >
                  <option value="admins">Admins only</option>
                  <option value="admins_and_editors">Admins and skill editors</option>
                  <option value="editors">Skill editors</option>
                </select>
              </label>
            </div>
          )}

          <div className={styles.legend}>
            <h3>How skill availability works</h3>
            <ul>
              {SKILL_AVAILABILITY_OPTIONS.map((opt) => (
                <li key={opt.id}>
                  <strong>{opt.label}</strong>
                  <span>{opt.description}</span>
                </li>
              ))}
            </ul>
            <p className={styles.note}>
              Existing skills were migrated to <strong>All members</strong>, so prior visibility is
              unchanged. Admins can see all skills, including Editors only. Discoverable skills
              (Members and Agents) can be found and activated automatically by agents.
            </p>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Skills in this workspace</h2>
            <Link href="/workspace/skills" className={styles.link}>
              Open Skill Library
            </Link>
          </div>
          {message && <p className={styles.message}>{message}</p>}
          <div className={styles.skillList}>
            {skills.map((skill) => (
              <article key={skill.id} className={styles.skillRow}>
                <div>
                  <h3>{skill.name}</h3>
                  <p>{skill.description}</p>
                  <p className={styles.meta}>
                    {skill.skillType ?? skill.category} · editors:{' '}
                    {skill.editorIds?.length ? skill.editorIds.join(', ') : '—'}
                  </p>
                </div>
                <label className={styles.availability}>
                  <span>Availability</span>
                  <select
                    value={skill.availability ?? 'all_members'}
                    onChange={(e) =>
                      void setAvailability(skill.id, e.target.value as SkillAvailability)
                    }
                  >
                    {SKILL_AVAILABILITY_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
        </section>
      </div>
    </WorkspaceLayoutClient>
  );
}
