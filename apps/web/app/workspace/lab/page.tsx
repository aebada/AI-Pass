'use client';

import Link from 'next/link';
import { LAB_PRODUCTS } from '../../lab/lab-data';

export default function WorkspaceLabPage() {
  return (
    <div style={{ padding: '28px 24px', maxWidth: 960, margin: '0 auto' }}>
      <p style={{ color: 'var(--accent, #673de6)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 12 }}>
        Intelligence Lab
      </p>
      <h1 style={{ letterSpacing: '-0.03em', margin: '8px 0 12px' }}>Operate expert data inside the workspace</h1>
      <p style={{ color: 'var(--text-muted, #5b5b66)', lineHeight: 1.6, maxWidth: 560 }}>
        Flow, Realms, Cortex, Experts, and Robotics run as first-party AI-Pass capabilities. Open a
        product surface or jump to the public lab pages.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          marginTop: 28,
        }}
      >
        {LAB_PRODUCTS.map((product) => (
          <Link
            key={product.slug}
            href={product.href}
            style={{
              display: 'block',
              padding: 18,
              borderRadius: 16,
              border: '1px solid rgba(103, 61, 230, 0.16)',
              textDecoration: 'none',
              color: 'inherit',
              background: '#fff',
            }}
          >
            <strong style={{ display: 'block', marginBottom: 6 }}>{product.name}</strong>
            <span style={{ color: 'var(--text-muted, #5b5b66)', fontSize: 14, lineHeight: 1.45 }}>
              {product.tagline}
            </span>
          </Link>
        ))}
      </div>
      <p style={{ marginTop: 28 }}>
        <Link href="/lab" style={{ fontWeight: 700, color: 'var(--accent, #673de6)' }}>
          Open Intelligence Lab overview →
        </Link>
      </p>
    </div>
  );
}
