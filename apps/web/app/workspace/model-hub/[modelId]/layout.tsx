import type { ReactNode } from 'react';
import { MODEL_REGISTRY } from '@ai-pass/model-hub';

export function generateStaticParams() {
  return MODEL_REGISTRY.map((model) => ({ modelId: model.id }));
}

export default function ModelDetailLayout({ children }: { children: ReactNode }) {
  return children;
}
