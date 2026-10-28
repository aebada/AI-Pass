import styles from './landing-proof.module.css';

const STATS = [
  { label: 'Graph entities', value: '21', hint: 'in the manufacturing twin' },
  { label: 'Relationships', value: '26', hint: 'typed predicates' },
  { label: 'Answer hops', value: '5', hint: 'deterministic path' },
  { label: 'Policy rules', value: '6', hint: 'human-encoded' },
];

const BARS = [
  { label: 'With provenance', value: 94, color: '#5025d1' },
  { label: 'Role-filtered', value: 88, color: '#3b1aab' },
  { label: 'Black-box labels', value: 18, color: '#cfd0db' },
];

const ROLES = [
  { label: 'Quality', pct: 100, color: '#5025d1' },
  { label: 'Plant', pct: 72, color: '#673de6' },
  { label: 'Auditor', pct: 64, color: '#00b090' },
  { label: 'Operator', pct: 48, color: '#ff9f1a' },
];

export function LandingProof() {
  return (
    <div className={styles.wrap} aria-label="Product proof metrics">
      <div className={styles.stats}>
        {STATS.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
            <span className={styles.statHint}>{stat.hint}</span>
          </div>
        ))}
      </div>

      <div className={styles.charts}>
        <figure className={styles.chart}>
          <figcaption>Decisions you can audit</figcaption>
          <svg viewBox="0 0 360 180" role="img" aria-label="Bar chart of decision quality">
            {BARS.map((bar, index) => {
              const y = 28 + index * 48;
              const width = (bar.value / 100) * 240;
              return (
                <g key={bar.label}>
                  <text x="0" y={y + 14} fontSize="12" fill="#3f424c" fontFamily="Arial, Helvetica, sans-serif">
                    {bar.label}
                  </text>
                  <rect x="110" y={y} width="240" height="22" rx="6" fill="#f4f1ff" />
                  <rect x="110" y={y} width={width} height="22" rx="6" fill={bar.color}>
                    <animate attributeName="width" from="0" to={String(width)} dur="0.9s" fill="freeze" />
                  </rect>
                  <text
                    x={120 + width}
                    y={y + 15}
                    fontSize="12"
                    fontWeight="700"
                    fill="#16171a"
                    fontFamily="Arial, Helvetica, sans-serif"
                  >
                    {bar.value}%
                  </text>
                </g>
              );
            })}
          </svg>
        </figure>

        <figure className={styles.chart}>
          <figcaption>Role visibility on one graph</figcaption>
          <svg viewBox="0 0 360 180" role="img" aria-label="Role coverage chart">
            {ROLES.map((role, index) => {
              const cx = 55 + index * 85;
              const r = 28;
              const c = 2 * Math.PI * r;
              const dash = (role.pct / 100) * c;
              return (
                <g key={role.label}>
                  <circle cx={cx} cy="78" r={r} fill="none" stroke="#eee8ff" strokeWidth="8" />
                  <circle
                    cx={cx}
                    cy="78"
                    r={r}
                    fill="none"
                    stroke={role.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${c - dash}`}
                    transform={`rotate(-90 ${cx} 78)`}
                  />
                  <text
                    x={cx}
                    y="82"
                    textAnchor="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill="#16171a"
                    fontFamily="Arial, Helvetica, sans-serif"
                  >
                    {role.pct}%
                  </text>
                  <text
                    x={cx}
                    y="128"
                    textAnchor="middle"
                    fontSize="11"
                    fill="#3f424c"
                    fontFamily="Arial, Helvetica, sans-serif"
                  >
                    {role.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </figure>
      </div>

      <figure className={styles.pathChart}>
        <figcaption>Sample deterministic hop path · VE-991</figcaption>
        <svg viewBox="0 0 640 120" role="img" aria-label="Knowledge graph hop path">
          {[
            { x: 40, label: 'VE-991' },
            { x: 170, label: 'S-441' },
            { x: 300, label: 'SKF-6205' },
            { x: 430, label: 'DU-7' },
            { x: 560, label: 'Line 3' },
          ].map((node, index, arr) => (
            <g key={node.label}>
              {index < arr.length - 1 ? (
                <line
                  x1={node.x + 18}
                  y1="52"
                  x2={arr[index + 1].x - 18}
                  y2="52"
                  stroke="#5025d1"
                  strokeWidth="2.2"
                />
              ) : null}
              <circle cx={node.x} cy="52" r="16" fill="#673de6" stroke="#fff" strokeWidth="2" />
              <text
                x={node.x}
                y="88"
                textAnchor="middle"
                fontSize="12"
                fontWeight="700"
                fill="#16171a"
                fontFamily="Arial, Helvetica, sans-serif"
              >
                {node.label}
              </text>
            </g>
          ))}
          <text x="320" y="24" textAnchor="middle" fontSize="11" fill="#5c5f6b" fontFamily="Arial, Helvetica, sans-serif">
            observed_by → mounted_on → installed_on → located_at
          </text>
        </svg>
      </figure>
    </div>
  );
}
