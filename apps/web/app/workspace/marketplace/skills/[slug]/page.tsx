import { SEED_SKILLS } from '@ai-pass/marketplace-core';
import SkillDetailClient from './SkillDetailClient';

export function generateStaticParams() {
  return SEED_SKILLS.map((skill) => ({ slug: skill.slug }));
}

export default function MarketplaceSkillPage() {
  return <SkillDetailClient />;
}
