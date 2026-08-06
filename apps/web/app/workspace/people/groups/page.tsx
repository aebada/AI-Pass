'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CAPABILITY_CATALOG,
  BUILDERS_GROUP_SLUG,
  getWorkspaceRbacService,
  type Capability,
  type WorkspaceGroup,
  type WorkspaceMember,
} from '@ai-pass/workspace-rbac';
import { ModuleScaffold } from '../../../components/workspace/ModuleScaffold';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { Button, Card } from '@ai-pass/ui';
import styles from '../people.module.css';
import gstyles from './groups.module.css';

export default function GroupsPage() {
  const svc = useMemo(() => getWorkspaceRbacService(), []);
  const [groups, setGroups] = useState<WorkspaceGroup[]>(() => svc.listGroups());
  const [members] = useState<WorkspaceMember[]>(() => svc.listMembers());
  const [selectedId, setSelectedId] = useState<string | null>(groups[0]?.id ?? null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const selected = groups.find((g) => g.id === selectedId) ?? null;

  function refresh() {
    const next = svc.listGroups();
    setGroups(next);
    if (selectedId && !next.some((g) => g.id === selectedId)) {
      setSelectedId(next[0]?.id ?? null);
    }
  }

  function createGroup() {
    setError(null);
    try {
      const g = svc.createGroup({ name, description });
      setName('');
      setDescription('');
      refresh();
      setSelectedId(g.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    }
  }

  function toggleCapability(cap: Capability) {
    if (!selected) return;
    const has = selected.capabilities.includes(cap);
    const capabilities = has
      ? selected.capabilities.filter((c) => c !== cap)
      : [...selected.capabilities, cap];
    svc.updateGroup(selected.id, { capabilities });
    refresh();
  }

  function toggleMember(userId: string) {
    if (!selected) return;
    const has = selected.memberIds.includes(userId);
    const memberIds = has
      ? selected.memberIds.filter((id) => id !== userId)
      : [...selected.memberIds, userId];
    svc.updateGroup(selected.id, { memberIds });
    refresh();
  }

  function removeGroup() {
    if (!selected) return;
    setError(null);
    try {
      svc.deleteGroup(selected.id);
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  }

  return (
    <WorkspaceLayoutClient title="Groups" subtitle="Assign capabilities to groups">
      <ModuleScaffold
        title="Groups"
        description="Create groups manually or via SCIM, then assign capabilities once for everyone in the group."
        moduleId="people-groups"
        icon="▦"
        status="done"
        actions={[
          { label: 'People', href: '/workspace/people' },
          { label: 'SCIM', href: '/workspace/settings/governance/scim' },
        ]}
      >
        {groups.some((g) => g.slug === BUILDERS_GROUP_SLUG) && (
          <div className={styles.banner}>
            The Builder role has been replaced by explicit governance capabilities. Existing Builders were
            moved to the <strong>builders</strong> group with equivalent permissions. Review and adjust it
            below.
          </div>
        )}

        <div className={gstyles.layout}>
          <aside className={gstyles.listPane}>
            <h3 className={styles.sectionTitle}>All groups</h3>
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className={`${gstyles.groupItem} ${g.id === selectedId ? gstyles.groupItemActive : ''}`}
                onClick={() => setSelectedId(g.id)}
              >
                <strong>{g.name}</strong>
                <span className={styles.muted}>
                  {g.source} · {g.memberIds.length} members
                </span>
              </button>
            ))}

            <Card padding="md" style={{ marginTop: 16 }}>
              <h3 className={styles.sectionTitle}>New group</h3>
              <input
                className={styles.input}
                style={{ width: '100%', marginBottom: 8 }}
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className={styles.input}
                style={{ width: '100%', marginBottom: 8 }}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button variant="primary" onClick={createGroup} disabled={!name.trim()}>
                Create group
              </Button>
            </Card>
          </aside>

          <section className={gstyles.detailPane}>
            {selected ? (
              <>
                <div className={gstyles.detailHeader}>
                  <div>
                    <h2 className={gstyles.detailTitle}>{selected.name}</h2>
                    <p className={styles.muted}>{selected.description || 'No description'}</p>
                  </div>
                  {selected.slug !== BUILDERS_GROUP_SLUG && (
                    <Button variant="ghost" onClick={removeGroup}>
                      Delete
                    </Button>
                  )}
                </div>

                <h3 className={styles.sectionTitle}>Capabilities</h3>
                <div className={gstyles.capGrid}>
                  {CAPABILITY_CATALOG.map((cap) => {
                    const checked = selected.capabilities.includes(cap.id);
                    return (
                      <label key={cap.id} className={gstyles.capItem}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCapability(cap.id)}
                        />
                        <span>
                          <strong>{cap.label}</strong>
                          <span className={styles.muted}>{cap.description}</span>
                          {cap.adminOnly && (
                            <span className={gstyles.adminOnly}>Admin only</span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <h3 className={styles.sectionTitle}>Members</h3>
                <div className={gstyles.memberList}>
                  {members.map((m) => (
                    <label key={m.userId} className={gstyles.capItem}>
                      <input
                        type="checkbox"
                        checked={selected.memberIds.includes(m.userId)}
                        onChange={() => toggleMember(m.userId)}
                      />
                      <span>
                        <strong>{m.name}</strong>
                        <span className={styles.muted}>{m.email}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <p className={styles.muted}>Select or create a group.</p>
            )}
            {error && <p className={styles.error}>{error}</p>}
            <p className={styles.footerNote} style={{ marginTop: 16 }}>
              <Link href="/workspace/settings/governance">Settings & Governance</Link> brings role matrix,
              audit access, and SCIM together.
            </p>
          </section>
        </div>
      </ModuleScaffold>
    </WorkspaceLayoutClient>
  );
}
