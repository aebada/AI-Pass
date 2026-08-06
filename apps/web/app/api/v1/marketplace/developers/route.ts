import { NextResponse } from 'next/server';
import { handleListDevelopers, handleRegisterDeveloper, toJsonResponse } from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function GET() {
  return toJsonResponse(handleListDevelopers(), NextResponse);
}

export async function POST(request: Request) {
  const body = await request.json();
  return toJsonResponse(handleRegisterDeveloper(body), NextResponse);
}
