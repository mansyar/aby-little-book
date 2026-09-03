# 3D Auto-Review Procedure

How a produced package earns its way into the app. Every gate below runs in
CI (`pnpm validate`); the vision pass runs wherever Blender and the
slice renderer are available, and its scores are recorded as evidence.

## 1. Byte gates (automatic, `scripts/validate-assets.mjs`)

- Every `art/manifest/*.json` parses; every `glb`/`ktx2` file exists.
- SHA-256 of every byte matches the manifest; tampered or missing bytes
  fail the build.
- Triangle counts fit per-scene budgets; `bakedText` is always false;
  pivots are `{x, y, z}`; tap targets carry bilingual labels + positions.
- Manifest carries builder provenance
  (`blender` / `builderSha` / `styleSha` / `seed`).
- Declared `totalBytes` equals the unique files on disk.

## 2. Rule gates (automatic, `src/scene/manifestGates.test.ts`)

- Manifest satisfies the Zod package schema (GLB sources, KTX2 textures,
  pivots inside bounds, unique tap targets, story agreement).
- No scene budget exceeds the style bible (`scene-budget-exceeds-bible`);
  no package exceeds the bible byte envelope
  (`package-bytes-exceed-bible`).

## 3. Preview renders (headless Blender, `tools/render_previews.py`)

Per scene × layout (`ipad-landscape`, `phone-portrait`) × pose:

- **rest**: the exact bible camera — what the reader frames at arrival.
- **response**: the same camera pushed 10% closer — the largest motion
  any tap response may echo in-app.

Output: `art/blender_out/previews/<scene>_<layout>_<rest|response>.png`.

## 4. Vision pass (automated scoring + human approval)

Score each still 0–5 on:

- **Seams**: no visible layer edges, alpha fringes, or floating geometry.
- **Grounding**: every prop sits on a surface; nothing floats or clips.
- **Text-safe**: faces, relationships, and tap targets sit clear of the
  reader's text panel region for that layout.
- **Calm**: lantern-glow warmth, no harsh contrast, no clutter.
- **Bilingual fit**: the DOM prose panel (EN and ID) overlaps no key
  subject in either layout.

Pass bar: ≥4 on every axis, both layouts, both poses. Anything lower
returns to the builder parameters (never a hand-edited `.blend` or GLB) —
adjust seed, spacing, or bible values, rebuild, re-render.

## 5. Reduced-motion equivalence

The `response` pose is a still: under reduced motion the app cross-fades
rest → response with no travel. If the response still reads clearly next
to the rest still, the motion equivalent is approved.
