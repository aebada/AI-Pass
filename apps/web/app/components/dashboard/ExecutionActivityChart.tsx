'use client';

import { useMemo } from 'react';
import styles from './ExecutionActivityChart.module.css';
import { CHART_DATA, chartSummary, type ChartRange } from './dashboardData';

interface Props {
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
}

const RANGES: ChartRange[] = ['24h', '7D', '30D'];

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

export function ExecutionActivityChart({ range, onRangeChange }: Props) {
  const data = CHART_DATA[range];
  const summary = chartSummary(range);

  const { agentPath, govPath, agentArea, govArea, labels } = useMemo(() => {
    const w = 560;
    const h = 180;
    const padX = 8;
    const padY = 12;
    const maxVal = Math.max(...data.map((d) => Math.max(d.agentRuns, d.governanceChecks)), 1);
    const step = (w - padX * 2) / Math.max(data.length - 1, 1);

    const toY = (v: number) => h - padY - (v / maxVal) * (h - padY * 2);

    const agentPts = data.map((d, i) => ({ x: padX + i * step, y: toY(d.agentRuns) }));
    const govPts = data.map((d, i) => ({ x: padX + i * step, y: toY(d.governanceChecks) }));

    const baseY = h - padY;
    const agentLine = smoothPath(agentPts);
    const govLine = smoothPath(govPts);

    const agentAreaPath = `${agentLine} L ${agentPts[agentPts.length - 1].x} ${baseY} L ${agentPts[0].x} ${baseY} Z`;
    const govAreaPath = `${govLine} L ${govPts[govPts.length - 1].x} ${baseY} L ${govPts[0].x} ${baseY} Z`;

    return {
      agentPath: agentLine,
      govPath: govLine,
      agentArea: agentAreaPath,
      govArea: govAreaPath,
      labels: data.map((d) => d.label),
    };
  }, [data]);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Execution activity</h2>
          <p className={styles.subtitle}>Demo trend shown until log volume increases</p>
        </div>
        <div className={styles.toggle}>
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              className={`${styles.toggleBtn} ${range === r ? styles.toggleActive : ''}`}
              onClick={() => onRangeChange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrap}>
        <svg viewBox="0 0 560 180" className={styles.chart} aria-label="Execution activity chart">
          <defs>
            <linearGradient id="agentGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="govGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((pct) => (
            <line
              key={pct}
              x1="8"
              y1={12 + (180 - 24) * (1 - pct)}
              x2="552"
              y2={12 + (180 - 24) * (1 - pct)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}
          <path d={govArea} fill="url(#govGrad)" />
          <path d={agentArea} fill="url(#agentGrad)" />
          <path d={govPath} fill="none" stroke="#8b5cf6" strokeWidth="2" />
          <path d={agentPath} fill="none" stroke="#3b82f6" strokeWidth="2" />
        </svg>
        <div className={styles.xLabels}>
          {labels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.dotBlue} /> Agent runs
          </span>
          <span className={styles.legendItem}>
            <span className={styles.dotPurple} /> Governance checks
          </span>
        </div>
        <span className={styles.summary}>
          {summary.runs} runs · {summary.checks} checks · Max {summary.max}
        </span>
      </div>
    </section>
  );
}
