# Blender Spike Result: Share the Light

**Decision:** Proceed with conditions  
**Executed:** 2026-08-11  
**Representative scene:** Spread 08 — Share the Light / Berbagi Cahaya  
**Selected look:** Soft clay  
**Selected astronaut:** Aby  
**Render engine:** Blender Eevee  
**Blender version:** 5.2.0 LTS

## 1. Executive result

The spike demonstrated that Blender MCP can produce a warm, reusable, layered story scene that recomposes correctly in a browser at both iPad-landscape and phone-portrait layouts.

The pipeline should proceed to an Art Bible and production planning, subject to two remaining family-device validation gates:

1. Observe the child’s unprompted response to the selected scene.
2. Run the browser proof on the target iPad in Safari.

The spike does not approve the scene as final production art. It approves the technical-art direction and records the refinements needed before full-scene production.

## 2. Direction selected

Three inexpensive looks were rendered on identical geometry and staging:

1. Paper diorama
2. Soft clay
3. Miniature toy

Soft clay was selected because it retained rounded warmth and dimensional lighting without the glossy, game-like feeling of the miniature-toy direction. The parent approved the composition with refinement.

The accepted staging keeps:

- A large, quiet text-safe region on the left of the iPad spread.
- Aby offering the handheld star lamp on the right page.
- Lumi close to the lamp and emotionally readable.
- A non-anthropomorphic star lamp with no face or personality.
- A calm navy-and-violet space environment.

## 3. Hypothesis outcomes

| Hypothesis | Result | Evidence |
|---|---|---|
| The visual direction can feel warm and appropriate for ages 4–6 | Partial pass | Parent approved soft clay; child observation remains pending |
| Aby, Lumi, and the lamp remain readable at iPad size | Pass | Full-spread and browser proofs preserve silhouettes and the helping action |
| Reusable models can support consistency | Pass | Named Blender collections, reusable materials, cameras, lights, and character components were retained in the final source |
| Blender can export independent web layers | Pass | Background, environment, shadows, characters, prop, foreground, and response effects were exported independently |
| The layers recompose correctly in a browser | Pass in Chromium | The WebP proof loaded and aligned all nine active layers without visible seams or isolated-alpha artifacts |
| One source scene can support iPad and phone compositions | Pass with refinement | Separate cameras generated readable 4:3 and 9:16 exports; each future scene will require a reviewed phone camera |
| Web delivery size can be practical | Pass for this scene | 22 PNG assets total 28,254,530 bytes; WebP candidates total 817,516 bytes, a measured 97.1% reduction |
| Eevee iteration and export are sufficiently fast | Preliminary pass | Typical layers rendered in roughly 0.6–1.9 seconds; 256-sample response references took roughly 7–8 seconds |

The compression result is unusually favorable because this scene uses large smooth regions and simple forms. It must not be treated as the guaranteed ratio for every story scene.

## 4. Produced artifacts

### Blender checkpoints

- `source/starlight-sp08-proxy.blend`
- `source/starlight-sp08-looktests.blend`
- `source/starlight-sp08-soft-clay-selected.blend`
- `source/starlight-sp08-layered-spike.blend`

### Look tests

- `look-tests/00-proxy-composition.png`
- `look-tests/01-paper-diorama.png`
- `look-tests/02-soft-clay.png`
- `look-tests/03-miniature-toy.png`

### Final layer families

Both iPad and phone layouts include:

- `bg-space`
- `env-moon`
- `shadow-integration`
- `char-aby`
- `char-lumi`
- `prop-lamp`
- `fg-moon`
- `fx-lamp-beam`
- `fx-shared-glow`
- `reference-rest`
- `reference-response`

PNG masters are under `renders/png-master/`. WebP delivery candidates are under `renders/webp-test/`.

### Browser proof

- Interactive proof: `web-proof/index.html`
- iPad rest proof: `responsive-proofs/ipad-webp-rest.png`
- iPad response proof: `responsive-proofs/ipad-webp-response.png`
- Phone Indonesian rest proof: `responsive-proofs/phone-webp-rest-id.png`
- Phone Indonesian response proof: `responsive-proofs/phone-webp-response-id.png`

