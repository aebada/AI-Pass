'use client';

import { useState } from 'react';
import { defaultCustomerSupportAIService, DEMO_TENANT_ID } from '@ai-pass/customer-support-ai';
import { SupportAppShell } from '../SupportAppShell';
import styles from '../support.module.css';
import { ModuleIcon } from '@ai-pass/ui';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ar', label: 'العربية' },
];

export default function VoiceConsolePage() {
  const [language, setLanguage] = useState('en');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('idle');

  async function ensureConversation() {
    if (conversationId) return conversationId;
    const result = await defaultCustomerSupportAIService.startConversation({
      tenantId: DEMO_TENANT_ID,
      userId: 'demo-user',
      tier: 'power',
      channel: 'voice',
      language,
    });
    setConversationId(result.conversation.id);
    return result.conversation.id;
  }

  async function handleMic() {
    const convId = await ensureConversation();
    if (!recording) {
      setRecording(true);
      setStatus('recording');
      defaultCustomerSupportAIService.handleVoice({
        conversationId: convId,
        tenantId: DEMO_TENANT_ID,
        userId: 'demo-user',
        tier: 'power',
        action: 'start',
        language,
      });
    } else {
      setRecording(false);
      setStatus('processing');
      const result = defaultCustomerSupportAIService.handleVoice({
        conversationId: convId,
        tenantId: DEMO_TENANT_ID,
        userId: 'demo-user',
        tier: 'power',
        action: 'transcribe',
        language,
      });
      setTranscript(result.transcript ?? '');
      setResponse(result.responseText ?? '');
      setStatus('idle');

      const tts = defaultCustomerSupportAIService.handleVoice({
        conversationId: convId,
        tenantId: DEMO_TENANT_ID,
        userId: 'demo-user',
        tier: 'power',
        action: 'synthesize',
        audioBase64: result.responseText,
      });
      setStatus(tts.audioBase64 ? 'speaking (stub)' : 'idle');
    }
  }

  return (
    <SupportAppShell title="Voice Console" subtitle="STT/TTS demo with language switching">
      <div className={styles.actions}>
        <select
          className={styles.input}
          style={{ width: 160 }}
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <span className={styles.badge} style={{ alignSelf: 'center' }}>STT/TTS stub</span>
      </div>

      <div className={`${styles.card} ${styles.voiceConsole}`}>
        <button
          type="button"
          className={`${styles.micBtn} ${recording ? styles.micBtnActive : ''}`}
          onClick={handleMic}
          aria-label={recording ? 'Stop recording' : 'Start recording'}
        >
          <ModuleIcon name={recording ? "x" : "mic"} size={18} />
        </button>
        <p style={{ color: 'var(--text-muted)' }}>Status: {status}</p>
        <p style={{ fontSize: 13 }}>Conversation: {conversationId ?? 'Not started'}</p>
      </div>

      <div className={styles.grid} style={{ marginTop: 20 }}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Transcript (STT)</h3>
          <p style={{ fontSize: 14 }}>{transcript || 'Press mic to simulate speech-to-text…'}</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>AI Response (TTS)</h3>
          <p style={{ fontSize: 14 }}>{response || 'Response will appear after transcription…'}</p>
        </div>
      </div>
    </SupportAppShell>
  );
}
