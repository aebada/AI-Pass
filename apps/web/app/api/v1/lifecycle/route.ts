import { getLifecycleIntelligenceService } from '@ai-pass/lifecycle-intelligence';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(getLifecycleIntelligenceService().snapshot());
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    name?: string;
    productLine?: string;
    ontologyId?: string;
  } | null;
  const svc = getLifecycleIntelligenceService();

  if (body?.action === 'create_ontology' && body.name) {
    return NextResponse.json({ ontology: svc.createOntology(body.name) });
  }
  if (body?.action === 'create_dataset' && body.name && body.productLine && body.ontologyId) {
    return NextResponse.json({
      dataset: svc.createDataset({
        name: body.name,
        productLine: body.productLine,
        ontologyId: body.ontologyId,
      }),
    });
  }
  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
