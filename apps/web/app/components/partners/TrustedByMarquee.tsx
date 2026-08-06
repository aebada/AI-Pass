import styles from '../../home-sections.module.css';
import { PARTNER_LOGOS } from './PartnerLogos';

export function TrustedByMarquee() {
  const logoClass = styles.partnerLogo;

  return (
    <div className={styles.marqueeWrapper}>
      <div className={styles.marqueeTrack} role="list" aria-label="Technology partners">
        <div className={styles.marqueeStrip}>
          {PARTNER_LOGOS.map(({ id, Logo }) => (
            <Logo key={id} className={logoClass} />
          ))}
        </div>
        <div className={styles.marqueeStrip} aria-hidden="true">
          {PARTNER_LOGOS.map(({ id, Logo }) => (
            <Logo key={`${id}-dup`} className={logoClass} />
          ))}
        </div>
      </div>
    </div>
  );
}
