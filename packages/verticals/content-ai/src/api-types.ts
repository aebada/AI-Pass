export type DetectRequest = { text: string };
export type HumanizeRequest = { text: string; tone?: 'professional' | 'casual' | 'academic'; modelId?: string };
export type BatchRequest = {
  type: 'detect' | 'humanize';
  texts: string[];
  tone?: 'professional' | 'casual' | 'academic';
  modelId?: string;
};
