import { z } from 'zod';

// 3D package contracts: GLB scenes plus KTX2 textures produced by the agent
// Blender pipeline. Budgets and provenance are carried here; enforcement
// (totals within budget, hashes match bytes) lives in the build-time
// validators, not here.

const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const GLB_SRC_PATTERN = /\.glb$/;
const KTX2_SRC_PATTERN = /\.ktx2$/;

export const vec3Schema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});
export type Vec3 = z.infer<typeof vec3Schema>;

export const textureSchema = z.object({
  id: z.string().min(1),
  src: z.string().regex(KTX2_SRC_PATTERN),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  // Optional so older manifests still parse; preparation treats a missing
  // hash as unverifiable and refuses to cache the texture.
  sha256: z.string().regex(SHA256_PATTERN).optional(),
});
export type SceneTexture = z.infer<typeof textureSchema>;

export const tapTargetSchema = z.object({
  id: z.string().min(1),
  label: z.object({
    en: z.string().min(1),
    id: z.string().min(1),
  }),
  position: vec3Schema,
});
export type TapTarget = z.infer<typeof tapTargetSchema>;

export const sceneSchema = z.object({
  id: z.string().min(1),
  glb: z.string().regex(GLB_SRC_PATTERN),
  sha256: z.string().regex(SHA256_PATTERN),
  triangles: z.number().int().nonnegative(),
  pivot: vec3Schema,
  bounds: z.object({
    min: vec3Schema,
    max: vec3Schema,
  }),
  textures: z.array(textureSchema),
  tapTargets: z.array(tapTargetSchema),
  // Prose lives in DOM overlays, never in textures.
  bakedText: z.literal(false),
  budgets: z.object({
    maxTriangles: z.number().int().positive(),
    maxTextureBytes: z.number().int().positive(),
    maxTotalBytes: z.number().int().positive(),
  }),
});
export type Scene = z.infer<typeof sceneSchema>;

export const builderSchema = z.object({
  blender: z.string().min(1),
  builderSha: z.string().min(1),
  styleSha: z.string().min(1),
  seed: z.number().int().nonnegative(),
});
export type Builder = z.infer<typeof builderSchema>;

export const packageManifestSchema = z.object({
  packageId: z.string().min(1),
  storyId: z.string().min(1),
  storyVersion: z.string().regex(SEMVER_PATTERN),
  builder: builderSchema,
  scenes: z.array(sceneSchema).min(1),
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
