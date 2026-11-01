import styles from './hero-graph.module.css';

/** Full-bleed knowledge-graph stage for the landing hero (decorative). */
export function HeroGraph() {
  return (
    <div className={styles.stage} aria-hidden>
      <div className={styles.grid} />
      <svg className={styles.svg} viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="hg-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5025d1" stopOpacity="0.15" />
            <stop offset="50%" stopColor="#673de6" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#00b090" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="hg-node" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#efe8ff" />
            <stop offset="100%" stopColor="#673de6" />
          </radialGradient>
          <filter id="hg-soft" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[
          [140, 120, 420, 180],
          [420, 180, 680, 110],
          [680, 110, 920, 200],
          [420, 180, 560, 320],
          [560, 320, 820, 360],
          [820, 360, 1040, 280],
          [280, 280, 560, 320],
          [920, 200, 1040, 280],
          [680, 110, 820, 360],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={`l${i}`}
            className={styles.edge}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#hg-line)"
            strokeWidth="2"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}

        {[
          { x: 140, y: 120, label: 'Lot VE-991' },
          { x: 420, y: 180, label: 'Sensor S-441' },
          { x: 680, y: 110, label: 'Bearing SKF' },
          { x: 560, y: 320, label: 'Rule R-17' },
          { x: 920, y: 200, label: 'Supplier DU-7' },
          { x: 820, y: 360, label: 'Line 3' },
          { x: 1040, y: 280, label: 'Audit path' },
          { x: 280, y: 280, label: 'Policy' },
        ].map((node, i) => (
          <g key={node.label} className={styles.node} style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
            <circle cx={node.x} cy={node.y} r="22" fill="url(#hg-node)" filter="url(#hg-soft)" />
            <circle cx={node.x} cy={node.y} r="8" fill="#5025d1" />
            <text x={node.x} y={node.y + 42} textAnchor="middle" className={styles.label}>
              {node.label}
            </text>
          </g>
        ))}
      </svg>
      <div className={styles.caption}>
        <span className={styles.pulse} />
        Live manufacturing twin · explainable hops
      </div>
    </div>
  );
}
