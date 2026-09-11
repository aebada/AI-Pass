import Link from 'next/link';
import styles from '../../page.module.css';

const VALUE_BULLETS = [
  'Validated',
  'Stress-tested',
  'Risk-assessed',
  'Certified',
  'Continuously monitored',
  'Audited',
];

const FLOW_STEPS = [
  'Submit AI System',
  'Automated Validation',
  'Risk Assessment',
  'Compliance Check',
  'Performance Testing',
  'Trust Score',
  'Certification',
  'Continuous Monitoring',
];

const WHAT_WE_TEST = [
  { icon: '⚡', label: 'Reliability' },
  { icon: '🔍', label: 'Explainability' },
  { icon: '🧠', label: 'Hallucination Detection' },
  { icon: '🔒', label: 'Security' },
  { icon: '📋', label: 'Compliance' },
  { icon: '⚖️', label: 'Bias' },
  { icon: '📈', label: 'Performance' },
  { icon: '🏛️', label: 'Governance' },
  { icon: '👤', label: 'Human Oversight' },
  { icon: '📉', label: 'Model Drift' },
];

const ENTERPRISE_BENEFITS = [
  { icon: '🛡️', title: 'Reduce AI risk', text: 'Catch failures before they reach production or customers.' },
  { icon: '⚡', title: 'Accelerate procurement', text: 'Pre-certified AI passes vendor review faster.' },
  { icon: '🤝', title: 'Increase customer trust', text: 'Display verifiable certification badges publicly.' },
  { icon: '📜', title: 'Support compliance', text: 'Map tests to GDPR, EU AI Act, SOC 2, and more.' },
  { icon: '🏆', title: 'Win enterprise deals', text: 'Prove AI readiness to security and legal teams.' },
  { icon: '📂', title: 'Audit-ready', text: 'Full audit trails and downloadable reports.' },
  { icon: '🔄', title: 'Continuous monitoring', text: 'Detect drift and risk after deployment.' },
];

const INDUSTRIES = [
  'Finance',
  'Healthcare',
  'Government',
  'Insurance',
  'Automotive',
  'Manufacturing',
  'Public Sector',
];

const INTEGRATIONS = [
  { icon: '🧾', name: 'Invoice AI', href: '/workspace/apps/invoice-ai' },
  { icon: '👥', name: 'HR AI', href: '/workspace/apps' },
  { icon: '📦', name: 'Supply Chain', href: '/workspace/apps/supply-chain-ai' },
  { icon: '💬', name: 'Customer Support', href: '/workspace/apps/customer-support-ai' },
  { icon: '🏪', name: 'Marketplace Apps', href: '/workspace/store' },
  { icon: '🤖', name: 'Agent Studio', href: '/workspace/agents' },
  { icon: '⚙️', name: 'Workflow Engine', href: '/workspace/workflows' },
];

const CERT_LEVELS = [
  {
    tier: 'Bronze',
    tierClass: styles.tierBronze,
    validation: 'Basic functional tests',
    monitoring: 'Monthly checks',
    compliance: 'Self-attestation',
    readiness: 'Pilot deployments',
  },
  {
    tier: 'Silver',
    tierClass: styles.tierSilver,
    validation: 'Extended test suite',
    monitoring: 'Weekly scans',
    compliance: 'Framework mapping',
    readiness: 'Department rollout',
  },
  {
    tier: 'Gold',
    tierClass: styles.tierGold,
    validation: 'Full validation pipeline',
    monitoring: 'Real-time alerts',
    compliance: 'Audited controls',
    readiness: 'Enterprise production',
    featured: true,
  },
  {
    tier: 'Platinum',
    tierClass: styles.tierPlatinum,
    validation: 'Custom enterprise suite',
    monitoring: '24/7 SOC integration',
    compliance: 'Regulatory attestation',
    readiness: 'Mission-critical AI',
  },
];

const MONITORING_FLOW = [
  'AI Running',
  'Trust Engine',
  'Drift Detection',
  'Risk Monitoring',
  'Alert',
  'Re-certification',
];

