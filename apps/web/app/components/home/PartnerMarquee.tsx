import Image from 'next/image';
import section from '../../home-sections.module.css';

export const PARTNER_LOGOS = [
  { name: 'MongoDB', src: '/partners/mongodb.svg' },
  { name: 'Neo4j', src: '/partners/neo4j.svg' },
  { name: 'OpenAI', src: '/partners/openai.svg' },
  { name: 'Anthropic', src: '/partners/anthropic.svg' },
  { name: 'AWS', src: '/partners/amazonaws.svg' },
  { name: 'Google Cloud', src: '/partners/googlecloud.svg' },
  { name: 'Microsoft Azure', src: '/partners/microsoftazure.svg' },
  { name: 'PostgreSQL', src: '/partners/postgresql.svg' },
  { name: 'Redis', src: '/partners/redis.svg' },
  { name: 'Pinecone', src: '/partners/pinecone.svg' },
  { name: 'LangChain', src: '/partners/langchain.svg' },
  { name: 'Hugging Face', src: '/partners/huggingface.svg' },
  { name: 'NVIDIA', src: '/partners/nvidia.svg' },
  { name: 'Snowflake', src: '/partners/snowflake.svg' },
] as const;

function LogoStrip({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div className={section.marqueeTrack} aria-hidden={ariaHidden}>
      {PARTNER_LOGOS.map((partner) => (
        <div key={partner.name} className={section.marqueeItem} role="listitem">
          <Image
            src={partner.src}
            alt={ariaHidden ? '' : partner.name}
            width={120}
            height={32}
            className={section.marqueeLogo}
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}

export function PartnerMarquee() {
  return (
    <div className={section.marqueeWrap} role="list" aria-label="Technology partners">
      <div className={section.marqueeFadeLeft} aria-hidden="true" />
      <div className={section.marqueeFadeRight} aria-hidden="true" />
      <div className={section.marqueeScroller}>
        <LogoStrip />
        <LogoStrip ariaHidden />
      </div>
    </div>
  );
}
