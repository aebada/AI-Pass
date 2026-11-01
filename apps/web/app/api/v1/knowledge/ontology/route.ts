import { NextResponse } from 'next/server';
import { getKnowledge } from '@/src/lib/knowledge-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const kp = getKnowledge();
  const { searchParams } = new URL(request.url);
  const ontologyId = searchParams.get('id') ?? undefined;
  const ontologies = kp.ontology.listOntologies();
  const active = ontologyId
    ? kp.ontology.getOntology(ontologyId)
    : ontologies[0] ?? kp.ontology.seed();

  return NextResponse.json({
    support: kp.ontology.getSupport(),
    ontologies,
    active,
    triples: active ? kp.ontology.listTriples(active.id).slice(0, 100) : [],
    plans: active ? kp.ontology.listPlans(active.id) : [],
    jobs: active ? kp.ontology.listJobs(active.id) : [],
    explorer: active ? kp.ontology.explore({ ontologyId: active.id, limit: 40 }) : [],
  });
}

export async function POST(request: Request) {
  const kp = getKnowledge();
  const body = (await request.json()) as {
    action?: string;
    tenantId?: string;
    name?: string;
    ontologyId?: string;
    text?: string;
    turtle?: string;
    title?: string;
    classes?: Array<{ iri: string; label: string; parents?: string[]; comment?: string }>;
    properties?: Array<{
      iri: string;
      label: string;
      domain?: string;
      range?: string;
      kind?: 'object' | 'datatype';
    }>;
    tables?: Array<{ name: string; columns: string[]; description?: string }>;
    planId?: string;
    certificateId?: string;
    question?: string;
    query?: string;
  };

  const action = body.action ?? 'status';

  try {
    switch (action) {
      case 'create': {
        const ontology = kp.ontology.createOntology({
          tenantId: body.tenantId ?? 'default',
          name: body.name ?? 'Uploaded ontology',
          turtle: body.turtle,
          source: 'uploaded',
        });
        return NextResponse.json({ ontology });
      }
      case 'extract': {
        if (!body.ontologyId || !body.text) {
          return NextResponse.json({ error: 'ontologyId and text required' }, { status: 400 });
        }
        const result = kp.ontology.extractTriples({
          ontologyId: body.ontologyId,
          text: body.text,
          allowOntologyGrowth: true,
        });
        return NextResponse.json(result);
      }
      case 'auto': {
        const ontology = kp.ontology.autoOntologyFromCatalog({
          tenantId: body.tenantId ?? 'default',
          name: body.name ?? 'Auto ontology',
          tables: body.tables ?? [
            { name: 'customers', columns: ['id', 'name', 'segment', 'owner'] },
            { name: 'orders', columns: ['id', 'customer_id', 'amount', 'status'] },
            { name: 'payments', columns: ['id', 'order_id', 'amount', 'method'] },
          ],
        });
        return NextResponse.json({ ontology });
      }
      case 'plan': {
        if (!body.ontologyId) {
          return NextResponse.json({ error: 'ontologyId required' }, { status: 400 });
        }
        const plan = kp.ontology.planChange({
          ontologyId: body.ontologyId,
          title: body.title ?? 'Proposed ontology change',
          classes: (body.classes ?? []).map((c) => ({
            iri: c.iri,
            label: c.label,
            comment: c.comment,
            parents: c.parents ?? [],
          })),
          properties: (body.properties ?? []).map((p) => ({
            iri: p.iri,
            label: p.label,
            domain: p.domain,
            range: p.range,
            kind: p.kind ?? 'object',
          })),
        });
        return NextResponse.json({ plan, certificate: kp.ontology.getCertificate(plan.certificateId) });
      }
      case 'apply': {
        if (!body.planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });
        return NextResponse.json({ plan: kp.ontology.applyPlan(body.planId) });
      }
      case 'rollback': {
        if (!body.planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });
        return NextResponse.json({ plan: kp.ontology.rollbackPlan(body.planId) });
      }
      case 'verify': {
        if (!body.certificateId) {
          return NextResponse.json({ error: 'certificateId required' }, { status: 400 });
        }
        return NextResponse.json(kp.ontology.verifyCertificate(body.certificateId));
      }
      case 'ground': {
        if (!body.ontologyId || !body.question) {
          return NextResponse.json({ error: 'ontologyId and question required' }, { status: 400 });
        }
        return NextResponse.json(kp.ontology.groundQuestion(body.ontologyId, body.question));
      }
      case 'explore': {
        if (!body.ontologyId) {
          return NextResponse.json({ error: 'ontologyId required' }, { status: 400 });
        }
        return NextResponse.json({
          nodes: kp.ontology.explore({ ontologyId: body.ontologyId, query: body.query, limit: 60 }),
        });
      }
      default:
        return NextResponse.json({ error: `Unknown action ${action}` }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Ontology action failed' },
      { status: 400 },
    );
  }
}
