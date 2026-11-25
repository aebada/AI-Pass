import { getTwinAutopilotService } from '@ai-pass/twin-autopilot';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const twinId = new URL(request.url).searchParams.get('twinId') || undefined;
  return NextResponse.json({ vault: getTwinAutopilotService().listVault(twinId) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    twinId?: string;
    label?: string;
    service?: string;
    secretRef?: string;
  } | null;

  if (!body?.twinId || !body.label || !body.service || !body.secretRef) {
    return NextResponse.json(
      { error: 'twinId, label, service, secretRef required' },
      { status: 400 },
    );
  }

  const ref = getTwinAutopilotService().addVaultRef({
    twinId: body.twinId,
    label: body.label,
    service: body.service,
    secretRef: body.secretRef,
  });
  return NextResponse.json({ ref });
}
