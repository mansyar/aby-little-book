# Production Scene Schedule: The Starlight Rescue

**Status:** Schedule 1 — pre-render planning baseline
**Story resource:** `the-starlight-rescue` version `0.1.0` (`src/story/starlight-rescue.ts`)
**Authoritative content:** `docs/STORY-SPEC.md` (Draft 1, 2026-08-11)
**Visual rules:** `docs/ART-BIBLE.md` (Provisional 1)
**Pipeline evidence:** `art/spikes/share-the-light/notes/SPIKE-RESULT.md` and its manifest
**Created:** 2026-08-26

## 1. Purpose

This schedule inventories every scene, state, layout, and locale-fit case that
remains to be produced after the approved Spread 08 vertical slice, fixes the
reuse conventions each batch must follow, and records the provisional
safe-region bounds that every spread must author into its
`GUIDES_SAFE_REGIONS` collection before rendering begins.

It is a planning artifact. It does not approve any scene as final production
art; each batch passes draft-composition review, export validation, and browser
verification under the Art Bible checklists before integration.

### 1.1 Scope

Included: the twelve remaining story scenes (all except the completed
Spread 08 slice), their rest/response states, astronaut variants, safe-region
guides, manifests, and delivery packages.

Excluded from this schedule: bookshelf, portal-cover, and keepsake shelf
presentation, which ship as web-rendered shell UI rather than Blender output,
and the Lumi keepsake *interaction*, which reuses the Spread 10 isolated Lumi
render produced here.

## 2. Fixed production conventions

Every batch reuses these approved conventions. Deviations require an explicit
recorded decision (Art Bible §32).

| Convention | Value |
|---|---|
| Blender | 5.2.0 LTS, engine detected as `BLENDER_EEVEE` |
| Look | Soft-clay diorama, validated material set from the Spread 08 source |
| iPad camera | One authored `CAM_IPAD_SPREAD` per scene, 2048 × 1536 canvas |
| Phone camera | One authored `CAM_PHONE_PAGE` per scene, 1080 × 1920 canvas |
| Masters | Transparent straight-alpha PNG (RGBA); opaque RGB reference composites |
| Delivery | WebP quality 82 starting point, full-canvas registered |
| Response FX | Camera-facing UV radial cards, revision `uv-radial-cards-v4`, 256 samples for response references |
| Naming | `starlight-sp<NN>-<layout>-<asset>.<fmt>` |
| Collections | `CAMERAS`, `LIGHTS`, `WORLD`, `BG_*`, `ENV_*`, `CHAR_*`, `PROP_*`, `FG_*`, `FX_*`, `HOLDOUTS_SHADOWS`, `GUIDES_SAFE_REGIONS` |
| Text rule | No story prose, labels, titles, or route names baked into artwork |

Layer order follows the validated semantic stack (Art Bible §25.1):
`bg-space` 0 → `env-*` 10 → `shadow-integration` 20 → response glow 25 →
`char-astronaut` 30 → `char-lumi` 40 → response beam 45 → interactive target 50
→ `fg-*` 60. Scenes add or omit layers only when the scene requires it, keeping
full-canvas registration.

## 3. Astronaut variant policy

The selected astronaut changes the displayed character (STORY-SPEC §5.1), so
every scene's `char-astronaut` layer is exported in three authored variants:
`char-aby`, `char-maya`, `char-niko`.

- All three share pose, framing, scale, suit construction, and camera per
  layout; identity differs only in skin, hair, freckles, and accent color
  (Art Bible §9).
- Holdout/contact shadows are authored for the shared footprint so the shadow
  layer stays variant-independent.
- The runtime selects the variant matching persisted settings; all three ship
  in the prepared offline package.
- **Gate:** Maya and Niko must pass the Art Bible §9.6 character-validation
  renders (portrait, neutral full body, four expressions, portrait-card test,
  trio test) before either appears in any exported scene. This is Batch 0.

## 4. Safe-region guides before rendering

