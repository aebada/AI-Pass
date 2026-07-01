export function generateStaticParams() {
  return [{ id: 'evt_seed_demo' }];
}

export default function LiveSyncEventLayout({ children }: { children: React.ReactNode }) {
  return children;
}
