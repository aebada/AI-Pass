import { defaultSupplyChainAIService, DEMO_TENANT_ID } from '@ai-pass/supply-chain-ai';
import styles from '../supply-chain-shell.module.css';

export default function EvidencePage() {
  const { evaluations } = defaultSupplyChainAIService.listEvaluations(DEMO_TENANT_ID);
  const evaluation = evaluations[0];
  const policies = defaultSupplyChainAIService.listPolicies(DEMO_TENANT_ID).policies;

  return (
    <div>
      <header className={styles.header}>
        <h1>Evidence Viewer</h1>
        <p className={styles.muted}>Citations, policy references, and rule evidence</p>
      </header>

      {evaluation ? (
        <div className={styles.grid2}>
          {evaluation.results.map((r) => (
            <section key={r.offerId} className={styles.card}>
              <h2 style={{ fontSize: 14, margin: '0 0 12px' }}>{r.supplierName}</h2>
              <div className={styles.kpiLabel}>Reasons</div>
              <ul style={{ fontSize: 13, paddingLeft: 20 }}>
                {r.reasons.map((reason, i) => <li key={i}>{reason}</li>)}
              </ul>
              <div className={styles.kpiLabel} style={{ marginTop: 12 }}>Rule Evidence</div>
              <ul style={{ fontSize: 12, paddingLeft: 20, color: 'var(--text-muted)' }}>
                {r.ruleResults.map((rr) => (
                  <li key={rr.ruleId}>{rr.ruleName}: {rr.message} ({rr.outcome})</li>
                ))}
              </ul>
              <div className={styles.kpiLabel} style={{ marginTop: 12 }}>Evidence IDs</div>
              <code style={{ fontSize: 11 }}>{r.evidenceIds.join(', ')}</code>
            </section>
          ))}

          <section className={styles.card}>
            <h2 style={{ fontSize: 14, margin: '0 0 12px' }}>Policy References</h2>
            {policies.map((p) => (
              <div key={p.id} style={{ marginBottom: 12, fontSize: 13 }}>
                <strong>{p.name}</strong> v{p.version}
                <p className={styles.muted}>{p.content.slice(0, 120)}…</p>
                <code style={{ fontSize: 11 }}>{p.knowledgeRef}</code>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <p className={styles.muted}>No evaluation evidence available.</p>
      )}
    </div>
  );
}
