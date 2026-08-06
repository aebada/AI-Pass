import { Suspense } from 'react';
import ExecutionHistoryClient from './HistoryClient';

export default function ExecutionHistoryPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading history…</div>}>
      <ExecutionHistoryClient />
    </Suspense>
  );
}
