'use client';

import styles from '../agents.module.css';

export default function AgentSettingsPage() {
  return (
    <>
      <div className={styles.card}>
        <h3>Provider Hub</h3>
        <p>All agent AI calls route through Provider Hub with auto-routing. Enterprise BYOK available on Enterprise plan.</p>
        <p className={styles.meta}>Default route: provider-hub-auto · Model tier: professional</p>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
        <h3>Membership Gates</h3>
        <ul className={styles.logs}>
          <li>Free: 1 agent, no Agent Studio</li>
          <li>Professional: 10 agents, Agent Studio, publishing</li>
          <li>Power: unlimited agents, multi-agent orchestration</li>
          <li>Enterprise: governance, BYOK, private routing</li>
        </ul>
      </div>

      <div className={styles.card} style={{ marginTop: 16 }}>
        <h3>Skill availability</h3>
        <p>
          Workspace skills use availability states: Editors only, All members, or Members and Agents.
          Configure create/change policies and per-skill availability in{' '}
          <a href="/workspace/settings/skills">Settings → Skills</a>.
        </p>
        <p className={styles.meta}>
          Agents only auto-discover skills set to Members and Agents. Indirect use via agent
          attachment still works for Editors only skills.
        </p>
      </div>
    </>
  );
}
