import { NextResponse } from 'next/server';
import { handleGetApp, handleUpdateApp, handleDeleteApp, toJsonResponse } from '@ai-pass/marketplace-api';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return toJsonResponse(handleGetApp(id), NextResponse);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return toJsonResponse(handleUpdateApp(id, body), NextResponse);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return toJsonResponse(handleDeleteApp(id), NextResponse);
}
