import { redirect } from 'next/navigation';

export default function LegacyMarketplaceRedirect() {
  redirect('/workspace/marketplace');
}