Each spread authors `GUIDES_SAFE_REGIONS` from these starting bounds, adjusts
them for its composition note, and records final projected bounds per asset in
the export manifest. Spread 08's validated regions are evidence, not a
universal template (Art Bible §15.2).

| Layout | textSafeBounds (x, y, w, h) | characterSafeBounds | Fold |
|---|---|---|---|
| iPad 2048 × 1536 | `[96, 210, 760, 760]` | begin near x 900, action right page | `centerFoldX: 1024` protected |
| Phone 1080 × 1920 | `[72, 1510, 936, 330]` | `[30, 350, 1020, 1080]` | none |

Per-scene composition obligations (from STORY-SPEC scene definitions):

| Scene | Composition obligation |
|---|---|
| S01 | Astronaut and distant signal visible together; text region calm and away from the signal target |
| S02 | Lamp, astronaut face, and text never compete for one region |
| S03 | Dedicated route-target space separate from the panel; both routes equal size/warmth; targets clear of fold and edges |
| A04 | Foreground depth never covers astronaut or text region |
| A05 | Alternate winding gap reads as safe even with interaction skipped |
| A06 | Direction toward the moon survives responsive cropping |
| B04 | Star targets away from navigation edges |
| B05 | Onward path understandable without completing the interaction |
| B06 | Destination moon holds visual weight equal to A06 |
| S07 | Astronaut approaches at Lumi's level; emotion is the focal point; no injury imagery |
| S08 | Validated (Spread 08 slice) — reference only |
| S09 | Family welcomes without crowding Lumi |
| S10 | Clean Lumi silhouette preserved for keepsake extraction |

Interactive targets aim for ≥ 56 × 56 CSS px at display size and never sit
under edge-navigation zones.

## 5. Scene inventory

Thirteen unique scenes serve both routes (7 shared, 3 Route A, 3 Route B).
Every scene ships both layouts, three astronaut variants, and English/
Indonesian panel-fit verification. Word counts are token-resolved maxima;
Indonesian averages longer per word, so fit checks weight the `id` string.

| Scene | Title (en / id) | en–id words | Interaction (req.) | Target | Response FX layers | New environment kit |
|---|---|---|---|---|---|---|
| S01 | A Tiny Signal / Sinyal Kecil | 14–14 | find-tap (no) | signal | signal rings/pulse | Spacecraft interior + Earth |
| S02 | The Star Lamp / Lampu Bintang | 18–14 | reveal (no) | star-lamp | lamp beam pool | Equipment compartment |
| S03 | Two Ways Through Space / Dua Jalan Menembus Angkasa | 15–14 | route-choice (**yes**) | route-map | route-A trace, route-B trace | Map display |
| A04 | The Glowing Garden / Taman Bercahaya | 13–11 | find-tap (no) | crystal | opening motes | Asteroid garden |
| A05 | The Winding Gap / Celah Berliku | 15–10 | find-tap (no) | markings | marking sequence light | Asteroid garden |
| A06 | Lights Point Ahead / Cahaya Menunjuk ke Depan | 14–13 | chain-reveal (no) | garden-light | light sequence | Asteroid garden |
| B04 | The Singing Stars / Bintang-Bintang Bernyanyi | 14–12 | reveal (no) | bright-star | arc + ring | Singing starfield |
| B05 | The Steady Song / Nyanyian yang Teratur | 12–14 | chain-reveal (no) | pattern-star | path response | Singing starfield |
| B06 | A Note Far Away / Sebuah Nada dari Jauh | 16–14 | find-tap (no) | ripple | answer light on moon | Singing starfield |
| S07 | Lumi / Lumi | 18–16 | character-response (no) | lumi | faint glow pulse | Quiet moon hollow |
| S08 | Share the Light / Berbagi Cahaya | 21–17 | reveal (no) | star-lamp | lamp beam + shared glow | **Complete (slice)** |
| S09 | The Warm Moon / Bulan yang Hangat | 16–15 | chain-reveal (no) | family-light | greeting sequence | Warm family moon |
| S10 | Lumi Shines Again / Lumi Bersinar Kembali | 22–20 | character-response (no) | lumi | reunion glow + completion shimmer | Warm family moon |

