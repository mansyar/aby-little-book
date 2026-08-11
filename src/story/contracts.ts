import { z } from 'zod';

// The story package is validated data, never React code. Domain types are
// inferred from the authoritative schemas so the schema and its consumers
// cannot drift apart.

export const LOCALES = ['en', 'id'] as const;
export type Locale = (typeof LOCALES)[number];

export const ASTRONAUT_IDS = ['aby', 'maya', 'niko'] as const;
export type AstronautId = (typeof ASTRONAUT_IDS)[number];

export const ROUTE_IDS = ['asteroid-garden', 'singing-starfield'] as const;
export type RouteId = (typeof ROUTE_IDS)[number];

export const ASSET_ROLES = [
  'background',
  'distant',
  'character',
  'midground',
  'target',
  'foreground',
  'effect',
  'reference',
] as const;
export type AssetRole = (typeof ASSET_ROLES)[number];

export const LAYOUT_IDS = ['ipad-landscape', 'phone-portrait', 'desktop'] as const;
export type LayoutId = (typeof LAYOUT_IDS)[number];

const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
export const SPREAD_ID_PATTERN = /^(S|A|B)\d{2}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const WEBP_SRC_PATTERN = /\.webp$/;

export const grammarSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  subjectCap: z.string().min(1),
  object: z.string().min(1),
  possessive: z.string().min(1),
});
export type AstronautGrammar = z.infer<typeof grammarSchema>;

export const astronautSchema = z.object({
  id: z.enum(ASTRONAUT_IDS),
  grammar: z.object({
    en: grammarSchema,
    id: grammarSchema,
  }),
});
export type Astronaut = z.infer<typeof astronautSchema>;

export const localizedTextSchema = z.object({
  en: z.string().min(1),
  id: z.string().min(1),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

// Prose lines may contain {name}, {subject}, {subjectCap}, {object}, and
// {possessive} tokens; resolution happens before rendering or pronunciation.
export const proseLineSchema = localizedTextSchema;
export type ProseLine = z.infer<typeof proseLineSchema>;

export const interactionSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('route-choice'),
    target: z.string().min(1),
    required: z.literal(true),
  }),
  z.object({ kind: z.literal('reveal'), target: z.string().min(1), required: z.literal(false) }),
  z.object({ kind: z.literal('find-tap'), target: z.string().min(1), required: z.literal(false) }),
  z.object({
    kind: z.literal('chain-reveal'),
    target: z.string().min(1),
    required: z.literal(false),
  }),
  z.object({
    kind: z.literal('character-response'),
    target: z.string().min(1),
    required: z.literal(false),
  }),
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
  id: z.enum(ROUTE_IDS),
  spreadIds: z.array(z.string().min(1)).min(1),
});
export type Route = z.infer<typeof routeSchema>;

export const storySchema = z.object({
  id: z.string().min(1),
  title: localizedTextSchema,
  version: z.string().regex(SEMVER_PATTERN),
  astronauts: z.array(astronautSchema).length(3),
  startSpreadId: z.literal('S01'),
  choiceSpreadId: z.literal('S03'),
  convergenceSpreadId: z.literal('S07'),
  endingSpreadId: z.literal('S10'),
  spreads: z.record(z.string(), spreadSchema),
  routes: z.array(routeSchema).length(2),
});
export type Story = z.infer<typeof storySchema>;

export const safeRegionSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
});
export type SafeRegion = z.infer<typeof safeRegionSchema>;

export const assetLayerSchema = z.object({
  id: z.string().min(1),
  role: z.enum(ASSET_ROLES),
  order: z.number().int().nonnegative(),
  src: z.string().regex(WEBP_SRC_PATTERN),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sha256: z.string().regex(SHA256_PATTERN),
  safeRegion: safeRegionSchema.optional(),
});
export type AssetLayer = z.infer<typeof assetLayerSchema>;

export const layoutSchema = z.object({
  id: z.enum(LAYOUT_IDS),
  layerIds: z.array(z.string().min(1)).min(1),
});
export type SceneLayout = z.infer<typeof layoutSchema>;

export const packageManifestSchema = z.object({
  packageId: z.string().min(1),
  storyId: z.string().min(1),
  storyVersion: z.string().regex(SEMVER_PATTERN),
  layouts: z.array(layoutSchema),
  assets: z.array(assetLayerSchema),
  totalBytes: z.number().int().nonnegative(),
});
export type PackageManifest = z.infer<typeof packageManifestSchema>;

export const packageReadinessSchema = z.object({
  ready: z.boolean(),
  packageId: z.string().min(1),
  storyVersion: z.string().regex(SEMVER_PATTERN),
  missingAssets: z.array(z.string()),
  failedHashes: z.array(z.string()),
});
export type PackageReadiness = z.infer<typeof packageReadinessSchema>;
