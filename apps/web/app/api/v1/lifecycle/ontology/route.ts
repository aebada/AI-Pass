import { getLifecycleIntelligenceService } from '@ai-pass/lifecycle-intelligence';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id');
  const svc = getLifecycleIntelligenceService();
  if (id) {
    const ontology = svc.getOntology(id);
    if (!ontology) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ontology });
  }
  return NextResponse.json({ ontologies: svc.listOntologies() });
}

export async function POST(request: Request) {
  const svc = getLifecycleIntelligenceService();
  const body = (await request.json().catch(() => null)) as {
    action?: 'create' | 'add_entity' | 'add_relation';
    name?: string;
    ontologyId?: string;
    entity?: {
      id: string;
      label: string;
      domain: string;
      definition: string;
      attributes?: { id: string; label: string; dataType: string }[];
    };
    relation?: {
      id: string;
      label: string;
      domain: string;
      range: string;
      definition: string;
    };
  } | null;

  if (body?.action === 'create' && body.name) {
    return NextResponse.json({ ontology: svc.createOntology(body.name) });
  }
  if (body?.action === 'add_entity' && body.ontologyId && body.entity) {
    const ontology = svc.addEntityType(body.ontologyId, body.entity as never);
    if (!ontology) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ontology });
  }
  if (body?.action === 'add_relation' && body.ontologyId && body.relation) {
    const ontology = svc.addRelationType(body.ontologyId, body.relation);
    if (!ontology) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ontology });
  }
  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
