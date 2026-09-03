import { z } from 'zod';

// Zod contract for art/style-bible.json — the single source of truth every
// Blender builder must follow. Versioned alongside the builders so a manifest
// can always name the exact style (styleSha) a package was built with.

const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const semverSchema = z.string().regex(/^\d+\.\d+\.\d+$/);
const vec3Schema = z.tuple([z.number(), z.number(), z.number()]);

const cameraSchema = z.object({
  fov: z.number().positive(),
  position: vec3Schema,
  target: vec3Schema,
});

const characterSchema = z.object({
  heightM: z.number().positive(),
  // Minimal faces only: bead eyes + blush, no mouths or noses. Anything else
  // risks the uncanny and breaks the calm look.
  face: z.literal('beads-and-blush'),
  primaryColor: hexColorSchema,
});

export const styleBibleSchema = z.object({
  version: semverSchema,
  blender: z.literal('5.2.0'),
  defaultSeed: z.number().int().nonnegative(),
  palette: z.record(z.string(), hexColorSchema),
  materials: z.object({
    clay: z.object({
      roughness: z.number().min(0).max(1),
      bevelSegments: z.number().int().positive(),
      bevelWidth: z.number().positive(),
    }),
  }),
  lightRig: z.object({
    key: z.object({ color: hexColorSchema, energy: z.number().positive() }),
    fill: z.object({ color: hexColorSchema, energy: z.number().positive() }),
    rim: z.object({ color: hexColorSchema, energy: z.number().positive() }),
    ambient: hexColorSchema,
  }),
  cameras: z.object({
    'ipad-landscape': cameraSchema,
    'phone-portrait': cameraSchema,
  }),
  characters: z.object({
    turtle: characterSchema,
    child: characterSchema,
    narrator: characterSchema.optional(),
  }),
  budgets: z.object({
    maxTrianglesPerScene: z.number().int().positive(),
    maxPackageBytes: z.number().int().positive(),
  }),
});

export type StyleBible = z.infer<typeof styleBibleSchema>;