Panel-fit priority (longest localized prose): **S10, S08, S07**, verified first
in both locales at both layouts during each affected batch's browser pass.

Lumi states required across scenes: dim/resting (S07), reassured near lamp
(S08, done), arriving (S09), reunited/golden-violet (S10), plus one isolated
keepsake render extracted from S10 for shelf transition.

### 5.1 Route-state inventory

| Route state | Affected art |
|---|---|
| `unselected` | No route art shown; S03 map shows both routes equally |
| `asteroid-garden` | A04–A06 active; S03 response state `route-A trace` |
| `singing-starfield` | B04–B06 active; S03 response state `route-B trace` |
| `completed` | No additional scene art; replay discovery is web-rendered |

Both routes converge at S07; no scene art differs by astronaut choice other
than the `char-astronaut` variant.

## 6. Batches

Batches group scenes sharing environment kits so draft compositions are
reviewed before detailed rendering (plan Task: produce scenes in reviewable
batches). Each batch runs: look/composition drafts → parent draft review →
refined render → PNG masters → WebP delivery → manifest → automated validators
→ browser rest/response captures in both locales and layouts.

| Batch | Content | Introduces | Exit gate |
|---|---|---|---|
| 0 | Maya & Niko validation renders + trio test | Two astronaut models | Art Bible §9.6 approval; blocks all exports |
| 1 | S07 budget scene (both layouts, 3 variants) | Quiet moon kit; Lumi dim + response states | Scene checklist passed **and** measured production time recorded against the second-scene budget condition before continuing |
| 2 | S01, S02, S03 opening trio | Spacecraft interior, Earth, compartment, map; dual route-trace responses | Draft review per scene, then full export verification |
| 3 | A04, A05, A06 | Route A garden kit (crystals closed/open, markings) | Route A look test approved first; per-scene gates |
| 4 | B04, B05, B06 | Route B starfield kit (arcs, pattern stars, ripples) | Route B look test approved first; per-scene gates |
| 5 | S09, S10 ending pair | Warm moon kit; Lumi family group; completion shimmer; isolated keepsake render | Keepsake silhouette extraction proven; completion transition hands off cleanly to web |

Sequence rationale: characters unlock variants; S07 establishes the sustainable
time budget on a reuse-heavy scene before volume work; opening trio shares one
interior kit; routes isolate their look tests; the ending introduces the last
new cast members (family) and the keepsake handoff.

## 7. Volume and package estimates

Estimates use the Spread 08 slice (9 delivery layers/layout) as the template
and are re-baselined after Batch 1.

- Per scene: ~10–13 layers per layout including 3 astronaut variants and
  response FX → roughly 20–26 delivery WebPs per scene.
- Twelve remaining scenes: roughly **240–310 delivery WebPs**; PNG masters stay
  outside the runtime image.
- Estimated added prepared-package size: ~5–9 MB total at q82, subject to the
  per-scene measurements and the build-time package-budget validator.
- Render time: spike layers averaged ~0.6–1.9 s (response references ~7–8 s);
  treat as ordering evidence only until the Batch 1 budget measurement lands.

## 8. Verification and open external gates

Automated per batch: schema/reference/hash validators, alpha-edge and dimension
checks, layer-order and safe-region manifest completeness, package budgets,
then deterministic Chromium/WebKit rest/response captures in `en` and `id` at
both layouts (plan Task: verify every scene in real browsers).

Human per batch: parent draft-composition review, Art Bible §29 scene
checklist, §30 character checklist where new characters appear.

External gates owned outside this schedule and still pending from the spike
conditions: target-iPad Safari recomposition/offline proof and the child's
unprompted-response observation (Phase 8 acceptance). These refine — they do
not block — batch production starts.

Open decisions monitored: hybrid Blender/CSS response effects remain the
default; a move to CSS-only glows (Art Bible §31 item 8) would shrink FX layer
counts and will be recorded here if adopted after Batch 1 evidence.
