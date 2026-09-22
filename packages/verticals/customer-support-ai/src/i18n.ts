import type { SupportLanguage } from './types.js';

export const SUPPORTED_LANGUAGES: SupportLanguage[] = ['en', 'de', 'ar'];

export const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  de: 'Deutsch',
  ar: 'العربية',
};

const GREETINGS: Record<string, string> = {
  en: 'Hello! How can I help you today?',
  de: 'Hallo! Wie kann ich Ihnen heute helfen?',
  ar: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
};

const RESPONSES: Record<string, Record<string, string>> = {
  en: {
    order_status: 'I can check your order status. Please share your order number.',
    refund: 'I will review your refund eligibility based on our return policy.',
    complaint: 'I am sorry to hear that. Let me look into this for you.',
    technical: 'I can help troubleshoot. What issue are you experiencing?',
    booking: 'I can assist with your booking. What would you like to change?',
    cancellation: 'I can help with cancellation. Please confirm your booking reference.',
    account: 'I can help with your account. What do you need to update?',
    general: 'I am here to help. Could you tell me more?',
    escalated: 'I am connecting you with a specialist who can assist further.',
  },
  de: {
    order_status: 'Ich kann Ihren Bestellstatus prüfen. Bitte teilen Sie Ihre Bestellnummer mit.',
    refund: 'Ich prüfe Ihre Erstattungsberechtigung gemäß unserer Rückgaberichtlinie.',
    complaint: 'Es tut mir leid. Ich kümmere mich darum.',
    technical: 'Ich helfe bei technischen Problemen. Was ist das Problem?',
    booking: 'Ich kann bei Ihrer Buchung helfen. Was möchten Sie ändern?',
    cancellation: 'Ich helfe bei der Stornierung. Bitte bestätigen Sie Ihre Buchungsreferenz.',
    account: 'Ich helfe bei Ihrem Konto. Was möchten Sie aktualisieren?',
    general: 'Ich bin für Sie da. Können Sie mir mehr erzählen?',
    escalated: 'Ich verbinde Sie mit einem Spezialisten.',
  },
  ar: {
    order_status: 'يمكنني التحقق من حالة طلبك. يرجى مشاركة رقم الطلب.',
    refund: 'سأراجع أهلية الاسترداد وفقاً لسياسة الإرجاع.',
    complaint: 'أنا آسف لسماع ذلك. دعني أتحقق من الأمر.',
    technical: 'يمكنني المساعدة في حل المشكلة. ما المشكلة التي تواجهها؟',
    booking: 'يمكنني المساعدة في الحجز. ماذا تريد تغييره؟',
    cancellation: 'يمكنني المساعدة في الإلغاء. يرجى تأكيد مرجع الحجز.',
    account: 'يمكنني المساعدة في حسابك. ماذا تريد تحديثه؟',
    general: 'أنا هنا للمساعدة. هل يمكنك إخباري بالمزيد؟',
    escalated: 'أقوم بتوصيلك بأخصائي يمكنه المساعدة.',
  },
};

export function detectLanguage(text: string): SupportLanguage {
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  if (/\b(ich|bitte|danke|guten|hallo|bestellung|rückerstattung)\b/i.test(text)) return 'de';
  return 'en';
}

export function getGreeting(language: SupportLanguage): string {
  return GREETINGS[language] ?? GREETINGS.en;
}

export function getIntentResponse(language: SupportLanguage, intent: string, escalated = false): string {
  const lang = RESPONSES[language] ?? RESPONSES.en;
  if (escalated) return lang.escalated ?? RESPONSES.en.escalated;
  return lang[intent] ?? lang.general ?? RESPONSES.en.general;
}

export function isRtl(language: SupportLanguage): boolean {
  return language === 'ar';
}
