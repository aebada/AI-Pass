import { NextResponse } from 'next/server';
import { handleListSkills, handleCreateSkill, toJsonResponse } from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') ?? undefined;
  return toJsonResponse(handleListSkills(category as never), NextResponse);
}

export async function POST(request: Request) {
  const body = await request.json();
  return toJsonResponse(handleCreateSkill(body), NextResponse);
}
