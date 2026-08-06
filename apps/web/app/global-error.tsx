'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0f',
          color: '#e6edf3',
          fontFamily: 'system-ui, sans-serif',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>500</div>
        <h1 style={{ fontSize: 24, margin: '0 0 8px' }}>Something went wrong</h1>
        <p style={{ color: '#8b949e', maxWidth: 420, marginBottom: 24 }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
