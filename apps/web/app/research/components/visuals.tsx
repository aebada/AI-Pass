import Link from 'next/link';
import styles from '../research.module.css';
import {
  getEvidencePrinciples,
  getMetrics,
  getPhysicalStack,
  getPipelineCounts,
  getPrograms,
  getRisks,
  getRoadmap,
  getStageGates,
  getTestbedLadder,
  publicProjects,
  statusLabel,
} from '../../lib/hopn-lab';

function Conceptual() {
  return <span className={styles.conceptual}>Conceptual</span>;
}

function ViewTable({ caption, headers, rows }: { caption: string; headers: string[]; rows: string[][] }) {
  return (
    <details className={styles.details}>
      <summary>View as table</summary>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>{caption}</caption>
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function ArchitectureDiagram() {
  const programs = getPrograms();
  return (
    <figure className={styles.visual}>
      <Conceptual />
      <svg viewBox="0 0 720 280" role="img" aria-label="Research architecture: Foundation under Route, Ground and Assure, Physical beside them">
        <title>HOPN Lab architecture</title>
        <rect x="16" y="210" width="688" height="54" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" />
        <text x="360" y="242" textAnchor="middle" fontSize="16" fontWeight="700">Foundation: private and efficient AI</text>
        <a href="/research/route">
          <rect x="16" y="118" width="210" height="74" rx="10" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
          <text x="121" y="150" textAnchor="middle" fontSize="16" fontWeight="700">Route</text>
          <text x="121" y="172" textAnchor="middle" fontSize="12">Compose models</text>
        </a>
        <a href="/research/ground">
          <rect x="255" y="118" width="210" height="74" rx="10" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
          <text x="360" y="150" textAnchor="middle" fontSize="16" fontWeight="700">Ground</text>
          <text x="360" y="172" textAnchor="middle" fontSize="12">Prove the source</text>
        </a>
        <a href="/research/assure">
          <rect x="494" y="118" width="210" height="74" rx="10" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
          <text x="599" y="150" textAnchor="middle" fontSize="16" fontWeight="700">Assure</text>
          <text x="599" y="172" textAnchor="middle" fontSize="12">Check quality first</text>
        </a>
        <a href="/research/physical">
          <rect x="494" y="20" width="210" height="74" rx="10" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
          <text x="599" y="52" textAnchor="middle" fontSize="16" fontWeight="700">Physical</text>
          <text x="599" y="74" textAnchor="middle" fontSize="12">Same stack, real world</text>
        </a>
        <text x="16" y="42" fontSize="13" fill="var(--text-muted)">Click a block to open that program</text>
      </svg>
      <ViewTable
        caption="Architecture blocks"
        headers={['Program', 'Question', 'Direction']}
        rows={programs.map((p) => [p.name, p.question, p.direction])}
      />
    </figure>
  );
}

export function KnowledgeGraphVisual() {
  return (
    <figure className={styles.visual}>
      <span className={styles.conceptual}>Illustration</span>
      <svg viewBox="0 0 720 260" role="img" aria-label="Illustration of a provenance knowledge graph for an invoice">
        <title>Provenance knowledge graph</title>
        <line x1="160" y1="80" x2="320" y2="70" stroke="var(--border-strong)" />
        <line x1="160" y1="80" x2="320" y2="190" stroke="var(--border-strong)" />
        <line x1="320" y1="70" x2="520" y2="70" stroke="var(--border-strong)" />
        <line x1="320" y1="190" x2="520" y2="190" stroke="var(--border-strong)" />
        <line x1="520" y1="70" x2="520" y2="190" stroke="var(--border-strong)" />
        <rect x="40" y="48" width="140" height="64" rx="10" fill="var(--bg-elevated)" stroke="var(--accent)" />
        <text x="110" y="76" textAnchor="middle" fontSize="13" fontWeight="700">Invoice</text>
        <text x="110" y="96" textAnchor="middle" fontSize="11">INV-1042</text>
        <rect x="250" y="38" width="150" height="64" rx="10" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="325" y="66" textAnchor="middle" fontSize="13" fontWeight="700">Line item</text>
        <text x="325" y="86" textAnchor="middle" fontSize="11">Bearing SKF-6205</text>
        <rect x="250" y="158" width="150" height="64" rx="10" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="325" y="186" textAnchor="middle" fontSize="13" fontWeight="700">Supplier</text>
        <text x="325" y="206" textAnchor="middle" fontSize="11">Meridian GmbH</text>
        <rect x="450" y="38" width="190" height="64" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" />
        <text x="545" y="66" textAnchor="middle" fontSize="13" fontWeight="700">Evidence A</text>
        <text x="545" y="86" textAnchor="middle" fontSize="11">PDF pack, corroborated</text>
        <rect x="450" y="158" width="190" height="64" rx="10" fill="var(--accent-soft)" stroke="var(--accent)" />
        <text x="545" y="186" textAnchor="middle" fontSize="13" fontWeight="700">Evidence B</text>
        <text x="545" y="206" textAnchor="middle" fontSize="11">ERP export, corroborated</text>
      </svg>
      <ViewTable
        caption="Illustration nodes"
        headers={['Node', 'Role']}
        rows={[
          ['Invoice INV-1042', 'Case under review'],
          ['Line item', 'Fact extracted from the invoice'],
          ['Supplier', 'Linked entity'],
          ['Evidence A and B', 'Independent sources that corroborate the fact'],
        ]}
      />
    </figure>
  );
}

export function DataRevolutionVisual() {
  const steps = [
    ['Records', 'Messy files'],
    ['Extract', 'Check twice'],
    ['Graph', 'Keep sources'],
    ['Decide', 'Same in, same out'],
  ];
  return (
    <figure className={styles.visual}>
      <Conceptual />
      <svg viewBox="0 0 720 170" role="img" aria-label="Data path from messy records to a deterministic decision">
        <title>Data path for deterministic decisions</title>
        {steps.map(([title, sub], i) => {
          const x = 20 + i * 175;
          return (
            <g key={title}>
              <rect x={x} y="36" width="150" height="88" rx="12" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
              <text x={x + 75} y="74" textAnchor="middle" fontSize="15" fontWeight="700">{title}</text>
              <text x={x + 75} y="98" textAnchor="middle" fontSize="12">{sub}</text>
              {i < 3 ? (
                <polygon points={`${x + 158},80 ${x + 172},80 ${x + 165},70 ${x + 172},80 ${x + 165},90`} fill="var(--accent)" />
              ) : null}
            </g>
          );
        })}
      </svg>
      <ViewTable caption="Data path" headers={['Step', 'Meaning']} rows={steps} />
    </figure>
  );
}

export function DeterministicModelsVisual() {
  return (
    <figure className={styles.visual}>
      <Conceptual />
      <svg viewBox="0 0 720 200" role="img" aria-label="Probabilistic generation versus a graph-checked deterministic path">
        <title>Deterministic path versus sampling</title>
        <rect x="20" y="28" width="320" height="144" rx="12" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="180" y="58" textAnchor="middle" fontSize="15" fontWeight="700">Sampling path</text>
        <text x="180" y="86" textAnchor="middle" fontSize="12">Same prompt, different answers</text>
        <text x="180" y="108" textAnchor="middle" fontSize="12">Hard to audit</text>
        <text x="180" y="130" textAnchor="middle" fontSize="12">Useful for drafts</text>
        <rect x="380" y="28" width="320" height="144" rx="12" fill="var(--accent-soft)" stroke="var(--accent)" />
        <text x="540" y="58" textAnchor="middle" fontSize="15" fontWeight="700">Deterministic path</text>
        <text x="540" y="86" textAnchor="middle" fontSize="12">Facts from the graph</text>
        <text x="540" y="108" textAnchor="middle" fontSize="12">Contract check before ship</text>
        <text x="540" y="130" textAnchor="middle" fontSize="12">Same inputs, same decision</text>
      </svg>
      <ViewTable
        caption="Two model paths"
        headers={['Path', 'What it does']}
        rows={[
          ['Sampling', 'Generates varied text. Useful for drafts. Hard to audit.'],
          ['Deterministic', 'Uses graph facts and a quality contract. Same inputs, same decision.'],
        ]}
      />
    </figure>
  );
}

export function PipelineFlow() {
  const steps = ['Extract', 'Ground', 'Route', 'Assure', 'Learn'];
  return (
    <figure className={styles.visual}>
      <Conceptual />
      <svg viewBox="0 0 720 140" role="img" aria-label="End to end pipeline from extract to learn">
        <title>End-to-end pipeline</title>
        {steps.map((step, i) => (
          <g key={step}>
            <rect x={20 + i * 140} y="28" width="120" height="52" rx="10" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
            <text x={80 + i * 140} y="60" textAnchor="middle" fontSize="14" fontWeight="700">{step}</text>
          </g>
        ))}
        <path className={styles.flowDash} d="M40 110 H680" fill="none" stroke="var(--accent)" strokeWidth="2" />
        <text x="360" y="128" textAnchor="middle" fontSize="11">Learn feeds back into Route and Assure</text>
      </svg>
      <ViewTable caption="Pipeline steps" headers={['Step']} rows={steps.map((s) => [s])} />
    </figure>
  );
}

export function ProjectMatrix() {
  const programs = getPrograms();
  const projects = publicProjects();
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>Project to program mapping</caption>
        <thead>
          <tr>
            <th>Project</th>
            {programs.map((p) => (
              <th key={p.id}>{p.name}</th>
            ))}
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.name}>
              <td>{project.name}</td>
              {programs.map((p) => (
                <td key={p.id}>{project.programs.includes(p.id) ? 'Yes' : 'No'}</td>
              ))}
              <td>{project.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QualityCascade() {
  return (
    <figure className={styles.visual}>
      <Conceptual />
      <svg viewBox="0 0 720 220" role="img" aria-label="Quality cascade: cheap model, estimate, pass, escalate or abstain">
        <title>Quality cascade</title>
        <rect x="260" y="12" width="200" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="360" y="40" textAnchor="middle" fontSize="13" fontWeight="700">Cheap model first</text>
        <rect x="260" y="78" width="200" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="360" y="106" textAnchor="middle" fontSize="13" fontWeight="700">Quality estimate</text>
        <rect x="40" y="154" width="180" height="44" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" />
        <text x="130" y="182" textAnchor="middle" fontSize="13" fontWeight="700">Pass</text>
        <rect x="270" y="154" width="180" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="360" y="182" textAnchor="middle" fontSize="13" fontWeight="700">Escalate</text>
        <rect x="500" y="154" width="180" height="44" rx="8" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="590" y="182" textAnchor="middle" fontSize="13" fontWeight="700">Abstain</text>
      </svg>
      <ViewTable
        caption="Cascade decisions"
        headers={['Step', 'Outcome']}
        rows={[
          ['Cheap model', 'Draft answer'],
          ['Quality estimate', 'Compare to the contract'],
          ['Pass, escalate or abstain', 'Ship, try a stronger model, or refuse'],
        ]}
      />
    </figure>
  );
}

export function RoutingDiagram() {
  return (
    <figure className={styles.visual}>
      <Conceptual />
      <svg viewBox="0 0 720 200" role="img" aria-label="Routing: request, constraints, policy engine, provider">
        <title>Routing decision</title>
        <rect x="16" y="70" width="130" height="56" rx="8" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="81" y="104" textAnchor="middle" fontSize="13" fontWeight="700">Request</text>
        <rect x="180" y="20" width="170" height="160" rx="8" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="265" y="52" textAnchor="middle" fontSize="13" fontWeight="700">Constraints</text>
        <text x="265" y="78" textAnchor="middle" fontSize="12">Privacy</text>
        <text x="265" y="98" textAnchor="middle" fontSize="12">Jurisdiction</text>
        <text x="265" y="118" textAnchor="middle" fontSize="12">Cost</text>
        <text x="265" y="138" textAnchor="middle" fontSize="12">Latency</text>
        <rect x="390" y="70" width="150" height="56" rx="8" fill="var(--accent-soft)" stroke="var(--accent)" />
        <text x="465" y="104" textAnchor="middle" fontSize="13" fontWeight="700">Policy</text>
        <rect x="574" y="70" width="130" height="56" rx="8" fill="var(--bg-elevated)" stroke="var(--border-strong)" />
        <text x="639" y="104" textAnchor="middle" fontSize="13" fontWeight="700">Provider</text>
      </svg>
      <ViewTable
        caption="Routing flow"
        headers={['Stage']}
        rows={[['Request'], ['Constraints'], ['Policy engine'], ['Provider']]}
      />
    </figure>
  );
}

export function FrontierSchematic() {
  return (
    <figure className={styles.visual}>
      <Conceptual />
      <svg viewBox="0 0 720 240" role="img" aria-label="Empty chart of cost versus quality. Measurements pending.">
        <title>Target frontier, measurements pending</title>
        <line x1="70" y1="200" x2="680" y2="200" stroke="var(--text)" />
        <line x1="70" y1="200" x2="70" y2="24" stroke="var(--text)" />
        <text x="375" y="228" textAnchor="middle" fontSize="13">Cost per answer</text>
        <text x="24" y="120" fontSize="13" transform="rotate(-90 24 120)">Quality</text>
        <path d="M120 170 C 260 150, 400 90, 620 50" fill="none" stroke="var(--accent)" strokeDasharray="6 6" />
        <text x="400" y="70" fontSize="13" fontWeight="700">Target frontier</text>
        <text x="360" y="120" textAnchor="middle" fontSize="16" fontWeight="700">Measurements pending</text>
      </svg>
      <ViewTable
        caption="Frontier schematic"
        headers={['Axis', 'Status']}
        rows={[['Cost per answer', 'Pending'], ['Quality', 'Pending'], ['Plotted points', 'None yet']]}
      />
    </figure>
  );
}

export function TestbedLadder() {
  const steps = getTestbedLadder();
  return (
    <figure className={styles.visual}>
      <ol className={styles.list}>
        {steps.map((step, i) => (
          <li key={step.step}>
            {i + 1}. {step.step}: {step.tools} ({statusLabel(step.status)})
          </li>
        ))}
      </ol>
      <ViewTable
        caption="Testbed ladder"
        headers={['Step', 'Tools', 'Status']}
        rows={steps.map((s) => [s.step, s.tools, statusLabel(s.status)])}
      />
    </figure>
  );
}

export function StackMapping() {
  const rows = getPhysicalStack();
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Digital</th>
            <th>Physical</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.layer}>
              <td>{row.layer}</td>
              <td>{row.digital}</td>
              <td>{row.physical}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RoadmapGantt({ compact = false }: { compact?: boolean }) {
  const items = compact ? getRoadmap().slice(0, 5) : getRoadmap();
  return (
    <div className={styles.gantt}>
      {items.map((item) => {
        const left = `${(item.start_month / 12) * 100}%`;
        const width = `${(Math.max(item.end_month - item.start_month, 1) / 12) * 100}%`;
        return (
          <div className={styles.ganttRow} key={item.id}>
            <div>
              <strong>{item.label}</strong>
              <div>{statusLabel(item.status)}</div>
            </div>
            <div className={styles.ganttTrack} aria-hidden>
              <span className={styles.ganttBar} style={{ insetInlineStart: left, width }}>
                {item.start_month} to {item.end_month} mo
              </span>
            </div>
          </div>
        );
      })}
      <ViewTable
        caption="Roadmap"
        headers={['Item', 'Program', 'Months', 'Status']}
        rows={items.map((i) => [i.label, i.program, `${i.start_month} to ${i.end_month}`, statusLabel(i.status)])}
      />
    </div>
  );
}

export function StageGateFunnel() {
  const gates = getStageGates();
  const counts = getPipelineCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className={styles.funnel}>
      {total === 0 ? <p className={styles.lead}>No items in the publication pipeline yet.</p> : null}
      {gates.map((gate) => (
        <div className={styles.funnelStep} key={gate}>
          <span>{gate}</span>
          <strong>{counts[gate as keyof typeof counts] ?? 0}</strong>
        </div>
      ))}
    </div>
  );
}

export function MetricCards({ programId }: { programId: string }) {
  const metrics = getMetrics(programId);
  return (
    <div className={styles.metricGrid}>
      {metrics.map((m) => (
        <article className={styles.metricCard} key={m.name} title={m.definition}>
          <h3>{m.name}</h3>
          <p>{m.definition}</p>
          <p><strong>Value: Pending</strong></p>
        </article>
      ))}
    </div>
  );
}

export function RiskMap() {
  const risks = getRisks();
  const levels = ['low', 'medium', 'high'] as const;
  return (
    <div>
      <div className={styles.riskGrid}>
        {levels.slice().reverse().map((impact) =>
          levels.map((likelihood) => {
            const cell = risks.filter((r) => r.likelihood === likelihood && r.impact === impact);
            return (
              <div className={styles.riskCell} key={`${likelihood}-${impact}`}>
                <strong>
                  {likelihood} / {impact}
                </strong>
                {cell.map((r) => (
                  <div key={r.label}>{r.label}</div>
                ))}
              </div>
            );
          }),
        )}
      </div>
      <ViewTable
        caption="Risks"
        headers={['Risk', 'Likelihood', 'Impact', 'Mitigation']}
        rows={risks.map((r) => [r.label, r.likelihood, r.impact, r.mitigation])}
      />
    </div>
  );
}

export function EvidenceChecklist() {
  return (
    <ul className={styles.list}>
      {getEvidencePrinciples().map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ProgramCards() {
  return (
    <div className={styles.cardGrid}>
      {getPrograms().map((program) => (
        <article className={styles.card} key={program.id}>
          <span className={`${styles.badge} ${program.status === 'in_progress' ? styles.badgeProgress : styles.badgePlanned}`}>
            {statusLabel(program.status)}
          </span>
          <h3>
            {program.name} · Track {program.track}
          </h3>
          <p>{program.question}</p>
          <p style={{ marginTop: 8 }}>
            <Link href={`/research/${program.id}`}>Open {program.name}</Link>
          </p>
        </article>
      ))}
    </div>
  );
}
