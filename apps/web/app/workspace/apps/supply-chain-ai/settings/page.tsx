import { defaultSupplyChainAIService, DEMO_TENANT_ID } from '@ai-pass/supply-chain-ai';
import styles from '../supply-chain-shell.module.css';
import { ModuleIcon } from '@ai-pass/ui';

export default function SettingsPage() {
  const policies = defaultSupplyChainAIService.listPolicies(DEMO_TENANT_ID).policies;

  return (
    <div>
      <header className={styles.header}>
        <h1>Administration & Settings</h1>
        <p className={styles.muted}>Policies, scoring templates, ERP connectors, membership gates</p>
      </header>

      <div className={styles.grid2}>
        <section className={styles.card}>
          <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Active Policies</h2>
          {policies.map((p) => (
            <div key={p.id} style={{ marginBottom: 12, fontSize: 13 }}>
              <strong>{p.name}</strong> — v{p.version}
              <div className={styles.muted}>{p.knowledgeRef}</div>
            </div>
          ))}
        </section>

        <section className={styles.card}>
          <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>ERP Connectors (stub)</h2>
          <ul style={{ fontSize: 13, paddingLeft: 20 }}>
            <li>Coupa — connected (stub)</li>
            <li>SAP Ariba — available</li>
            <li>Jaggaer — available</li>
          </ul>
          <p className={styles.muted} style={{ marginTop: 12 }}>
            Coupa events: use listSourcingEvents() via @ai-pass/erp-connectors
          </p>
        </section>

        <section className={styles.card}>
          <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Scoring Templates</h2>
          <ul style={{ fontSize: 13, paddingLeft: 20 }}>
            <li>Balanced Procurement (default)</li>
            <li>Cost Focused (Power+)</li>
            <li>ESG Priority (Power+)</li>
          </ul>
        </section>

        <section className={styles.card}>
          <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Membership Gates</h2>
          <table className={styles.table}>
            <thead><tr><th>Feature</th><th>Free</th><th>Pro</th><th>Power</th><th>Enterprise</th></tr></thead>
            <tbody>
              <tr><td>Supply Chain AI</td><td>—</td><td><ModuleIcon name="check" size={14} /></td><td><ModuleIcon name="check" size={14} /></td><td><ModuleIcon name="check" size={14} /></td></tr>
              <tr><td>Advanced Scoring</td><td>—</td><td>—</td><td><ModuleIcon name="check" size={14} /></td><td><ModuleIcon name="check" size={14} /></td></tr>
              <tr><td>ERP Sync</td><td>—</td><td>—</td><td>—</td><td><ModuleIcon name="check" size={14} /></td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
