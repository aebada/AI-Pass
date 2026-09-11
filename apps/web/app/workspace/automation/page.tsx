'use client';

import { NODE_TYPE_META, scaffoldWorkflow } from '@ai-pass/automation-engine';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './automation.module.css';

const scaffold = scaffoldWorkflow('Demo Automation');

export default function AutomationPage() {
  return (
    <WorkspaceLayoutClient
      title="Automation Builder"
      subtitle="Visual workflow editor - n8n-like nodes and LiveSync triggers"
    >
      <div className={styles.palette}>
        <h2>Node Types</h2>
        <div className={styles.nodeGrid}>
          {Object.entries(NODE_TYPE_META).map(([type, meta]) => (
            <div key={type} className={styles.nodeChip} style={{ borderColor: meta.color }}>
              <span>{meta.icon}</span>
              <strong>{meta.label}</strong>
              <p>{meta.description}</p>
            </div>
          ))}
        </div>
      </div>

      <section className={styles.canvas}>
        <h2>Workflow Canvas (scaffold)</h2>
        <div className={styles.flow}>
          {scaffold.nodes.map((node) => {
            const meta = NODE_TYPE_META[node.type];
            return (
              <div
                key={node.id}
                className={styles.canvasNode}
                style={{ left: node.position.x, top: node.position.y, borderColor: meta?.color }}
              >
                <span>{meta?.icon}</span>
                <strong>{node.label}</strong>
              </div>
            );
          })}
        </div>
        <p className={styles.hint}>
          Drag-and-drop editor coming soon. Triggers: webhook, schedule, email, file upload, LiveSync, marketplace.
        </p>
      </section>
    </WorkspaceLayoutClient>
  );
}
