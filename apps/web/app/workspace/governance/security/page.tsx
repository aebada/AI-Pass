import { redirect } from 'next/navigation';

// DeepTeam security UI hidden until service is ready — see SecurityPageContent.tsx
export default function SecurityPage() {
  redirect('/workspace/governance');
}
