// Zod records for everything persisted locally. Reads go through these
// schemas so that only validated stable state is ever restored; unusable
// local data degrades calmly to defaults instead of crashing the app.

import { z } from 'zod';
import { ASTRONAUT_IDS, LOCALES, ROUTE_IDS, SPREAD_ID_PATTERN } from '../story/contracts';

export const settingsRecordSchema = z.object({
  id: z.literal('app'),
  locale: z.enum(LOCALES),
  astronautId: z.enum(ASTRONAUT_IDS),
  // Caregiver preferences; optional so older records load unchanged.
  soundEnabled: z.boolean().optional(),
  textScale: z.enum(['standard', 'large']).optional(),
  reducedMotion: z.boolean().optional(),
});
export type SettingsRecord = z.infer<typeof settingsRecordSchema>;

export const progressRecordSchema = z.object({
  storyId: z.string().min(1),
  astronautId: z.enum(ASTRONAUT_IDS),
  locale: z.enum(LOCALES),
  currentSpreadId: z.string().regex(SPREAD_ID_PATTERN),
  route: z.enum(ROUTE_IDS).nullable(),
  history: z.array(z.string().regex(SPREAD_ID_PATTERN)).min(1),
  completed: z.boolean(),
  savedAt: z.number().nonnegative(),
});
export type ProgressRecord = z.infer<typeof progressRecordSchema>;

export const keepsakeRecordSchema = z.object({
  id: z.literal('keepsake'),
  lumiKeepsake: z.boolean(),
});
export type KeepsakeRecord = z.infer<typeof keepsakeRecordSchema>;

export const packageStateRecordSchema = z.object({
  packageId: z.string().min(1),
  ready: z.boolean(),
  missingAssets: z.array(z.string()),
  failedHashes: z.array(z.string()),
});
export type PackageStateRecord = z.infer<typeof packageStateRecordSchema>;
