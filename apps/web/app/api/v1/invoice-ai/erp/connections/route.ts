import { ok } from '@ai-pass/platform-core';
import { defaultERPService, parseTenantId } from '@ai-pass/invoice-ai/api';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const tenantId = parseTenantId(request.headers);
  const connections = defaultERPService.listConnections(tenantId);
  const providers = defaultERPService.listProviders();

  return NextResponse.json(
    ok({
      connections: connections.map((c) => ({
        id: c.id,
        provider: c.provider,
        providerLabel: c.providerLabel,
        name: c.name,
        status: c.status,
        syncDirection: c.syncDirection,
        lastSyncAt: c.lastSyncAt,
        lastHealthCheckAt: c.lastHealthCheckAt,
        lastError: c.lastError,
      })),
      providers,
    }),
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const tenantId = parseTenantId(request.headers);
  const body = await request.json();

  if (!body.provider || !body.name || !body.credentials) {
    return NextResponse.json({ error: 'provider, name, and credentials are required' }, { status: 400 });
  }

  try {
    const connection = defaultERPService.createConnection({
      tenantId,
      provider: body.provider,
      name: body.name,
      credentials: body.credentials,
      config: body.config,
      syncDirection: body.syncDirection,
    });

    return NextResponse.json(
      ok({
        connection: {
          id: connection.id,
          provider: connection.provider,
          name: connection.name,
          status: connection.status,
        },
      }),
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create connection';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
