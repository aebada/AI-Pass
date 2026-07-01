import { defaultInvoiceAIService, DEMO_TENANT_ID } from '@ai-pass/invoice-ai';

export function generateStaticParams() {
  return defaultInvoiceAIService.listInvoices(DEMO_TENANT_ID).map((inv) => ({ id: inv.id }));
}

export default function InvoiceDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
