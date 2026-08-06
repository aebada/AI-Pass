import { DEMO_INVOICES } from '@ai-pass/invoice-ai';
import InvoiceDetailClient from './InvoiceDetailClient';

export function generateStaticParams() {
  return DEMO_INVOICES.map((invoice) => ({ id: invoice.id }));
}

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <InvoiceDetailClient params={params} />;
}
