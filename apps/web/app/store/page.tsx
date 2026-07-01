import { redirect } from 'next/navigation';
import { STORE_ROUTES } from '@ai-pass/routes';

export default function StoreAliasPage() {
  redirect(STORE_ROUTES.home);
}
