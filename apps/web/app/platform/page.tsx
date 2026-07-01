import Link from 'next/link';
import { PLATFORM_MODULES, buildPlatformDashboard } from '@ai-pass/view';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0d1117',
    color: '#e6edf3',
    fontFamily: 'system-ui, sans-serif',
  } as React.CSSProperties,
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid #21262d',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 16,
    padding: 32,
  } as React.CSSProperties,
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    padding: 20,
    textDecoration: 'none',
    color: 'inherit',
    display: 'block',
  } as React.CSSProperties,
  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    color: '#8b949e',
    marginTop: 8,
  } as React.CSSProperties,
};

export default function PlatformDashboard() {
  const panels = buildPlatformDashboard();

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link href="/" style={{ color: '#58a6ff', textDecoration: 'none' }}>
          ← Business Home
        </Link>
        <h1 style={{ margin: 0, fontSize: 24 }}>AI-Pass Platform</h1>
      </header>

      <section style={{ padding: '16px 32px' }}>
        <h2 style={{ fontSize: 16, color: '#8b949e', marginBottom: 12 }}>Overview</h2>
        <div style={{ display: 'flex', gap: 24 }}>
          {panels.map((panel) => (
            <div
              key={panel.id}
              style={{
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 8,
                padding: 16,
                minWidth: 200,
              }}
            >
              <strong>{panel.title}</strong>
              {panel.metrics.map((m) => (
                <div key={m.label} style={styles.metric}>
                  <span>{m.label}</span>
                  <span>{m.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section style={styles.grid}>
        {PLATFORM_MODULES.filter((m) => m.id !== 'workspace').map((mod) => (
          <Link key={mod.id} href={mod.route} style={styles.card}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{mod.icon}</div>
            <strong style={{ fontSize: 18 }}>{mod.name}</strong>
            <p style={{ fontSize: 14, color: '#8b949e', margin: '8px 0' }}>{mod.description}</p>
            <span
              style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 12,
                background: mod.status === 'implemented' ? '#238636' : '#9e6a03',
              }}
            >
              {mod.status}
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
