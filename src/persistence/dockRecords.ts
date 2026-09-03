import { z } from 'zod';
import { LOCALES } from '../story/dock-contracts';

// Zod records for the dock world. Same calm contract as the existing records:
// reads validate before restore, corrupt data degrades to null, writes
// validate first. Package readiness reuses the scene package schema so the
// offline receipt and the build-time manifest can never drift apart.

export const dockSettingsSchema = z.object({
  id: z.literal('app'),
  locale: z.enum(LOCALES),
  soundEnabled: z.boolean().optional(),
  textScale: z.enum(['standard', 'large']).optional(),
  reducedMotion: z.boolean().optional(),
});
export type DockSettingsRecord = z.infer<typeof dockSettingsSchema>;

export const guidedSessionSchema = z.object({
  storyId: z.string().min(1),
  path: z.array(z.string().min(1)).min(1),
  index: z.number().int().nonnegative(),
  spreadId: z.string().min(1),
  routeId: z.string().min(1).nullable(),
  boarded: z.boolean(),
  taps: z.record(z.string(), z.array(z.string())),
  completed: z.boolean(),
});

export const guidedProgressSchema = z.object({
  storyId: z.string().min(1),
  session: guidedSessionSchema,
  savedAt: z.number().nonnegative(),
});
export type GuidedProgressRecord = z.infer<typeof guidedProgressSchema>;

export const dockCompletionSchema = z.object({
  id: z.literal('keepsake'),
  storyId: z.string().min(1),
  routeId: z.string().min(1).nullable(),
  completedAt: z.number().nonnegative(),
});
export type DockCompletionRecord = z.infer<typeof dockCompletionSchema>;
