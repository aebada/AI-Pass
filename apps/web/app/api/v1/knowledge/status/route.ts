import { jsonOk, getKnowledge } from '@/src/lib/knowledge-api';
import { RETRIEVAL_TEST_QUERIES } from '@ai-pass/knowledge-pipeline';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const kp = getKnowledge();
  return jsonOk({
    status: kp.getStatus(),
    connectors: kp.connectors.listConnectorCatalog(),
    vectorProviders: kp.vectorStore.listProviders(),
    embeddingProviders: kp.embeddings.listProviders(),
    pipelineTemplates: kp.pipelines.listTemplates(),
    testQueries: RETRIEVAL_TEST_QUERIES,
    endpoints: kp.publishing.listEndpoints(),
    ontology: kp.graph.getOntologySupport(),
    retention: kp.governance.getRetentionPolicy(),
  });
}
