/**
 * @ai-pass/data-masking — easy-to-apply layer for securing data shared via APIs.
 *
 *   import { applyMasking } from '@ai-pass/data-masking';
 *   return Response.json(applyMasking(payload)); // masks names, passwords, secrets, …
 */

export type {
  MaskHit,
  MaskKind,
  MaskResult,
  MaskRule,
  MaskStyle,
  MaskingPolicy,
} from './types';
export { VALUE_PATTERNS, KEY_HINTS } from './patterns';
export {
  presets,
  apiSharePolicy,
  externalPolicy,
  secretsOnlyPolicy,
  type PresetName,
} from './presets';
export { applyMasking, applyMaskingWithReport, withDataMasking } from './apply';
