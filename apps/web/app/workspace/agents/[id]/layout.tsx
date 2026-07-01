export function generateStaticParams() {
  return [{ id: 'agent_seed_demo' }];
}

export default function AgentDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
