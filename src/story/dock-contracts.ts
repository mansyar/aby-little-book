import { z } from 'zod';

// Dock-story contracts for the turtle sharing tale. Domain types are inferred
// from these schemas so prose data and its consumers cannot drift apart.
// Cross-field rules (route convergence, spread references) live in the
// build-time validators, not here.

export const LOCALES = ['en', 'id'] as const;
export type Locale = (typeof LOCALES)[number];

export const CHARACTER_IDS = ['child', 'turtle', 'narrator'] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export const SPREAD_ID_PATTERN = /^(S|A|B)\d{2}$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const PLACEHOLDER_PATTERN = /todo|lorem|\{\{|xxx/i;
const SENTENCE_PATTERN = /[.!?…]+/;

function sentenceCount(value: string): number {
  // Fragments without letters are punctuation debris, not sentences: quoted
  // dialogue (..."little turtle.") leaves a trailing quote-only fragment
  // that must not count against the two-sentence budget.
  return value
    .split(SENTENCE_PATTERN)
    .filter((part) => part.trim().length > 0 && /\p{L}/u.test(part)).length;
}

export const localizedTextSchema = z.object({
  en: z.string().min(1),
  id: z.string().min(1),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

// Story prose: at most two short sentences per locale, never placeholders.
export const proseLineSchema = z.object({
  en: z
    .string()
    .min(1)
    .refine((value) => sentenceCount(value) <= 2, 'at most two sentences')
    .refine((value) => !PLACEHOLDER_PATTERN.test(value), 'no placeholders'),
  id: z
    .string()
    .min(1)
    .refine((value) => sentenceCount(value) <= 2, 'at most two sentences')
    .refine((value) => !PLACEHOLDER_PATTERN.test(value), 'no placeholders'),
});
export type ProseLine = z.infer<typeof proseLineSchema>;

// Guided tactile interactions only: required route choice, required boarding,
// optional taps. No games, no fail states.
export const interactionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('route-choice'),
    target: z.string().min(1),
    required: z.literal(true),
  }),
  z.object({ kind: z.literal('tap'), target: z.string().min(1), required: z.literal(false) }),
  z.object({ kind: z.literal('board'), target: z.string().min(1), required: z.literal(true) }),
]);
export type Interaction = z.infer<typeof interactionSchema>;

export const spreadSchema = z.object({
  id: z.string().regex(SPREAD_ID_PATTERN),
  title: localizedTextSchema,
  prose: proseLineSchema,
  interaction: interactionSchema.optional(),
});
export type Spread = z.infer<typeof spreadSchema>;

export const routeSchema = z.object({
  id: z.string().min(1),
  // Bilingual choice labels: the S04 route-choice renders one button per
  // route, and both locales need a natural name for each path.
  title: localizedTextSchema,
  spreadIds: z.array(z.string().min(1)).min(1),
});
export type Route = z.infer<typeof routeSchema>;

export const storySchema = z.object({
  id: z.string().min(1),
  title: localizedTextSchema,
  version: z.string().regex(SEMVER_PATTERN),
  characters: z.array(z.enum(CHARACTER_IDS)).max(3),
  startSpreadId: z.literal('S01'),
  choiceSpreadId: z.literal('S04'),
  convergenceSpreadId: z.literal('S08'),
  endingSpreadId: z.literal('S10'),
  spreads: z.record(z.string(), spreadSchema),
  routes: z.array(routeSchema).length(2),
});
export type Story = z.infer<typeof storySchema>;
