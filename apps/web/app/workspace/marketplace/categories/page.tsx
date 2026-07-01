'use client';

import { Suspense } from 'react';
import CategoriesContent from './CategoriesContent';

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div>Loading categories…</div>}>
      <CategoriesContent />
    </Suspense>
  );
}
