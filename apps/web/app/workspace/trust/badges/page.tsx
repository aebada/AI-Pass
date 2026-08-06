'use client';

import { getTrustEngine, SEED_VERIFICATION_IDS } from '@ai-pass/trust-engine';
import { Badge, Card } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import styles from '../trust.module.css';

export default function BadgesPage() {
  const engine = getTrustEngine();
  const systems = engine.systems.list({ status: 'certified' });

  return (
    <WorkspaceLayoutClient title="Badge Management" subtitle="AI-Pass Certified badges, embed codes, and QR metadata">
      <Card padding="lg">
        {systems.map((sys) => {
          const cert = engine.certification.listBySystem(sys.id)[0];
          const badge = cert ? engine.badges.get(cert.verificationId) : undefined;
          return (
            <div key={sys.id} className={styles.row} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <strong>{sys.productName}</strong>
                {cert && <Badge variant="success">{cert.level}</Badge>}
              </div>
              {badge && (
                <>
                  <div dangerouslySetInnerHTML={{ __html: badge.svgStub }} />
                  <code style={{ fontSize: 11, wordBreak: 'break-all' }}>{badge.embedCodes.html}</code>
                  <span style={{ fontSize: 11 }}>Verify: {badge.verificationUrl}</span>
                </>
              )}
            </div>
          );
        })}
      </Card>

      <Card padding="md" style={{ marginTop: 16 }}>
        <h3 className={styles.sectionTitle}>Public verification examples</h3>
        {Object.entries(SEED_VERIFICATION_IDS).map(([key, id]) => (
          <div key={key} className={styles.row}>
            <span>{key}</span>
            <a href={`/verify/${id}`} style={{ fontSize: 12 }}>/verify/{id}</a>
          </div>
        ))}
      </Card>
    </WorkspaceLayoutClient>
  );
}
