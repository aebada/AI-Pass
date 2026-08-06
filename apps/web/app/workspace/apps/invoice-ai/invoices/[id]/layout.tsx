export function generateStaticParams() {
  return [
    { id: 'inv_001' },
    { id: 'inv_002' },
    { id: 'inv_003' },
    { id: 'inv_004' },
    { id: 'inv_005' },
  ];
}

export default function InvoiceDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
