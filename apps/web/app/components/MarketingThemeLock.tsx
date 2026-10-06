'use client';

import { useEffect } from 'react';

/** Keep public pages on the light token set so dark-mode storage cannot wash out buttons. */
export function MarketingThemeLock() {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    root.dataset.theme = 'light';
    root.style.colorScheme = 'light';
    return () => {
      if (previous) root.dataset.theme = previous;
    };
  }, []);
  return null;
}
