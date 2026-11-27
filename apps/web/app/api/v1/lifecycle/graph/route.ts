import { getLifecycleIntelligenceService } from '@ai-pass/lifecycle-intelligence';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const datasetId = url.searchParams.get('datasetId') || undefined;
  const nodeId = url.searchParams.get('nodeId');
  const depth = Number(url.searchParams.get('depth') || '2');
  const svc = getLifecycleIntelligenceService();

  if (nodeId) {
    return NextResponse.json(svc.traverse(nodeId, depth));
  }
  return NextResponse.json({
    nodes: svc.listNodes(datasetId),
    edges: svc.listEdges(datasetId),
    datasets: svc.listDatasets(),
  });
}

export async function POST(request: Request) {
  const svc = getLifecycleIntelligenceService();
  const body = (await request.json().catch(() => null)) as {
    action?: 'upsert_node' | 'add_edge';
    datasetId?: string;
    typeId?: string;
    label?: string;
    attributes?: Record<string, string | number | boolean>;
    version?: string;
    sourceSystem?: string;
    sourceRecordId?: string;
    fromId?: string;
    toId?: string;
    edgeTypeId?: string;
  } | null;

  if (
    body?.action === 'upsert_node' &&
    body.datasetId &&
    body.typeId &&
    body.label &&
    body.sourceSystem &&
    body.sourceRecordId
  ) {
    const result = svc.upsertNode({
      datasetId: body.datasetId,
      typeId: body.typeId,
      label: body.label,
      attributes: body.attributes,
      version: body.version,
      provenance: {
        sourceSystem: body.sourceSystem,
        sourceRecordId: body.sourceRecordId,
        ingestedAt: new Date().toISOString(),
      },
    });
    return NextResponse.json(result);
  }

  if (
    body?.action === 'add_edge' &&
    body.datasetId &&
    body.fromId &&
    body.toId &&
    body.edgeTypeId &&
    body.sourceSystem &&
    body.sourceRecordId
  ) {
    const edge = svc.addEdge({
      datasetId: body.datasetId,
      typeId: body.edgeTypeId,
      fromId: body.fromId,
      toId: body.toId,
      provenance: {
        sourceSystem: body.sourceSystem,
        sourceRecordId: body.sourceRecordId,
        ingestedAt: new Date().toISOString(),
      },
    });
    return NextResponse.json({ edge });
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
}
