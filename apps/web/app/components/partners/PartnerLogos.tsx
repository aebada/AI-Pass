import type { ReactNode } from 'react';

type PartnerLogoProps = {
  className?: string;
};

function LogoFrame({ name, children, className }: { name: string; children: ReactNode; className?: string }) {
  return (
    <div className={className} role="listitem" aria-label={name}>
      {children}
    </div>
  );
}

export function MongoDBLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="MongoDB" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.193 9.555c-1.264-5.58-4.252-7.414-4.573-8.115-.28-.394-.53-.954-.735-1.44-.036.495-.055.685-.523 1.184-.723.566-4.438 3.682-4.74 10.02-.282 5.912 4.27 9.435 4.888 9.884l.07.05A73.49 73.49 0 0112 21.75c.75 0 1.472-.029 2.168-.084.618-.45 5.17-3.972 4.888-9.884-.302-6.338-4.017-9.454-4.74-10.02-.488-.499-.487-.689-.523-1.184.205.486.455 1.046.735 1.44.321.701 3.309 2.535 4.573 8.115z" />
      </svg>
    </LogoFrame>
  );
}

export function Neo4jLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="Neo4j" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M9.4 2.2c-2.8.4-5 2.5-5.5 5.3-.6 3.4 1.2 6.6 4.2 7.8l1.1.4v2.1c0 .6.5 1.1 1.1 1.1h.3c.6 0 1.1-.5 1.1-1.1v-2.1l1.1-.4c3-1.2 4.8-4.4 4.2-7.8-.5-2.8-2.7-4.9-5.5-5.3C11.6 1.9 10.4 1.9 9.4 2.2zm1.6 3.3c1.5.2 2.7 1.4 2.9 2.9.2 1.8-1 3.4-2.8 3.6-1.8.2-3.4-1-3.6-2.8-.2-1.5 1-2.7 2.5-2.9.3 0 .6-.1.9-.1.1 0 .1 0 .1.3z" />
      </svg>
    </LogoFrame>
  );
}

export function PostgreSQLLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="PostgreSQL" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C8.5 2 6 3.5 5 6.2c-.8 2.2-.3 4.8 1.3 6.5-.2.6-.4 1.3-.5 2.1-.2 1.5.1 2.8.8 3.7.7.9 1.8 1.4 3.2 1.5.3.6.7 1.1 1.2 1.4.8.5 1.8.6 2.8.3 1-.3 1.8-1 2.3-1.9.5-.9.7-2 .5-3.1 1.6-1.7 2.1-4.3 1.3-6.5C18 3.5 15.5 2 12 2zm-1.5 4.5c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5zm3 0c.8 0 1.5.7 1.5 1.5s-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5.7-1.5 1.5-1.5z" />
      </svg>
    </LogoFrame>
  );
}

export function RedisLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="Redis" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.5 3 7.2v9.6l9 4.7 9-4.7V7.2L12 2.5zm0 2.3 6.5 3.4L12 11.6 5.5 8.2 12 4.8zM5 9.4l7 3.7v7.1l-7-3.7V9.4zm9 10.8v-7.1l7-3.7v7.1l-7 3.7z" />
      </svg>
    </LogoFrame>
  );
}

export function OpenAILogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="OpenAI" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M22.28 9.82a5.8 5.8 0 00-.52-4.76 5.86 5.86 0 00-6.31-2.82A5.86 5.86 0 0010.54 0 5.87 5.87 0 006.2 3.09 5.86 5.86 0 00.5 5.91a5.87 5.87 0 00.72 6.89 5.8 5.8 0 00.52 4.76 5.86 5.86 0 006.31 2.82 5.86 5.86 0 004.91 2.24 5.87 5.87 0 004.34-3.09 5.86 5.86 0 005.7-2.82 5.87 5.87 0 00-.72-6.89zM13.5 21.3a4.4 4.4 0 01-2.82-1.02l.14-.08 4.68-2.7a.76.76 0 00.38-.66v-6.58l1.98 1.14a.07.07 0 01.04.06v5.45a4.43 4.43 0 01-4.4 4.39zm-9.46-4.05a4.4 4.4 0 01-.53-2.96l.14.08 4.68 2.7a.76.76 0 00.76 0l5.71-3.3v2.28a.07.07 0 01-.03.06l-4.73 2.73a4.43 4.43 0 01-5.9-1.59zM3.3 8.87a4.4 4.4 0 012.34-1.93v5.52a.76.76 0 00.38.66l5.71 3.3-1.98 1.14a.07.07 0 01-.07 0L5.95 14.8a4.43 4.43 0 01-2.65-5.93zm16.12 3.76-5.71-3.3 1.98-1.14a.07.07 0 01.07 0l4.73 2.73a4.4 4.4 0 01-.68 7.93v-5.52a.76.76 0 00-.39-.7zm1.98-2.98-4.68-2.7a.76.76 0 00-.76 0L9.24 9.65V7.37a.07.07 0 01.03-.06l4.73-2.73a4.43 4.43 0 016.4 4.57v2.48zM8.1 12.9 6.12 11.76a.07.07 0 01-.04-.06V6.25a4.43 4.43 0 017.32-3.45l-.14.08-4.68 2.7a.76.76 0 00-.38.66V12.9z" />
      </svg>
    </LogoFrame>
  );
}