export function TrustLayerSection() {
  return (
    <section className={styles.trustLayer} id="trust-layer">
      <div className={styles.trustLayerGlow} aria-hidden />

      <div className={styles.trustLayerInner}>
        <div className={styles.trustLayerHeader}>
          <span className={styles.trustLayerLabel}>AI-Pass Trust Layer</span>
          <h2 className={styles.trustLayerTitle}>Trust Your AI Before You Deploy It</h2>
          <p className={styles.trustLayerSub}>
            AI-Pass Trust Engine validates, certifies, monitors, and continuously verifies AI systems
            before they make business-critical decisions.
          </p>
          <div className={styles.trustValueBullets}>
            {VALUE_BULLETS.map((b) => (
              <span key={b} className={styles.trustValueBullet}>
                <span className={styles.trustValueCheck}>✓</span>
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.trustHeroGrid}>
          <div className={styles.certBadgeMock}>
            <div className={styles.certBadgeGlow} aria-hidden />
            <div className={styles.certBadgeInner}>
              <div className={styles.certBadgeSeal}>🛡️</div>
              <div className={styles.certBadgeTitle}>AI-PASS CERTIFIED</div>
              <div className={styles.certBadgeStars}>★★★★★</div>
              <div className={styles.certBadgeLevel}>Gold Certification</div>
              <div className={styles.certBadgeScore}>
                Trust Score <strong>96%</strong>
              </div>
              <div className={styles.certBadgeExpiry}>Verified until: 12 March 2027</div>
            </div>
            <div className={styles.tierPills}>
              <span className={`${styles.tierPill} ${styles.tierBronze}`}>Bronze</span>
              <span className={`${styles.tierPill} ${styles.tierSilver}`}>Silver</span>
              <span className={`${styles.tierPill} ${styles.tierGold} ${styles.tierPillActive}`}>Gold</span>
              <span className={`${styles.tierPill} ${styles.tierPlatinum}`}>Platinum</span>
            </div>
          </div>

          <div className={styles.trustFlow}>
            <h3 className={styles.trustSubheading}>Certification Pipeline</h3>
            <ol className={styles.trustFlowSteps}>
              {FLOW_STEPS.map((step, i) => (
                <li key={step} className={styles.trustFlowStep}>
                  <span className={styles.trustFlowNum}>{i + 1}</span>
                  <span className={styles.trustFlowLabel}>{step}</span>
                  {i < FLOW_STEPS.length - 1 && <span className={styles.trustFlowArrow} aria-hidden>↓</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className={styles.trustBlock}>
          <h3 className={styles.trustSubheading}>What We Test</h3>
          <div className={styles.trustTestGrid}>
            {WHAT_WE_TEST.map((item) => (
              <div key={item.label} className={styles.trustTestCard}>
                <span className={styles.trustTestIcon}>{item.icon}</span>
                <span className={styles.trustTestLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.trustBlock}>
          <h3 className={styles.trustSubheading}>Trust Dashboard</h3>
          <div className={styles.trustDashboardMock}>
            <div className={styles.trustDashBar}>
              <span className={styles.trustDashDot} />
              <span className={styles.trustDashDot} />
              <span className={styles.trustDashDot} />
              <span className={styles.trustDashTitle}>Trust Engine - Live Overview</span>
            </div>
            <div className={styles.trustDashBody}>
              <div className={styles.trustDashMetric}>
                <span className={styles.trustDashMetricLabel}>Trust Score</span>
                <span className={`${styles.trustDashMetricValue} ${styles.trustDashGold}`}>96</span>
                <div className={styles.trustDashBar2}><div className={styles.trustDashBarFill} style={{ width: '96%' }} /></div>
              </div>
              <div className={styles.trustDashMetric}>
                <span className={styles.trustDashMetricLabel}>AI Risk</span>
                <span className={styles.trustDashMetricValue}>Low</span>
                <span className={styles.trustDashBadgeGreen}>Within tolerance</span>
              </div>
              <div className={styles.trustDashMetric}>
                <span className={styles.trustDashMetricLabel}>Certification</span>
                <span className={styles.trustDashBadgeGold}>Gold - Active</span>
              </div>
              <div className={styles.trustDashMetric}>
                <span className={styles.trustDashMetricLabel}>Monitoring</span>
                <span className={styles.trustDashMetricValue}>24/7</span>
                <span className={styles.trustDashBadgeGreen}>All systems nominal</span>
              </div>
              <div className={styles.trustDashAlerts}>
                <span className={styles.trustDashMetricLabel}>Alerts</span>
                <div className={styles.trustDashAlertRow}>
                  <span className={styles.trustDashAlertWarn}>⚠ Drift detected - Model v2.3</span>
                  <span className={styles.trustDashAlertOk}>✓ Compliance scan passed</span>
                </div>
              </div>
              <div className={styles.trustDashRecs}>
                <span className={styles.trustDashMetricLabel}>Recommendations</span>
                <ul>
                  <li>Schedule re-validation after model update</li>
                  <li>Review bias metrics for new data source</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.trustBlock}>
          <h3 className={styles.trustSubheading}>Public Verification</h3>
          <div className={styles.trustVerifyGrid}>
            <div className={styles.trustVerifyFeatures}>
              {['Certification Badge', 'Verification URL', 'QR Code', 'Public Certificate', 'Audit Report', 'Verification API'].map((f) => (
                <div key={f} className={styles.trustVerifyFeature}>
                  <span className={styles.trustVerifyFeatureIcon}>✓</span>
                  {f}
                </div>
              ))}
            </div>
            <Link href="/verify/AIP-INV2026" className={styles.trustVerifyCard}>
              <div className={styles.trustVerifyCardBadge}>🛡️ GOLD</div>
              <h4 className={styles.trustVerifyCardTitle}>Verify SAP Invoice AI</h4>
              <div className={styles.trustVerifyCardMeta}>
                <span className={styles.trustVerifyCardStatus}>Certified</span>
                <span>Valid until June 2027</span>
              </div>
              <span className={styles.trustVerifyCardLink}>View public certificate →</span>
            </Link>
          </div>
        </div>

        <div className={styles.trustBlock}>
          <h3 className={styles.trustSubheading}>Why Enterprises Care</h3>
          <div className={styles.trustBenefitsGrid}>
            {ENTERPRISE_BENEFITS.map((b) => (
              <div key={b.title} className={styles.trustBenefitCard}>
                <span className={styles.trustBenefitIcon}>{b.icon}</span>
                <h4 className={styles.trustBenefitTitle}>{b.title}</h4>
                <p className={styles.trustBenefitText}>{b.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.trustBlock} id="trust-stories">
          <h3 className={styles.trustSubheading}>Industry Examples</h3>
          <div className={styles.trustIndustryChips}>
            {INDUSTRIES.map((ind) => (
              <span key={ind} className={styles.trustIndustryChip}>{ind}</span>
            ))}
          </div>
          <p className={styles.trustStoriesNote}>
            Finance teams certify invoice AI. Healthcare validates diagnostic assistants.
            Government agencies audit citizen-facing chatbots - all through one Trust Engine.
          </p>
        </div>

        <div className={styles.trustBlock}>
          <h3 className={styles.trustSubheading}>Platform Integrations</h3>
          <div className={styles.trustIntegrationGrid}>
            {INTEGRATIONS.map((app) => (
              <Link key={app.name} href={app.href} className={styles.trustIntegrationCard}>
                <span className={styles.trustIntegrationIcon}>{app.icon}</span>
                <span className={styles.trustIntegrationName}>{app.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.trustBlock}>
          <h3 className={styles.trustSubheading}>Certification Levels</h3>
          <div className={styles.trustCertGrid}>
            {CERT_LEVELS.map((level) => (
              <div
                key={level.tier}
                className={`${styles.trustCertCard} ${level.tierClass} ${level.featured ? styles.trustCertFeatured : ''}`}
              >
                {level.featured && <span className={styles.trustCertFeaturedBadge}>Most popular</span>}
                <h4 className={styles.trustCertTier}>{level.tier}</h4>
                <dl className={styles.trustCertDetails}>
                  <div><dt>Validation scope</dt><dd>{level.validation}</dd></div>
                  <div><dt>Monitoring level</dt><dd>{level.monitoring}</dd></div>
                  <div><dt>Compliance level</dt><dd>{level.compliance}</dd></div>
                  <div><dt>Enterprise readiness</dt><dd>{level.readiness}</dd></div>
                </dl>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.trustBlock}>
          <h3 className={styles.trustSubheading}>Continuous Monitoring</h3>
          <div className={styles.trustMonitoringFlow}>
            {MONITORING_FLOW.map((step, i) => (
              <div key={step} className={styles.trustMonitoringStep}>
                <span className={styles.trustMonitoringLabel}>{step}</span>
                {i < MONITORING_FLOW.length - 1 && <span className={styles.trustMonitoringArrow} aria-hidden>→</span>}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.trustCta}>
          <h3 className={styles.trustCtaTitle}>Ready to Certify Your AI?</h3>
          <p className={styles.trustCtaText}>
            Start with automated validation or book an enterprise assessment with our trust team.
          </p>
          <div className={styles.trustCtaActions}>
            <Link href="/workspace/trust/certify" className={styles.btnTrustPrimary}>
              Start Validation →
            </Link>
            <Link href="/about#contact" className={styles.btnTrustSecondary}>
              Book Enterprise Assessment
            </Link>
            <Link href="/trust" className={styles.btnTrustGhost}>
              Explore Trust Layer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
