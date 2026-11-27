'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  GOLDEN_QUESTIONS,
  createHospitalTwinService,
  type CommandCenterSnapshot,
  type IntentAnswer,
  type RoleId,
  type ScenarioId,
} from '@ai-pass/hospital-twin';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './hospital-twin.module.css';

type Tab = 'executive' | 'capacity' | 'ed' | 'supply' | 'equipment' | 'staffing' | 'scenarios' | 'ask' | 'ontology';

const TAB_BOARD: Record<Exclude<Tab, 'scenarios' | 'ask' | 'ontology'>, string> = {
  executive: 'executive',
  capacity: 'capacity',
  ed: 'ed',
  supply: 'supply',
  equipment: 'equipment',
  staffing: 'staffing',
};

export default function HospitalTwinCommandCenterPage() {
  // Client-side singleton so static Hostinger export works without API routes
  const svc = useMemo(() => createHospitalTwinService(42), []);
  const [snap, setSnap] = useState<CommandCenterSnapshot>(() => svc.snapshot());
  const [tab, setTab] = useState<Tab>('executive');
  const [role, setRole] = useState<RoleId>('coo');
  const [question, setQuestion] = useState('Give me the hospital status right now.');
  const [answer, setAnswer] = useState<IntentAnswer | null>(null);
  const [msg, setMsg] = useState('');

  const refresh = () => setSnap(svc.snapshot());

  const runScenario = (id: ScenarioId) => {
    setSnap(svc.injectScenario(id));
    setMsg(`Scenario "${id}" injected — watch KPIs and alerts.`);
    setTab('executive');
  };

  const reset = () => {
    setSnap(svc.reset(42));
    setAnswer(null);
    setMsg('Reset to baseline seed 42.');
  };

  const ask = (q = question) => {
    const ans = svc.ask(q, role);
    setAnswer(ans);
    setQuestion(q);
    setTab('ask');
  };

  const boardId = tab in TAB_BOARD ? TAB_BOARD[tab as keyof typeof TAB_BOARD] : 'executive';
  const board = snap.boards.find((b) => b.id === boardId) ?? snap.boards[0];

  const tileClass = (status: string) =>
    status === 'critical'
      ? `${styles.tile} ${styles.tileStatusCritical}`
      : status === 'warn'
        ? `${styles.tile} ${styles.tileStatusWarn}`
        : `${styles.tile} ${styles.tileStatusOk}`;

  return (
    <WorkspaceLayoutClient
      title="Hospital System Twin"
      subtitle="Command Center — capacity, ED, supply, equipment, staffing (synthetic demo)"
    >
      <div className={styles.wrap}>
        <div className={styles.banner}>{snap.banner}</div>

        <section className={styles.hero}>
          <h2>{snap.site.name}</h2>
          <p>
            Sector pack <strong>{snap.pack.id}</strong> v{snap.pack.version} — operational twin for hospital
            leadership. Pseudonymous patients only. Not clinical decision support.
          </p>
          <div className={styles.metaRow}>
            <span className={styles.chip}>Sim clock {new Date(snap.simClock).toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })} Europe/Berlin</span>
            <span className={styles.chip}>Seed {snap.seed}</span>
            <span className={styles.chip}>{snap.stats.beds} beds</span>
            <span className={styles.chip}>{snap.stats.openAlerts} open alerts</span>
            {snap.activeScenario && <span className={styles.chip}>Scenario: {snap.activeScenario}</span>}
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.btnPrimary} onClick={() => ask('Give me the hospital status right now.')}>
              Ask overview
            </button>
            <button type="button" className={styles.btnGhost} onClick={() => runScenario('surge')}>
              Inject surge
            </button>
            <button type="button" className={styles.btnDanger} onClick={reset}>
              Reset baseline
            </button>
            <Link href="/hospital-twin" className={styles.btnGhost}>
              Marketing page
            </Link>
          </div>
          {msg && <p className={styles.answer}>{msg}</p>}
        </section>

        <div className={styles.tabs}>
          {(
            [
              ['executive', 'Executive'],
              ['capacity', 'Capacity'],
              ['ed', 'ED'],
              ['supply', 'Supply'],
              ['equipment', 'Equipment'],
              ['staffing', 'Staffing'],
              ['scenarios', 'Scenarios'],
              ['ask', 'Ask / Voice'],
              ['ontology', 'Ontology'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? styles.tabActive : styles.tab}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {tab !== 'scenarios' && tab !== 'ask' && tab !== 'ontology' && board && (
          <>
            <section className={styles.panel}>
              <h3>{board.name}</h3>
              <div className={styles.grid}>
                {board.tiles.map((t) => (
                  <div key={t.kpiId} className={tileClass(t.status)}>
                    <div className={styles.tileLabel}>{t.label}</div>
                    <div className={styles.tileValue}>
                      {t.value}
                      {t.unit === '%' ? '%' : t.unit ? ` ${t.unit}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className={styles.twoCol}>
              <section className={styles.panel}>
                <h3>Alerts</h3>
                <div className={styles.list}>
                  {(board.alerts.length ? board.alerts : snap.alerts).slice(0, 8).map((a) => (
                    <div
                      key={a.id}
                      className={`${styles.alert} ${a.severity === 'critical' ? styles.alertCritical : a.severity === 'warn' ? styles.alertWarn : ''}`}
                    >
                      <div className={styles.alertTitle}>
                        [{a.severity}] {a.title}
                      </div>
                      <p className={styles.alertBody}>{a.explanation}</p>
                    </div>
                  ))}
                  {snap.alerts.length === 0 && <p className={styles.alertBody}>No open alerts.</p>}
                </div>
              </section>

              <section className={styles.panel}>
                <h3>{tab === 'capacity' ? 'Bed grid' : tab === 'ed' ? 'ED census' : 'Notes & forecast'}</h3>
                {tab === 'capacity' ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Unit</th>
                        <th>Occ</th>
                        <th>Free</th>
                        <th>Clean</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snap.bedGrid.map((g) => (
                        <tr key={g.unitCode}>
                          <td>{g.unitCode}</td>
                          <td>
                            {g.occupied}/{g.staffed}
                          </td>
                          <td>{g.available}</td>
                          <td>{g.cleaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : tab === 'ed' ? (
                  <div className={styles.list}>
                    <p className={styles.alertBody}>Census {snap.edCensus.total} · Waiting {snap.edCensus.waiting} · Boarding {snap.edCensus.boarding}</p>
                    <p className={styles.alertBody}>
                      Triage:{' '}
                      {Object.entries(snap.edCensus.byTriage)
                        .map(([t, n]) => `L${t}=${n}`)
                        .join(' · ')}
                    </p>
                  </div>
                ) : (
                  <div className={styles.list}>
                    {board.notes.map((n) => (
                      <p key={n} className={styles.alertBody}>
                        {n}
                      </p>
                    ))}
                    {snap.forecasts.slice(0, 1).map((f) => (
                      <p key={f.id} className={styles.alertBody}>
                        {f.label}: next point {f.points[0]?.value}
                        {f.beatsSeasonalNaive ? ' (beats seasonal-naive)' : ''}
                      </p>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </>
        )}

        {tab === 'scenarios' && (
          <section className={styles.panel}>
            <h3>Scenario injector</h3>
            <p className={styles.alertBody} style={{ marginBottom: 12 }}>
              Deterministic seeds. Each scenario updates the twin through the same KPI/alert path as live connectors.
            </p>
            <div className={styles.scenarioGrid}>
              {snap.scenarios.map((s) => (
                <div key={s.id} className={styles.scenarioCard}>
                  <h4>{s.name}</h4>
                  <p>{s.description}</p>
                  <p>{s.expectedEffects.join(' · ')}</p>
                  <button type="button" className={styles.btnPrimary} onClick={() => runScenario(s.id)}>
                    Run
                  </button>
                </div>
              ))}
            </div>
            <h3 style={{ marginTop: 18 }}>Timeline</h3>
            <div className={styles.list}>
              {snap.scenarioTimeline.map((t, i) => (
                <p key={`${t.ts}-${i}`} className={styles.alertBody}>
                  {new Date(t.ts).toISOString()} — {t.event}
                </p>
              ))}
            </div>
          </section>
        )}

        {tab === 'ask' && (
          <section className={styles.panel}>
            <h3>Ask the twin (EN / AR / DE intents)</h3>
            <div className={styles.askRow}>
              <select className={styles.select} value={role} onChange={(e) => setRole(e.target.value as RoleId)} style={{ flex: '0 0 200px' }}>
                {snap.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input className={styles.input} value={question} onChange={(e) => setQuestion(e.target.value)} />
              <button type="button" className={styles.btnPrimary} onClick={() => ask()}>
                Ask
              </button>
            </div>
            {answer && (
              <div className={styles.answer}>
                <strong>{answer.refused ? 'Refused' : answer.intentId}</strong>
                <div>{answer.spokenSummary}</div>
                {answer.provenance[0] && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#5a6570' }}>
                    Provenance: {answer.provenance[0].sourceSystem} · {answer.provenance[0].metricVersion} ·{' '}
                    {answer.provenance[0].definition}
                  </div>
                )}
              </div>
            )}
            <h3 style={{ marginTop: 16 }}>Golden 30</h3>
            <div className={styles.list}>
              {GOLDEN_QUESTIONS.map((q) => (
                <button key={q.id} type="button" className={styles.btnGhost} onClick={() => ask(q.en)}>
                  {q.id}. {q.en}
                </button>
              ))}
            </div>
          </section>
        )}

        {tab === 'ontology' && (
          <section className={styles.panel}>
            <h3>Pack ontology & modules</h3>
            <p className={styles.alertBody}>
              {snap.ontologySummary.classes} classes · {snap.ontologySummary.relations} relations · Pilot modules:{' '}
              {snap.modulesEnabled.join(', ')}
            </p>
            <p className={styles.alertBody}>All modules: {snap.ontologySummary.modules.join(', ')}</p>
            <p className={styles.alertBody}>
              Stats: {snap.stats.encounters} encounters · {snap.stats.edVisits} ED visits · {snap.stats.equipment}{' '}
              equipment · {snap.stats.stockItems} stock items
            </p>
            <button type="button" className={styles.btnGhost} onClick={refresh}>
              Refresh KPIs
            </button>
          </section>
        )}
      </div>
    </WorkspaceLayoutClient>
  );
}
