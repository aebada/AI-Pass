import { jsonOk, jsonError, getPlatform } from '@/src/lib/marketplace-api';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const skill = getPlatform().skills.get(id) ?? getPlatform().skills.getBySlug(id);
  if (!skill) return jsonError('Skill not found', 'NOT_FOUND', 404);
  const reviews = getPlatform().reviews.listForResource(skill.id);
  const certs = getPlatform().certifications.listForResource('skill', skill.id);
  return jsonOk({ skill, reviews, certifications: certs });
}
