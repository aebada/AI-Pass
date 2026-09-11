import { defaultSupplyChainAIService, DEMO_TENANT_ID } from '@ai-pass/supply-chain-ai';
import styles from '../supply-chain-shell.module.css';

export default function ComparisonPage() {
  const { evaluations } = defaultSupplyChainAIService.listEvaluations(DEMO_TENANT_ID);
  const evaluation = evaluations[0];
  const offers = evaluation
    ? defaultSupplyChainAIService.listOffers(evaluation.eventId)
    : [];

  return (
    <div>
      <header className={styles.header}>
        <h1>Supplier Comparison</h1>
        <p className={styles.muted}>Score breakdown, risk heatmap, compliance matrix, ranking</p>
      </header>

      {evaluation ? (
        <div className={styles.grid2}>
          <section className={styles.card}>
            <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Comparison Table</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Price</th>
                  <th>Delivery</th>
                  <th>Score</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                {evaluation.results.map((r) => {
                  const offer = offers.find((o) => o.id === r.offerId);
                  return (
                    <tr key={r.offerId}>
                      <td>{r.supplierName}</td>
                      <td>€{(offer?.totalPrice ?? 0).toLocaleString()}</td>
                      <td>{offer?.deliveryDays}d</td>
                      <td>{r.score}</td>
                      <td>#{r.rank}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className={styles.card}>
            <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Radar Chart (Analysis Studio stub)</h2>
            <div className={styles.chartStub}>
              <svg viewBox="0 0 200 200" width="200" height="200">
                <polygon
                  points="100,30 170,80 140,170 60,170 30,80"
                  fill="rgba(88,166,255,0.15)"
                  stroke="var(--accent)"
                  strokeWidth="1"
                />
                <text x="100" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="10">
                  Price · Delivery · Risk · Quality · ESG
                </text>
              </svg>
            </div>
          </section>

          <section className={styles.card}>
            <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Score Breakdown</h2>
            {evaluation.results[0]?.scores.map((s) => (
              <div key={s.dimension} style={{ marginBottom: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ textTransform: 'capitalize' }}>{s.dimension}</span>
                  <span>{s.weighted.toFixed(1)}</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg)', borderRadius: 2, marginTop: 4 }}>
                  <div style={{ width: `${s.raw}%`, height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </section>

          <section className={styles.card}>
            <h2 style={{ fontSize: 14, margin: '0 0 16px' }}>Risk Heatmap & Compliance Matrix</h2>
            <table className={styles.table}>
              <thead>
                <tr><th>Supplier</th><th>Risk</th><th>ISO 9001</th><th>Policy</th></tr>
              </thead>
              <tbody>
                {evaluation.results.map((r) => (
                  <tr key={r.offerId}>
                    <td>{r.supplierName}</td>
                    <td style={{ color: r.score < 50 ? 'var(--error)' : r.score < 70 ? 'var(--warning)' : 'var(--success)' }}>
                      {r.score < 50 ? 'High' : r.score < 70 ? 'Medium' : 'Low'}
                    </td>
                    <td>{r.ruleResults.find((rr) => rr.category === 'certs')?.outcome ?? '-'}</td>
                    <td>{r.ruleResults.find((rr) => rr.category === 'policy')?.outcome ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      ) : (
        <p className={styles.muted}>No evaluation data. Run an evaluation first.</p>
      )}
    </div>
  );
}
