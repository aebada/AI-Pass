import { createKnowledgePipeline, KnowledgePipelineHook } from '@ai-pass/knowledge-pipeline';

let defaultHook: KnowledgePipelineHook | undefined;

export function getKnowledgePipelineHook(): KnowledgePipelineHook {
  if (!defaultHook) {
    defaultHook = createKnowledgePipeline().hook;
  }
  return defaultHook;
}

export { KnowledgePipelineHook };