export function AnthropicLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="Anthropic" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.8 3.2 21.5 20h-3.1l-1.6-4H7.2l-1.6 4H2.5L10.2 3.2h3.6zm-1.8 5.5L8.4 14h6.2l-3.6-5.3z" />
      </svg>
    </LogoFrame>
  );
}

export function AWSLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="Amazon Web Services" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M6.76 18.47c5.03 3.7 12.45 3.6 17.24 0-.2.17-.42.33-.65.48-4.52 2.9-10.42 2.9-14.94 0-.23-.15-.45-.31-.65-.48zM4.5 15.8c-.3-.45-.55-.93-.75-1.43C2.1 10.5 3.5 5.8 7.2 3.2c3.7-2.6 8.7-2.6 12.4 0 .35.25.68.53.98.84-4.9-2.8-11.1-2.5-15.7 1.1-1.5 1.2-2.7 2.8-3.4 4.5.2.5.35 1.02.44 1.55z" />
      </svg>
    </LogoFrame>
  );
}

export function DockerLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="Docker" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M21.8 10.5c-.2-.1-1.9-.1-2.5-.1-.1-.7-.3-1.3-.6-1.9l-.5-.9c-.6-1-1.4-1.9-2.4-2.5l-1 .6c.5.4.9.9 1.3 1.4H9.8V4.5H8.6v2.6H7.4V4.5H6.2v2.6H5V4.5H3.8v3.8c0 .6.5 1.1 1.1 1.1h.3c-1.2 1.5-1.9 3.4-1.9 5.4 0 4.6 3.7 8.3 8.3 8.3s8.3-3.7 8.3-8.3c0-1.5-.4-2.9-1.1-4.1.6 0 1.8.1 2.3.2z" />
      </svg>
    </LogoFrame>
  );
}

export function KubernetesLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="Kubernetes" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M10.2 2.3 2.8 6.6c-.5.3-.8.9-.8 1.5v8.8c0 .6.3 1.2.8 1.5l7.4 4.3c.5.3 1.1.3 1.6 0l7.4-4.3c.5-.3.8-.9.8-1.5V8.1c0-.6-.3-1.2-.8-1.5l-7.4-4.3c-.5-.3-1.1-.3-1.6 0zm.8 3.4 4.8 2.8-4.8 2.8V5.7zm-2 1.2v5.2l-4.8-2.8 4.8-2.4zm1 5.2 4.8 2.8-4.8 2.4v-5.2zm6.8-2.4-4.8 2.8v-5.2l4.8 2.4z" />
      </svg>
    </LogoFrame>
  );
}

export function LangChainLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="LangChain" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.2 6.8 3.8L12 11.8 5.2 8 12 4.2zM5 9.4l7 3.9v7.8L5 17.2V9.4zm9 11.7v-7.8l7-3.9v7.8l-7 3.9z" />
      </svg>
    </LogoFrame>
  );
}

export function StripeLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="Stripe" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M13.3 11.2c0-.8-.6-1.1-1.7-1.1-1.5 0-3.4.4-4.9 1.2V7.5c1.6-.7 3.3-1 5.1-1 3.7 0 5.8 1.5 5.8 4.3v6.5c-1.3.7-3.1 1.2-5.2 1.2-2.7 0-4.5-1.3-4.5-3.5 0-2.2 1.7-3.4 5.4-3.4zm-.3 2.5c-1.5 0-2.2.3-2.2 1 0 .6.5 1 1.5 1 1.1 0 2.1-.4 2.7-.9v-1.1zM5 4.5h14v2H5v-2z" />
      </svg>
    </LogoFrame>
  );
}

export function AzureLogo({ className }: PartnerLogoProps) {
  return (
    <LogoFrame name="Microsoft Azure" className={className}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M5.5 4.2 2 19.8h7.3L13 10.5 5.5 4.2zm8.2 0L11 10.5l4.5 9.3H22L13.7 4.2z" />
      </svg>
    </LogoFrame>
  );
}

export const PARTNER_LOGOS = [
  { id: 'mongodb', Logo: MongoDBLogo },
  { id: 'neo4j', Logo: Neo4jLogo },
  { id: 'postgresql', Logo: PostgreSQLLogo },
  { id: 'redis', Logo: RedisLogo },
  { id: 'openai', Logo: OpenAILogo },
  { id: 'anthropic', Logo: AnthropicLogo },
  { id: 'aws', Logo: AWSLogo },
  { id: 'azure', Logo: AzureLogo },
  { id: 'docker', Logo: DockerLogo },
  { id: 'kubernetes', Logo: KubernetesLogo },
  { id: 'langchain', Logo: LangChainLogo },
  { id: 'stripe', Logo: StripeLogo },
] as const;
