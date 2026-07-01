import Link from 'next/link';
import { BrandLogoLink } from './components/BrandLogoLink';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0d1117',
        color: '#e6edf3',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <BrandLogoLink maxWidth={280} />
      </div>
      <div style={{ fontSize: 64, marginBottom: 16 }}>404</div>
      <h1 style={{ fontSize: 24, margin: '0 0 8px' }}>Page not found</h1>
      <p style={{ color: '#8b949e', maxWidth: 420, marginBottom: 24 }}>
        This route does not exist on AI Pass. Try the home page, Solution Studio, or AI Pass Platform.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/"
          style={{
            padding: '10px 20px',
            background: '#238636',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Home
        </Link>
        <Link
          href="/studio"
          style={{
            padding: '10px 20px',
            background: '#21262d',
            color: '#e6edf3',
            borderRadius: 6,
            textDecoration: 'none',
            border: '1px solid #30363d',
          }}
        >
          Solution Studio
        </Link>
        <Link
          href="/ide"
          style={{
            padding: '10px 20px',
            background: '#21262d',
            color: '#e6edf3',
            borderRadius: 6,
            textDecoration: 'none',
            border: '1px solid #30363d',
          }}
        >
          AI Pass Platform
        </Link>
      </div>
    </div>
  );
}
