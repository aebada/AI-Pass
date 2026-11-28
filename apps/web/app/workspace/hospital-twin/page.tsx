'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  GOLDEN_QUESTIONS,
  createHospitalTwinService,
  type CommandCenterSnapshot,
  type HospitalTwinService,
  type IntentAnswer,
  type RoleId,
  type ScenarioId,
} from '@ai-pass/hospital-twin';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './hospital-twin.module.css';

type Tab =
  | 'executive'
  | 'capacity'
  | 'ed'
  | 'supply'
  | 'equipment'
  | 'staffing'
  | 'twin'
  | 'scenarios'
  | 'ask'
  | 'ontology';

type ChatMsg = { id: string; role: 'user' | 'assistant'; text: string; refused?: boolean };

const TAB_BOARD: Record<Exclude<Tab, 'scenarios' | 'ask' | 'ontology' | 'twin'>, string> = {
  executive: 'executive',
  capacity: 'capacity',
  ed: 'ed',
  supply: 'supply',
  equipment: 'equipment',
  staffing: 'staffing',
};

type BootState =
  | { ok: true; svc: HospitalTwinService; snap: CommandCenterSnapshot }
  | { ok: false; error: string };

function bootTwin(seed = 42): BootState {
  try {
    const svc = createHospitalTwinService(seed);
    return { ok: true, svc, snap: svc.snapshot() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to boot hospital twin' };
  }
}

function bedClass(status: string): string {
  switch (status) {
    case 'available':
      return styles.bedAvailable;
    case 'occupied':
      return styles.bedOccupied;
    case 'cleaning':
      return styles.bedCleaning;
    case 'reserved':
      return styles.bedReserved;
    case 'blocked':
    case 'maintenance':
      return styles.bedBlocked;
    default:
      return styles.bedBlocked;
  }
}

function heatClass(pct: number): string {
  if (pct >= 95) return styles.heatCritical;
  if (pct >= 88) return styles.heatWarn;
  if (pct >= 75) return styles.heatBusy;
  return styles.heatOk;
}

export default function HospitalTwinCommandCenterPage() {
  const [boot] = useState(() => bootTwin(42));
  const svc = boot.ok ? boot.svc : null;
  const [snap, setSnap] = useState<CommandCenterSnapshot | null>(() => (boot.ok ? boot.snap : null));
  const [tab, setTab] = useState<Tab>('twin');
  const [role, setRole] = useState<RoleId>('coo');
  const [question, setQuestion] = useState('Give me the hospital status right now.');
  const [answer, setAnswer] = useState<IntentAnswer | null>(null);
  const [msg, setMsg] = useState('');
  const [floorFilter, setFloorFilter] = useState<number | 'all'>('all');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [screenOnly, setScreenOnly] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [wallMode, setWallMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [chat, setChat] = useState<ChatMsg[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hospital Twin ready. Hold the mic and ask for status, ED waiting, free ICU beds, or stock risk — or type below.',
    },
  ]);
  const recognitionRef = useRef<{ stop: () => void; abort?: () => void } | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    setSpeechSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
    setTtsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('tab');
      if (t === 'ask' || t === 'twin' || t === 'executive' || t === 'scenarios') setTab(t);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat, tab]);

  const boardId = tab in TAB_BOARD ? TAB_BOARD[tab as keyof typeof TAB_BOARD] : 'executive';
  const board = useMemo(
    () => snap?.boards.find((b) => b.id === boardId) ?? snap?.boards[0],
    [snap, boardId],
  );

  const twinUnits = useMemo(() => {
    if (!snap) return [];
    return floorFilter === 'all'
      ? snap.twinVisuals.units
      : snap.twinVisuals.units.filter((u) => u.floor === floorFilter);
  }, [snap, floorFilter]);

  const selected = useMemo(
    () => snap?.twinVisuals.units.find((u) => u.unitCode === selectedUnit) ?? null,
    [snap, selectedUnit],
  );

  if (!boot.ok || !svc || !snap) {
    return (
      <WorkspaceLayoutClient title="Hospital Twin" subtitle="Command Center failed to load">
        <div className={styles.wrap}>
          <div className={styles.banner}>
            Could not start the twin: {boot.ok ? 'unknown error' : boot.error}
          </div>
          <a className={styles.btnPrimary} href="/workspace/hospital-twin/">
            Retry
          </a>
        </div>
      </WorkspaceLayoutClient>
    );
  }

  const speak = (text: string) => {
    if (screenOnly || !ttsSupported) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1;
      utter.pitch = 1;
      window.speechSynthesis.speak(utter);
    } catch {
      /* ignore */
    }
  };

  const stopSpeak = () => {
    if (ttsSupported) window.speechSynthesis.cancel();
  };

  const ask = (q = question, opts?: { fromVoice?: boolean }) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const ans = svc.ask(trimmed, role);
    setAnswer(ans);
    setQuestion(trimmed);
    setChat((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'user', text: trimmed },
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: ans.spokenSummary,
        refused: ans.refused,
      },
    ]);
    if (ans.boardId && ans.boardId in TAB_BOARD) {
      setTab(ans.boardId as Tab);
    } else {
      setTab('ask');
    }
    if (opts?.fromVoice || !screenOnly) speak(ans.spokenSummary);
  };

  const runScenario = (id: ScenarioId) => {
    setSnap(svc.injectScenario(id));
    setMsg(`Scenario "${id}" injected — watch twin map, KPIs and alerts.`);
    setTab('twin');
  };

  const reset = () => {
    setSnap(svc.reset(42));
    setAnswer(null);
    setMsg('Reset to baseline seed 42.');
    setSelectedUnit(null);
  };

  const startListening = () => {
    stopSpeak();
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setVoiceNote('Speech recognition unavailable in this browser — type your question instead.');
      setTab('ask');
      return;
    }
    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    setListening(true);
    setVoiceNote('Listening… speak now.');
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript ?? '';
      }
      const finalText = transcript.trim();
      if (finalText) {
        setQuestion(finalText);
        if (event.results[event.results.length - 1]?.isFinal) {
          ask(finalText, { fromVoice: true });
          setVoiceNote(`Heard: “${finalText}”`);
        }
      }
    };
    recognition.onerror = () => {
      setListening(false);
      setVoiceNote('Mic error — check browser permission, or type instead.');
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    try {
      recognition.start();
    } catch {
      setListening(false);
      setVoiceNote('Could not start microphone.');
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const tileClass = (status: string) =>
    status === 'critical'
      ? `${styles.tile} ${styles.tileStatusCritical}`
      : status === 'warn'
        ? `${styles.tile} ${styles.tileStatusWarn}`
        : `${styles.tile} ${styles.tileStatusOk}`;

  const maxOcc = Math.max(...snap.twinVisuals.occupancyTrend.map((p) => p.high), 1);
  const maxArr = Math.max(...snap.twinVisuals.edArrivalTrend.map((p) => p.value), 1);

  return (
    <WorkspaceLayoutClient
      title="Hospital System Twin"
      subtitle="Command Center — digital twin visuals, voice chatbot, capacity, ED, supply (synthetic demo)"
    >
      <div className={styles.wrap} dir={rtl ? 'rtl' : 'ltr'}>
        <div className={styles.banner}>{snap.banner}</div>

        <section className={styles.hero}>
          <h2>{snap.site.name}</h2>
          <p>
            Sector pack <strong>{snap.pack.id}</strong> v{snap.pack.version} — live digital twin of beds,
            floors, equipment and forecasts. Talk to the twin by mic or text. Not clinical decision support.
          </p>
          <div className={styles.metaRow}>
            <span className={styles.chip}>
              Sim clock{' '}
              {new Date(snap.simClock).toLocaleString('en-GB', { timeZone: 'Europe/Berlin' })} Europe/Berlin
            </span>
            <span className={styles.chip}>Seed {snap.seed}</span>
            <span className={styles.chip}>{snap.stats.beds} beds</span>
            <span className={styles.chip}>{snap.stats.openAlerts} open alerts</span>
            {snap.activeScenario && <span className={styles.chip}>Scenario: {snap.activeScenario}</span>}
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => {
                setTab('ask');
                ask('Give me the hospital status right now.');
              }}
            >
              Ask overview
            </button>
            <button
              type="button"
              className={listening ? styles.btnDanger : styles.btnPrimary}
              onClick={() => (listening ? stopListening() : startListening())}
              aria-pressed={listening}
            >
              {listening ? 'Stop mic' : 'Hold / tap mic'}
            </button>
            <button type="button" className={styles.btnGhost} onClick={() => setTab('twin')}>
              Twin map
            </button>
            <button type="button" className={styles.btnGhost} onClick={() => setRtl((v) => !v)} aria-pressed={rtl}>
              {rtl ? 'LTR' : 'RTL'} Arabic
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => {
                setWallMode((v) => !v);
                setTab('executive');
              }}
              aria-pressed={wallMode}
            >
              {wallMode ? 'Exit wall' : 'Wall display'}
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              onClick={() => {
                const ticket = svc.reportWrongNumber(question || answer?.spokenSummary || 'unspecified', role);
                setMsg(`Report wrong number filed as ${ticket.ticketId} (audit trail).`);
              }}
            >
              Report wrong number
            </button>
            <button type="button" className={styles.btnGhost} onClick={() => runScenario('surge')}>
              Inject surge
            </button>
            <button type="button" className={styles.btnDanger} onClick={reset}>
              Reset baseline
            </button>
            <a href="/hospital-twin/" className={styles.btnGhost}>
              Product overview
            </a>
          </div>
          {msg && <p className={styles.answer}>{msg}</p>}
          {voiceNote && <p className={styles.voiceNote}>{voiceNote}</p>}
        </section>

        <div className={styles.tabs}>
          {(
            [
              ['twin', 'Twin map'],
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

        {tab === 'twin' && (
          <>
            <section className={styles.panel}>
              <div className={styles.twinHeader}>
                <h3>Digital twin — floors & bed states</h3>
                <div className={styles.floorRow}>
                  <button
                    type="button"
                    className={floorFilter === 'all' ? styles.tabActive : styles.tab}
                    onClick={() => setFloorFilter('all')}
                  >
                    All floors
                  </button>
                  {snap.twinVisuals.floors.map((f) => (
                    <button
                      key={f}
                      type="button"
                      className={floorFilter === f ? styles.tabActive : styles.tab}
                      onClick={() => setFloorFilter(f)}
                    >
                      Floor {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.legend}>
                <span>
                  <i className={`${styles.legendSwatch} ${styles.bedAvailable}`} /> Available
                </span>
                <span>
                  <i className={`${styles.legendSwatch} ${styles.bedOccupied}`} /> Occupied
                </span>
                <span>
                  <i className={`${styles.legendSwatch} ${styles.bedCleaning}`} /> Cleaning
                </span>
                <span>
                  <i className={`${styles.legendSwatch} ${styles.bedReserved}`} /> Reserved
                </span>
                <span>
                  <i className={`${styles.legendSwatch} ${styles.bedBlocked}`} /> Blocked / maint.
                </span>
              </div>
              <div className={styles.floorMap}>
                {twinUnits.map((u) => (
                  <button
                    key={u.unitId}
                    type="button"
                    className={`${styles.unitCard} ${heatClass(u.occupancyPct)} ${
                      selectedUnit === u.unitCode ? styles.unitSelected : ''
                    }`}
                    onClick={() => setSelectedUnit(u.unitCode)}
                  >
                    <div className={styles.unitTop}>
                      <strong>{u.unitCode}</strong>
                      <span>
                        F{u.floor} · {u.occupancyPct}%
                      </span>
                    </div>
                    <div className={styles.unitName}>{u.unitName}</div>
                    <div className={styles.bedGridViz}>
                      {u.beds.slice(0, 48).map((b) => (
                        <span
                          key={b.id}
                          className={`${styles.bedCell} ${bedClass(b.status)}`}
                          title={`${b.code}: ${b.status}`}
                        />
                      ))}
                    </div>
                    {u.alertCount > 0 && (
                      <div className={styles.unitAlert}>{u.alertCount} alert(s)</div>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <div className={styles.twoCol}>
              <section className={styles.panel}>
                <h3>{selected ? `${selected.unitCode} bed detail` : 'Select a unit'}</h3>
                {selected ? (
                  <>
                    <p className={styles.alertBody}>
                      {selected.unitName} · floor {selected.floor} · {selected.beds.length} beds · occupancy{' '}
                      {selected.occupancyPct}%
                    </p>
                    <div className={styles.bedGridLarge}>
                      {selected.beds.map((b) => (
                        <div key={b.id} className={`${styles.bedChip} ${bedClass(b.status)}`}>
                          {b.code.split('-').pop()}
                          <small>{b.status}</small>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className={styles.alertBody}>Click a unit on the twin map to drill into every bed.</p>
                )}
              </section>

              <section className={styles.panel}>
                <h3>Forecast bands</h3>
                <p className={styles.chartLabel}>Occupancy next 24h (with interval)</p>
                <div className={styles.chart}>
                  {snap.twinVisuals.occupancyTrend.map((p) => (
                    <div key={p.label} className={styles.barWrap} title={`${p.value}% (${p.low}–${p.high})`}>
                      <div className={styles.barBand} style={{ height: `${(p.high / maxOcc) * 100}%` }} />
                      <div className={styles.bar} style={{ height: `${(p.value / maxOcc) * 100}%` }} />
                    </div>
                  ))}
                </div>
                <p className={styles.chartLabel}>ED arrivals next 24h</p>
                <div className={styles.chart}>
                  {snap.twinVisuals.edArrivalTrend.map((p) => (
                    <div key={p.label} className={styles.barWrap} title={`${p.value} arrivals`}>
                      <div className={styles.barEd} style={{ height: `${(p.value / maxArr) * 100}%` }} />
                    </div>
                  ))}
                </div>
                <h3 style={{ marginTop: 14 }}>Critical equipment</h3>
                <div className={styles.list}>
                  {snap.twinVisuals.equipment
                    .filter((e) => e.status !== 'working')
                    .slice(0, 8)
                    .map((e) => (
                      <p key={e.id} className={styles.alertBody}>
                        [{e.status}] {e.code} ({e.equipmentType}) · {e.unitCode} · floor {e.floor}
                      </p>
                    ))}
                  {snap.twinVisuals.equipment.every((e) => e.status === 'working') && (
                    <p className={styles.alertBody}>All tracked equipment working.</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}

        {tab !== 'scenarios' && tab !== 'ask' && tab !== 'ontology' && tab !== 'twin' && board && (
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
                    <p className={styles.alertBody}>
                      Census {snap.edCensus.total} · Waiting {snap.edCensus.waiting} · Boarding{' '}
                      {snap.edCensus.boarding}
                    </p>
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
              Deterministic seeds. Each scenario updates the twin through the same KPI/alert path as live
              connectors.
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
          </section>
        )}

        {tab === 'ask' && (
          <section className={styles.panel}>
            <div className={styles.chatHeader}>
              <h3>Voice chatbot</h3>
              <div className={styles.chatControls}>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={screenOnly}
                    onChange={(e) => {
                      setScreenOnly(e.target.checked);
                      if (e.target.checked) stopSpeak();
                    }}
                  />
                  Screen only (no sound)
                </label>
                <button type="button" className={styles.btnGhost} onClick={stopSpeak}>
                  Stop speaking
                </button>
              </div>
            </div>
            {!speechSupported && (
              <p className={styles.voiceNote}>
                Voice input is not available in this browser. Typed chat still works; answers can play with
                sound where TTS is supported ({ttsSupported ? 'TTS ready' : 'TTS unavailable'}).
              </p>
            )}
            <div className={styles.chatWindow} aria-live="polite">
              {chat.map((m) => (
                <div
                  key={m.id}
                  className={m.role === 'user' ? styles.chatUser : styles.chatBot}
                  data-refused={m.refused ? '1' : undefined}
                >
                  <span className={styles.chatRole}>{m.role === 'user' ? 'You' : 'Twin'}</span>
                  <p>{m.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className={styles.askRow}>
              <select
                className={styles.select}
                value={role}
                onChange={(e) => setRole(e.target.value as RoleId)}
                style={{ flex: '0 0 180px' }}
                aria-label="Role"
              >
                {snap.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                className={styles.input}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') ask();
                }}
                aria-label="Question"
                placeholder="Ask the twin…"
              />
              <button
                type="button"
                className={listening ? styles.btnDanger : styles.btnGhost}
                onClick={() => (listening ? stopListening() : startListening())}
                aria-label={listening ? 'Stop microphone' : 'Start microphone'}
              >
                {listening ? 'Listening…' : '🎤 Talk'}
              </button>
              <button type="button" className={styles.btnPrimary} onClick={() => ask()}>
                Send
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
              {snap.ontologySummary.classes} classes · {snap.ontologySummary.relations} relations · Pilot
              modules: {snap.modulesEnabled.join(', ')}
            </p>
            <p className={styles.alertBody}>All modules: {snap.ontologySummary.modules.join(', ')}</p>
            <button type="button" className={styles.btnGhost} onClick={() => setSnap(svc.snapshot())}>
              Refresh KPIs
            </button>
          </section>
        )}
      </div>
    </WorkspaceLayoutClient>
  );
}

/** Minimal SpeechRecognition typings for browsers that expose the API. */
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }>;
}
