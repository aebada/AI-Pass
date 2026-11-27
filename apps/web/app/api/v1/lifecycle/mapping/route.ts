import { getLifecycleIntelligenceService } from '@ai-pass/lifecycle-intelligence';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const svc = getLifecycleIntelligenceService();
  return NextResponse.json({
    mappings: svc.listMappings(),
    changeSets: svc.listChangeSets(),
  });
}

export async function POST(request: Request) {
  const svc = getLifecycleIntelligenceService();
  const body = (await request.json().catch(() => null)) as {
    action?: 'create' | 'suggest' | 'confirm' | 'publish' | 'ingest';
    name?: string;
    sourceSystem?: string;
    sourceFormat?: 'xml' | 'csv' | 'json' | 'yaml' | 'plcopen' | 'custom';
    mappingId?: string;
    sourceFields?: string[];
    ruleId?: string;
    confirm?: boolean;
    datasetId?: string;
    records?: Record<string, string | number | boolean>[];
  } | null;

  if (body?.action === 'create' && body.name && body.sourceSystem) {
    return NextResponse.json({
      mapping: svc.createMapping({
        name: body.name,
        sourceSystem: body.sourceSystem,
        sourceFormat: body.sourceFormat,
      }),
    });
  }
  if (body?.action === 'suggest' && body.mappingId && body.sourceFields) {
    return NextResponse.json({
      rules: svc.suggestMappingRules(body.mappingId, body.sourceFields),
    });
  }
  if (body?.action === 'confirm' && body.mappingId && body.ruleId) {
    const rule = svc.confirmRule(body.mappingId, body.ruleId, body.confirm !== false);
    if (!rule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ rule });
  }
  if (body?.action === 'publish' && body.mappingId) {
    const mapping = svc.publishMapping(body.mappingId);
    if (!mapping) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ mapping });
  }
  if (body?.action === 'ingest' && body.datasetId && body.mappingId && body.records) {
    try {
      const changeSet = svc.ingestRecords({
        datasetId: body.datasetId,
        mappingId: body.mappingId,
        records: body.records,
      });
      return NextResponse.json({ changeSet });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Ingest failed' },
        { status: 400 },
      );
    }
  }
  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
