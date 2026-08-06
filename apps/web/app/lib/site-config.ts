/** Canonical contact email for the AI-Pass website (forms, mailto, footers, CTAs). */
export const CONTACT_EMAIL = 'info@aipass.space';

export type ContactIntent = 'demo' | 'callback';

export function mailtoContact(subject?: string): string {
  const base = `mailto:${CONTACT_EMAIL}`;
  if (!subject) return base;
  return `${base}?subject=${encodeURIComponent(subject)}`;
}

export function mailtoContactRequest(
  intent: ContactIntent,
  fields: {
    name: string;
    email: string;
    company?: string;
    message?: string;
    phone?: string;
  },
): string {
  const subject =
    intent === 'demo' ? 'Book a Demo — AI-Pass' : 'Callback Request — AI-Pass';
  const bodyLines = [
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    fields.company ? `Company: ${fields.company}` : '',
    intent === 'callback' && fields.phone ? `Phone: ${fields.phone}` : '',
    '',
    fields.message ||
      (intent === 'demo'
        ? 'I would like to book a product demo.'
        : 'Please call me back to discuss AI-Pass.'),
  ].filter((line) => line !== '');
  const params = new URLSearchParams({
    subject,
    body: bodyLines.join('\n'),
  });
  return `mailto:${CONTACT_EMAIL}?${params.toString()}`;
}
