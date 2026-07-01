'use client';

import HomePage from './HomePageContent';
import { LandingRedirect } from './components/LandingRedirect';

export default function Page() {
  return (
    <>
      <LandingRedirect />
      <HomePage />
    </>
  );
}