### Machine-readable manifest

- `manifest/asset-manifest.json`

The manifest records layout class, dimensions, layer order, transparency, interaction state, safe regions, projected lamp target bounds, render times, file sizes, and WebP variants.

## 5. Browser proof findings

The proof uses the exported WebP layers rather than a flattened render. It demonstrates:

- Correct full-canvas registration of independent layers.
- A web-rendered text panel with no story text baked into artwork.
- English and Indonesian whole-text switching.
- A separate 4:3 iPad composition and 9:16 phone composition.
- A transparent lamp hit target.
- Rest and response states.
- A delayed optional-interaction hint.
- Reduced-motion handling.

All expected iPad layers loaded at 2048 × 1536. All expected phone layers loaded at 1080 × 1920.

Chromium was used because WebKit was not installed in the execution environment. This does not replace the required target-iPad Safari check.

## 6. Technical discoveries

### 6.1 Installed Blender API

Blender 5.2.0 LTS exposes the Eevee engine as `BLENDER_EEVEE`, not `BLENDER_EEVEE_NEXT`. Color-managed look options were not available in the installed API, so the pipeline must not assume AgX/look assignments without capability detection.

### 6.2 Response effects

Transparent spherical glow geometry produced visible shells and stochastic noise. Camera-facing UV radial cards were more suitable for export, but the downscaled result remained intentionally subtle.

The successful web treatment combines:

- Blender-exported glow layers.
- CSS `screen` blending.
- A small CSS radial bloom on the interaction target.

This is preferable to rerendering an entire scene for minor interaction-feedback tuning.

### 6.3 Transparent WebP layers

Isolated transparent-asset previews showed faint edge data against the attachment viewer’s black background. Those artifacts did not appear when the same WebP assets were alpha-composited over the scene in Chromium.

Production should still include an automated browser screenshot check for every layered export batch.

### 6.4 Responsive framing

The iPad camera preserves a quiet left-page text region and keeps the action away from the center fold. The phone camera uses a closer character crop and reserves the lower region for text.

One universal crop is not sufficient. Production should retain one authored iPad camera and one authored phone camera per spread while reusing the same scene and models.

## 7. Acceptance-gate assessment

| Gate | Status |
|---|---|
| Exactly one representative story scene | Passed |
| Cheap look tests followed by one refined direction | Passed |
| Soft-clay direction selected by parent | Passed |
| Child appeal observed directly | Pending |
| Aby, Lumi, and lamp readable on iPad | Passed in render and Chromium proof |
| Deliberate text-safe area | Passed |
| Center-fold clearance | Passed after refinement |
| Machines remain non-living | Passed |
| Full independent layer set | Passed |
| PNG masters and WebP candidates | Passed |
| Browser recomposition | Passed in Chromium |
| Target iPad Safari recomposition | Pending |
| Phone responsive proof | Passed with per-scene camera requirement |
| Lamp interaction target and response | Passed in browser proof |
| Reproducible organized Blender source | Passed |
| Rendering and file-size measurements | Passed |
| Sustainable full-story production budget | Not yet established; time categories were not independently instrumented |

## 8. Conditions before production

1. Run the proof on the actual target iPad in Safari, including offline loading if possible.
2. Show the selected scene to the child without explaining which element to tap; record only observational notes.
3. Define a production time budget after one additional scene is built using the reusable Aby, Lumi, lamp, material, and camera conventions.
4. Add final character expression and pose rules to the Art Bible.
5. Standardize transparent WebP browser screenshot verification.
6. Decide whether response glows remain hybrid Blender/CSS or move entirely to CSS for consistency and smaller assets.

## 9. Decision

**Proceed with conditions.**

Blender MCP is suitable for the prototype’s pre-rendered, layered soft-clay artwork. The result supports the core product principle: a picture book gently brought to life rather than a game-like 3D experience.

The next documentation step is a provisional Art Bible based on the selected soft-clay direction. It must mark child approval and target-iPad validation as pending rather than presenting them as established facts.
