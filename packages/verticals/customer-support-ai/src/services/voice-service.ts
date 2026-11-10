import { createId } from '@ai-pass/shared';
import type { VoiceSession, SupportLanguage } from '../types.js';

export class VoiceService {
  private sessions = new Map<string, VoiceSession>();

  start(conversationId: string, language: SupportLanguage): VoiceSession {
    const session: VoiceSession = {
      id: `voice_${createId()}`,
      conversationId,
      language,
      status: 'idle',
      durationSeconds: 0,
      recordingMetadata: {
        format: 'webm',
        sampleRate: 16000,
        channels: 1,
        stubbed: true,
      },
      startedAt: new Date().toISOString(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  /** STT stub — simulates speech-to-text */
  transcribe(sessionId: string, _audioBase64?: string): { transcript: string; session: VoiceSession } {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Voice session not found: ${sessionId}`);

    session.status = 'processing';
    const transcripts: Record<string, string> = {
      en: 'I need help with my order status please.',
      de: 'Ich brauche Hilfe mit meinem Bestellstatus.',
      ar: 'أحتاج مساعدة في حالة طلبي من فضلك.',
    };
    session.transcript = transcripts[session.language] ?? transcripts.en;
    session.status = 'idle';
    session.durationSeconds += 5;
    return { transcript: session.transcript, session };
  }

  /** TTS stub — simulates text-to-speech */
  synthesize(sessionId: string, text: string): { audioBase64: string; session: VoiceSession } {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Voice session not found: ${sessionId}`);

    session.status = 'speaking';
    const audioBase64 = `stub_tts_${encodeURIComponent(text.slice(0, 50))}`;
    session.status = 'idle';
    session.durationSeconds += 3;
    return { audioBase64, session };
  }

  switchLanguage(sessionId: string, language: SupportLanguage): VoiceSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Voice session not found: ${sessionId}`);
    session.language = language;
    return session;
  }

  end(sessionId: string): VoiceSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Voice session not found: ${sessionId}`);
    session.status = 'ended';
    session.endedAt = new Date().toISOString();
    return session;
  }

  get(sessionId: string): VoiceSession | undefined {
    return this.sessions.get(sessionId);
  }
}
