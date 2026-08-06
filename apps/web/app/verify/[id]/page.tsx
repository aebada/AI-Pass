import { getTrustEngine } from '@ai-pass/trust-engine';
import { Badge, Card } from '@ai-pass/ui';
import styles from '../../workspace/trust/trust.module.css';
import { SEED_VERIFICATION_IDS } from '@ai-pass/trust-engine';

export function generateStaticParams() {
  return Object.values(SEED_VERIFICATION_IDS).map((id) => ({ id }));
}

export default async function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const engine = getTrustEngine();
  const record = engine.verification.verify(id);

  if (!record) {
    return (
      <div className={styles.verifyPage}>
        <Card padding="lg">
          <h1>Verification not found</h1>
          <p>No certification record exists for ID: {id}</p>
        </Card>
      </div>
    );
  }

  const statusClass =
    record.publicStatus === 'active' ? styles.statusActive
      : record.publicStatus === 'expired' ? styles.statusExpired
        : styles.statusRevoked;

  return (
    <div className={styles.verifyPage}>
      <div className={styles.verifyHeader}>
        <div className={styles.verifyBadge}>AI-PASS<br />{record.certificationLevel?.toUpperCase() ?? 'CERT'}</div>
        <h1 style={{ margin: '0 0 8px' }}>{record.productName}</h1>
        <p style={{ opacity: 0.7, margin: 0 }}>{record.companyName}</p>
      </div>

      <Card padding="lg">
        <div className={styles.row}>
          <span>Status</span>
          <span className={statusClass} style={{ fontWeight: 600, textTransform: 'capitalize' }}>{record.publicStatus.replace('_', ' ')}</span>
        </div>
        <div className={styles.row}>
          <span>Trust score</span>
          <strong>{record.trustScore}/100</strong>
        </div>
        <div className={styles.row}>
          <span>Risk level</span>
          <Badge variant={record.riskLevel === 'high' ? 'warning' : 'outline'}>{record.riskLevel}</Badge>
        </div>
        <div className={styles.row}>
          <span>Certification</span>
          <Badge variant="success">{record.certificationLevel ?? record.certificationStatus}</Badge>
        </div>
        <div className={styles.row}>
          <span>Scope</span>
          <span style={{ fontSize: 13, maxWidth: 320, textAlign: 'right' }}>{record.scope}</span>
        </div>
        {record.validFrom && (
          <div className={styles.row}>
            <span>Valid from</span>
            <span>{new Date(record.validFrom).toLocaleDateString()}</span>
          </div>
        )}
        {record.validUntil && (
          <div className={styles.row}>
            <span>Valid until</span>
            <span>{new Date(record.validUntil).toLocaleDateString()}</span>
          </div>
        )}
        <div className={styles.row}>
          <span>Verification ID</span>
          <code>{record.verificationId}</code>
        </div>
      </Card>

      <p style={{ textAlign: 'center', fontSize: 12, opacity: 0.5, marginTop: 24 }}>
        AI-Pass Trust Engine — Enterprise certification for AI systems
      </p>
    </div>
  );
}
