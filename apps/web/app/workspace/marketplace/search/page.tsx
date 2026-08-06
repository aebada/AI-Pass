'use client';

import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading search…</div>}>
      <SearchContent />
    </Suspense>
  );
}
