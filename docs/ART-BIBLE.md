# Art Bible: Aby Little Book

**Status:** Provisional 1 — derived from an executed Blender spike  
**Applies to:** Library frame and *The Starlight Rescue*  
**Primary art direction:** Layered soft-clay diorama  
**Primary platform:** iPad landscape  
**Secondary layout:** Phone portrait  
**Last updated:** 2026-08-11

## 1. Purpose

This Art Bible is the production source of truth for the visual identity of the private family prototype. It governs:

- The celestial bookshelf and library frame
- Portal book covers and keepsakes
- Aby, Maya, Niko, Lumi, and Lumi's family
- Story environments, props, materials, lighting, and composition
- Web-rendered story panels, typography, ribbons, tabs, and art-adjacent controls
- Blender scene construction and layered web exports
- Character and environmental motion language

It converts the approved Blender spike direction into repeatable rules. It does not approve the representative scene as final production art.

## 2. Authority and Dependencies

Use the following documents together:

1. [`PRD.md`](./PRD.md) — product requirements and scope
2. [`STORY-SPEC.md`](./STORY-SPEC.md) — narrative, scene, and interaction intent
3. [`UX-SPEC.md`](./UX-SPEC.md) — behavior, hierarchy, layout, and accessibility
4. [`BLENDER-SPIKE-BRIEF.md`](./BLENDER-SPIKE-BRIEF.md) — technical-art experiment definition
5. [`SPIKE-RESULT.md`](../art/spikes/share-the-light/notes/SPIKE-RESULT.md) — evidence and conditions from the executed spike
6. This Art Bible — visual production rules

If a visual idea conflicts with story comprehension, child usability, localization, accessibility, or performance, those requirements take priority over decoration.

## 3. Validation Status

The soft-clay direction has:

- Been selected from paper-diorama, soft-clay, and miniature-toy look tests
- Been approved by the parent with composition refinements
- Produced independent PNG and WebP layers
- Recomposed successfully in Chromium at iPad and phone dimensions
- Preserved a readable text-safe region and clear helping action

The direction still requires:

1. Unprompted observation with the child
2. Browser and offline validation in Safari on the target iPad
3. Maya and Niko character-model approval
4. A second production scene to establish a sustainable scene-time budget

Until the first two gates pass, this document remains provisional.

## 4. Visual North Star

### 4.1 Concept

**A handmade celestial story theatre, softly lit before bedtime.**

The library feels like a familiar reading nook touched by quiet magic. Opening a book reveals a dimensional clay world arranged with the care of a miniature stage. The experience should feel crafted, calm, warm, and emotionally safe.

### 4.2 Core principle

> A picture book brought gently to life—not a game rendered as a book.

### 4.3 Memorable signature

The product's signature is the transition between two material worlds:

- A midnight-painted wooden bookshelf with tiny embedded stars
- Layered portal covers that open into softly sculpted story worlds
- A warm handmade-paper panel that keeps reading calm and legible

### 4.4 Emotional adjectives

- Warm
- Tender
- Curious
- Courageous
- Crafted
- Spacious
- Reassuring
- Quietly magical

### 4.5 The work must not feel

- Glossy, plastic, or toy-commercial
- Hyperactive or arcade-like
- Photorealistic
- Dark, threatening, or lonely for long periods
- Mechanically perfect or sterile
- Visually crowded
- Like generic purple-gradient science-fiction UI

## 5. Library and Story-World Relationship

### 5.1 Stable library frame

The bookshelf, reading controls, typography relationship, interaction feedback, and keepsake language remain consistent across the library.

### 5.2 Book-specific worlds

Each future book may have its own controlled palette, environment motifs, and mood. It does not need to use soft clay unless adopted after later validation. Every book must still preserve:

- The library's calm visual hierarchy
- Large child-safe targets
- Web-rendered readable text
- Restrained, purposeful motion
- Layered and responsive composition
- Clear distinction between story content and controls

For the first prototype, all story art uses the approved soft-clay direction.

## 6. Shape Language

### 6.1 Primary forms

- Rounded spheres, capsules, softened cylinders, and broad arcs
- Chunky silhouettes readable at small display sizes
- Slight asymmetry that suggests hand shaping
- Large, simple masses before small details
- Soft transitions rather than sharp corners

### 6.2 Form hierarchy

1. Character silhouette and pose
2. Current narrative action or interactive prop
3. Large environmental framing forms
4. Small atmospheric details

### 6.3 Edges

- Bevel all child-facing hard-surface forms enough to catch soft highlights
- Avoid needle points, blade-like shapes, and aggressive mechanical edges
- Crystals may taper, but their tips remain rounded
- Asteroids are lumpy and garden-like, never weapon-like

### 6.4 Detail density

Use one or two memorable details per object. Do not add panels, bolts, seams, labels, or greebles merely to make space technology appear complex.

## 7. Soft-Clay Material Language

### 7.1 Surface character

Surfaces use a subtle crafted texture:

- Predominantly matte
- Gently uneven at close inspection
- Broad, soft highlight rolloff
- Slight variation in large surfaces
- No visible fingerprints
- No deep dents, cracks, scratches, or dirty wear
- No high-frequency procedural noise that flickers after downscaling

### 7.2 Material contrast

Most materials remain matte. Limited contrast is reserved for:

- Helmet visors: softly reflective, never mirror-like
- Lamp rings and small hardware: low metallic response
- Magical light: emission and web-side bloom
- Eyes: slightly smoother for clarity, without a wet realistic appearance

### 7.3 Roughness ranges

| Material family | Provisional Blender roughness |
|---|---:|
| Clay skin and hair | 0.68–0.78 |
| Cloth-like clay suit | 0.72–0.82 |
| Moon and asteroid ground | 0.82–0.92 |
| Lumi body | 0.74–0.82 |
| Painted shelf wood | 0.68–0.82 |
| Helmet visor | 0.24–0.34 |
| Lamp metal | 0.38–0.48 |

These ranges are starting constraints, not substitutes for reviewed renders.

## 8. Core Color System

### 8.1 Color roles

The system uses dark, quiet environments; pale readable characters; and a small number of warm guiding lights. Warm gold means help, welcome, discovery, or safe progress. It must not be used as a score or currency color.

### 8.2 Validated story colors

The following sRGB values are visual handoff approximations of the validated Blender materials. The named Blender materials in the selected source file remain authoritative for rendered assets.

| Role | Approximate sRGB | Source material |
|---|---|---|
| Deep space navy | `#222C52` | `MAT_Navy` |
| Moon violet | `#857AA4` | `MAT_Moon` |
| Moon highlight | `#A69AC0` | `MAT_Moon_Light` |
| Pale astronaut suit | `#ECF2FC` | `MAT_Aby_Suit` |
| Aby coral | `#FD936F` | `MAT_Aby_Trim` |
| Visor blue | `#5981A2` | `MAT_Visor` |
| Lumi lavender | `#A68ECA` | `MAT_Lumi` |
| Lumi belly | `#CDBAE3` | `MAT_Lumi_Belly` |
| Lamp gold | `#FAC559` | `MAT_Lamp_Gold` |
| Star cream | `#FFEAAF` | `MAT_Stars` |
| Contact violet | `#35244D` | `MAT_Contact_Shadow` |

Do not copy sRGB hex values into Blender as linear values. Preserve the source material definitions or perform correct color-space conversion.

### 8.3 Library and web colors

| Token | Value | Use |
|---|---|---|
| `shelf-midnight` | `#111B3B` | Painted shelf and quiet surrounds |
| `shelf-brass` | `#D6A84F` | Hinges, small trim, and warm details |
| `paper-warm` | `#FFF4DA` | Story panel surface |
| `paper-shadow` | `#6E5370` at low opacity | Panel integration shadow |
| `ink-plum` | `#3B2746` | Story text |
| `focus-gold` | `#F6C85F` | Focus and selected accents |
| `word-highlight` | `#FFE3A3` | Tapped-word surface |
| `aby-coral` | `#F58A70` | Aby's interface accent |
| `maya-teal` | `#45B8AD` | Maya's interface accent |
| `niko-sunflower` | `#F2C14E` | Niko's interface accent |

All web color pairings require WCAG AA verification at implementation size.

## 9. Astronaut Design System

### 9.1 Shared construction

Aby, Maya, and Niko use the same reusable suit and helmet system. This keeps production feasible and presents all three as equally capable.

Shared traits:

- Young-child proportions, approximately 3.25–3.75 heads tall in the suit
- Large round helmet framing a clearly visible face
- Pale blue-white suit body
- Rounded boots, gloves, backpack, and joints
- One fixed authored accent color per astronaut
- Equivalent visual detail and screen prominence
- No rank markings, combat equipment, or gender-coded equipment

The shared base may be adjusted subtly for hair clearance and facial silhouette, but no astronaut receives a more elaborate or powerful suit.

### 9.2 Aby

| Attribute | Canon |
|---|---|
| Identity | Southeast Asian child |
| Pronouns | he/him/his |
| Skin | Warm medium-brown |
| Hair | Straight black hair with a soft side-swept shape |
| Eyes | Dark brown |
| Accent | Coral-orange |
| Visual impression | Warm, attentive, quietly confident |

The executed spike is Aby's provisional model reference. Production should refine anatomy, hand contact with props, and facial posing without changing his identity.

### 9.3 Maya

| Attribute | Canon |
|---|---|
| Identity | Australian child; no unstated ethnic heritage is assigned |
| Pronouns | she/her/her |
| Skin | Light warm skin |
| Hair | Wavy auburn-brown hair, contained safely within the helmet |
| Eyes | Brown |
| Distinguishing detail | Gentle freckles across the upper cheeks and nose |
| Accent | Clear teal |
| Visual impression | Curious, observant, kind |

Maya's nationality must not be represented through stereotypes, flags, slang, or costume. Her authored appearance is visual characterization, not a claim about what Australians generally look like.

### 9.4 Niko

| Attribute | Canon |
|---|---|
| Identity | Chinese child |
| Pronouns | he/him/his |
| Skin | Light-medium warm skin |
| Hair | Straight black hair with a distinct soft fringe |
| Eyes | Dark brown |
| Accent | Sunflower yellow |
| Visual impression | Thoughtful, gentle, determined |

Niko must be individualized through silhouette, expression, and hair design rather than exaggerated ethnic markers.

### 9.5 Equal representation

- Portrait cards use identical scale, lighting, framing, and detail
- Names use equal typographic emphasis
- No astronaut is preselected on first use
- Poses communicate the same competence and warmth
- Never use skin color, accent color, or gender as shorthand for personality

### 9.6 Character-production gate

Before Maya or Niko appears in a production scene, approve:

1. Front three-quarter neutral portrait
2. Full-body neutral pose in the shared suit
3. Caring, uncertain, delighted, and determined expressions
4. Small-size portrait-card test
5. Side-by-side trio test for equal weight and clear distinction

These are character validation renders, not additional story scenes.

## 10. Astronaut Pose and Expression Language

### 10.1 Pose principles

- Use open, readable gestures
- Keep hands visible when they carry narrative meaning
- Aim the face and eyes toward the current story focus
- Show courage through careful forward movement, not heroic dominance
- Approach Lumi at Lumi's level whenever possible
- Maintain a stable, safe center of gravity

### 10.2 Expression set

| Emotion | Visual treatment |
|---|---|
| Calm attention | Relaxed brows, soft closed smile, focused eyes |
| Curiosity | Slight head tilt, lifted brows, open posture |
| Uncertainty | Small mouth, gently raised inner brows; no panic |
| Determination | Focused gaze, upright posture; no angry brows |
| Care | Soft eyes, slight lean toward Lumi, open hand |
| Delight | Broader smile and lifted cheeks; avoid extreme squash |

### 10.3 Avoid

- Photoreal facial anatomy
- Large toothy grins
- Exaggerated fear, tears, or distress
- Superhero stances
- Pointing or looming over Lumi during helping scenes
- Eye directions that do not match the focal action

## 11. Lumi and Family

### 11.1 Lumi's form

Lumi is a small living alien, not a mascot button. Lumi uses:

- A round lavender body
- Short limbs
- Two soft antennae
- Large readable eyes
- A pale lavender belly area
- A small mouth capable of restrained expression
- A silhouette distinct from the astronauts and all machines

Lumi should appear huggable and alive without resembling a plush toy advertisement.

### 11.2 Glow states

| State | Treatment |
|---|---|
| Light gone out | Matte lavender body, very faint cool internal response |
| Reassured near lamp | Lavender identity retained; subtle warm edge and reflected lamp light |
| Reunited | Lavender shifts into a golden-violet internal glow, brightest at the torso and face |
| Shelf keepsake | Calm restored glow at reduced intensity; one tap may prompt a small wave and glow |

The lamp guides Lumi but does not repair Lumi. Lumi's full glow returns only upon seeing the waiting family.

### 11.3 Lumi's family

- Use Lumi's round body, antenna, and glow grammar
- Vary height, antenna curve, and lavender-to-violet hue slightly
- Keep the group small and immediately readable as welcoming family
- Arrange an open space for Lumi rather than enclosing or crowding Lumi
- Do not assign dialogue bubbles or introduce competing character stories

## 12. Machines and Props

### 12.1 Non-anthropomorphic rule

Rockets, lamps, spacecraft, maps, controls, and other machines:

- Have no faces
- Have no voices
- Have no emotions or personality
- Do not move as though independently alive
- May respond mechanically to a child's touch

Friendly living characters may be astronauts, aliens, or animals. Machines remain tools and environments.

### 12.2 Star lamp

The star lamp is an ordinary handheld astronaut tool with a warm purpose:

- Rounded ring-and-handle construction
- Non-living star-shaped light core
- Low-metallic warm gold frame
- Clear silhouette at target size
- Light path aimed from astronaut toward Lumi
- Mechanical click followed by a soft light response

Do not turn the star core into eyes, a mouth, or a character emblem.

## 13. Environment Language

### 13.1 Shared space

- Deep navy space rather than pure black
- Sparse cream stars placed with deliberate negative space
- Violet ground forms and cool ambient fill
- Warm light reserved for story meaning
- Depth created with overlapping layers, scale, and haze—not dense detail

### 13.2 Route A — Glowing Asteroid Garden

**Palette:** violet, coral, cyan, with restrained warm-gold guidance.

Visual grammar:

- Rounded clustered asteroids
- Soft crystal growths with rounded tips
- Garden-like repetition and curved paths
- Coral and cyan accents embedded in violet forms
- Denser foreground framing than Route B
- Wonder without maze-like threat

### 13.3 Route B — Singing Starfield

**Palette:** deep blue, teal, and warm gold.

Visual grammar:

- Open negative space
- Long gentle arcs and repeated light rhythms
- Sparse star clusters rather than asteroid masses
- Teal path traces and warm-gold responsive notes
- Broader horizontal flow than Route A
- Music suggested through visual rhythm, never literal cartoon faces on stars

### 13.4 Lumi's moon

- Resting place: cool violet, quiet, and sheltered
- Family moon: warmer gold-violet light and more welcoming depth
- Rounded hollows and ground forms
- No jagged cliffs, dangerous voids, or injury cues

## 14. Lighting

### 14.1 Base setup

- Broad soft key light for readable form
- Cool navy-violet environmental fill
- Subtle rim light to separate silhouettes
- Motivated warm light from the lamp or destination
- Soft contact shadows that anchor characters without heavy darkness

### 14.2 Face readability

Faces must remain readable at final CSS display size. Helmet shadows may frame the face but must not obscure eyes, mouth, or skin-tone distinction.

### 14.3 Contrast limits

- Avoid crushed black shadows
- Avoid clipped white suit highlights
- Avoid glossy pinpoints on large surfaces
- Keep atmospheric stars dimmer than the active lamp or story target
- Do not use strobing, flashing, or rapid exposure changes

### 14.4 Warm-light semantics

Warm gold indicates shared guidance, welcome, and connection. It is strongest at:

- The star lamp
- Lumi's family moon
- Lumi's restored glow
- Completion and keepsake transitions

## 15. Composition

### 15.1 Narrative priority

Every scene must remain understandable before optional interaction. The still composition communicates:

1. Who is present
2. What they are doing
3. What deserves attention
4. Where the text belongs

### 15.2 iPad landscape spread

- Author at 2048 × 1536 master size for the prototype
- Treat the center fold at x = 1024 as a protected compositional seam
- Keep faces, required choices, and interactive targets away from the fold
- Reserve one deliberate left- or right-page text region
- Use the opposite page for primary narrative action where practical
- Let environmental forms bridge the fold without placing critical detail on it

The validated Spread 08 template uses:

- Text-safe bounds: x 96–856, y 210–970
- Character-safe area beginning near x 900
- Action staged primarily on the right page

These coordinates are evidence from one scene, not a universal template. Every spread requires authored safe regions.

### 15.3 Phone portrait

- Author a separate 1080 × 1920 camera from the same Blender scene
- Recompose rather than center-cropping the iPad view
- Reserve a lower or otherwise authored region for the text panel
- Permit tighter character crops while retaining faces, action, and target
- Review every phone camera independently

### 15.4 Text-safe region

The art beneath the text panel should be calm, low contrast, and free of essential content. The panel must never obscure:

- A face
- Lumi
- A required route target
- The current optional target
- The emotional gesture between characters

## 16. Story Text Panel

### 16.1 Material

Use warm handmade paper:

- Base color near `paper-warm`
- Opaque enough to guarantee contrast
- Softly irregular contour
- Restrained paper grain
- Small warm inner variation
- Low, diffuse integration shadow

The panel is part of the book surface, not a floating application modal.

### 16.2 Avoid

- Frosted glass
- High blur
- Glossy borders
- Heavy drop shadows
- Pure white rectangles
- Ornate frames
- Animated or sparkling panel decoration while reading

### 16.3 Responsive behavior

- Panel contour may adapt to its authored safe region
- English and Indonesian use the same visual weight
- Indonesian text must not be shrunk below the readable minimum to preserve a decorative shape
- Revise prose or safe region before introducing scrolling

## 17. Typography

### 17.1 Provisional families

| Role | Candidate | Use |
|---|---|---|
| Story prose | Literata | One or two story sentences and bookish headings |
| Interface | Nunito | Controls, astronaut names, language, parent settings, and statuses |

Bundle approved font files locally so reading and interface text remain available offline. Verify redistribution licenses before committing font files.

### 17.2 Story prose

- Approximate iPad range: 28–36 CSS px, validated physically
- Comfortable line height: approximately 1.4–1.55
- Short line length suitable for emerging readers
- Regular or medium weight
- Dark plum ink on warm paper
- Sentence case; never all caps
- No justified spacing
- No decorative swashes in body text

### 17.3 Interface typography

- Rounded and friendly without appearing babyish
- Medium or semibold for primary controls
- Sentence case for labels
- Avoid condensed styles
- Use numerals only where they serve adults; do not display scores or completion percentages to the child

### 17.4 Localization

- Display one language at a time
- Preserve names Aby, Maya, Niko, and Lumi in both languages
- Never use national flags as the primary language indicator
- Test all final strings in both English and Indonesian
- Do not bake titles, prose, route labels, or control text into rendered artwork

## 18. Bookshelf

### 18.1 Material direction

The celestial reading nook uses midnight-painted wood:

- Deep navy painted grain
- Broad softened shelf edges
- Slightly worn high points, never distressed or dirty
- Warm brass hinges and small details
- Sparse embedded star lights
- Warm pools of light around books and keepsakes

The shelf should feel crafted and familiar before it feels fantastical.

### 18.2 Composition

- One portal book is the dominant object in the prototype
- Keep language and parent controls visually tertiary
- Reserve a natural shelf location for Lumi after completion
- Before completion, do not show a locked silhouette or empty award pedestal
- Do not present the shelf as a rectangular application grid

### 18.3 Atmospheric motion

- One settling glimmer may occur when the shelf first appears
- A few embedded stars may shift gently once, not continuously
- Avoid constant twinkling, floating dust overload, and parallax tied to device motion

## 19. Portal Book Covers

### 19.1 Layered portal construction

Each cover acts like a tiny dimensional stage:

- Foreground cover frame
- Midground character or meaningful prop silhouette
- Background world layer
- One restrained glow or depth cue
- Web-rendered localized title

The cover previews a world's identity without playing a trailer.

### 19.2 *The Starlight Rescue* cover

Provisional motifs:

- Star lamp as the central warm symbol
- Aby, Maya, or Niko represented without privileging one default astronaut
- Violet moon and deep navy space
- Subtle hints of both route environments
- Small Lumi glow that does not reveal the completion keepsake state

The final cover solution must accommodate the selectable astronaut fairly. Valid approaches include a neutral astronaut silhouette, rotating the chosen authored portrait only after selection, or centering the lamp and Lumi rather than one child.

### 19.3 Cover motion

- New state: one slow glimmer after shelf settle
- In progress: visible physical bookmark, no percentage
- One route complete: one quiet motif from the undiscovered route may appear
- Both routes complete: calm resting state
- No alert badges, exclamation marks, lock icons, or looping animation

## 20. Keepsake Language

Lumi's shelf presence is a resident of the story world, not a reward token.

- Preserve Lumi's approved proportions and golden-violet restored state
- Reduce glow intensity so the book remains the shelf's focal object
- Place Lumi naturally on or beside the shelf
- One direct tap may prompt a small wave and single glow
- No bouncing, confetti, coins, points, or badge frames
- The ending-to-shelf transition should visually carry Lumi's glow between spaces

## 21. Controls, Ribbons, and Tabs

### 21.1 General language

- Shapes feel cut from paper, cloth ribbon, painted wood, or softly cast brass
- Controls remain visually flatter and simpler than story characters
- Icons use broad rounded strokes and filled silhouettes
- State changes use shape, label, position, or contrast in addition to color

### 21.2 Bookmark progress ribbon

- Narrow cloth-like ribbon integrated into the book
- Ten subtle positions, not numbered milestones
- Current position visible through length or notch placement
- No percentage, score, or celebratory burst

### 21.3 Navigation edge tabs

- Persistent but quiet page-edge shapes
- Large invisible hit region beyond the visible tab
- Pressed state uses a small inward movement and contrast change
- Never compete with route choices or optional targets

### 21.4 Shelf-exit bookmark

- Looks physically attached to the book
- Holding fills or illuminates the tab gradually
- Release before completion returns it calmly to rest
- Reduced-motion mode uses a static progress treatment

### 21.5 Focus and selected states

- Focus-visible ring uses warm gold plus a dark outer separation where required
- Tapped words use a warm paper-gold highlight and slight lift
- Never rely on glow alone to communicate a selected state

## 22. Motion Language

### 22.1 Principles

- Motion follows touch or a meaningful transition
- Resting story pages remain almost still
- Movement is soft, short, and causally connected
- Characters do not loop idle performances while the child reads
- Text never animates word by word

### 22.2 Provisional timing ranges

| Motion | Duration | Character |
|---|---:|---|
| Press response | 100–160 ms | Immediate and contained |
| Word highlight in | 100–140 ms | Soft lift |
| Word return | 250–400 ms | Gentle settle |
| Optional interaction | 450–700 ms | Clear cause and response |
| Delayed hint | 900–1200 ms | One restrained pulse or gleam |
| Page turn | 350–500 ms | Physical but fast |
| Portal open/close | 700–1000 ms | Magical threshold |
| Ending-to-shelf | 1000–1600 ms | Emotional bridge |

Use an ease-out curve near `cubic-bezier(0.22, 1, 0.36, 1)` for touch responses as an implementation starting point. Page turns may require a separate curve after device testing.

### 22.3 Character motion

- Blink at most once as a direct acknowledgement, not on an endless timer
- Waves use one small arc
- Lumi's glow expands and settles rather than flashing
- Astronaut movement remains weighty enough to feel grounded
- Do not use squash-and-stretch so strongly that clay characters become rubbery

### 22.4 Reduced motion

- Replace page turns with short crossfade or immediate change
- Replace pulses with static outline or contrast
- Remove travel paths while preserving selected destinations
- Retain all content and interactions

## 23. Light and Interaction Effects

### 23.1 Hybrid approach

The successful spike combined:

- Blender-rendered effect layers
- CSS `screen` blending
- A small tunable CSS radial bloom around the lamp target

This hybrid approach is provisionally approved for subtle response effects. It avoids rerendering an entire scene for minor web feedback adjustments.

### 23.2 Effect rules

- Keep effects attached to a meaningful source
- Use warm amber for the star lamp
- Preserve the underlying object silhouette
- Avoid hard cones, opaque discs, shell outlines, and noisy transparent spheres
- Avoid effects extending under the story panel
- Verify at final CSS display size; full-resolution inspection alone is insufficient

### 23.3 Inactivity hints

- Begin only after the UX-defined delay
- Use one moving gleam, breath, or static emphasis
- Stop after acknowledgement
- Pause during speech and page transitions
- Never block progress

## 24. Blender Production Standard

### 24.1 Baseline

- Blender 5.2.0 LTS in the executed environment
- Eevee-first rendering
- Engine identifier detected as `BLENDER_EEVEE`
- Do not assume `BLENDER_EEVEE_NEXT`
- Detect color-management capabilities before assigning view transforms or looks

### 24.2 Required collection families

Use semantic, independently renderable collections:

```text
CAMERAS
LIGHTS
WORLD
BG_<environment>
ENV_<environment>
CHAR_<character>
PROP_<object>
FG_<environment>
FX_<effect>
HOLDOUTS_SHADOWS
GUIDES_SAFE_REGIONS
```

### 24.3 Naming

Use stable English machine identifiers even when content is bilingual:

```text
<book>-sp<spread>-<layout>-<asset>.<format>
```

Example:

```text
starlight-sp08-ipad-char-aby.webp
```

### 24.4 Cameras

Every spread requires:

- One authored iPad landscape camera
- One authored phone portrait camera
- Registered full-canvas output for all layers in each layout
- Recorded text-safe, character-safe, fold, and target bounds

### 24.5 Source integrity

- Retain reusable character, prop, material, light, and camera components
- Store safe-region guides as viewport-only or disabled render collections
- Save a stable production source before batch export
- Record Blender version, render engine, samples, camera, visible collections, render time, and size

## 25. Layered Export Standard

### 25.1 Logical order

Use the validated semantic stack as a starting point:

| Order | Layer |
|---:|---|
| 0 | `bg-space` |
| 10 | `env-*` |
| 20 | `shadow-integration` |
| 30 | `char-astronaut` |
| 40 | `char-lumi` or other companion |
| 50 | `prop-*` interactive target |
| 60 | `fg-*` |
| 70 | `fx-*` response layer |
| 80 | `fx-*` shared glow |

Add or omit logical layers only when the scene requires it. Preserve full-canvas registration.

### 25.2 Formats

- PNG with straight transparency is the lossless master
- WebP is the prototype delivery candidate
- Quality 82 is the validated spike starting point, not a universal mandate
- Retain flattened rest and response references for visual comparison
- Keep story text and interface labels out of rendered art

### 25.3 Manifest

Each export batch records:

- Scene and asset IDs
- Layout class
- Dimensions and canvas bounds
- Layer order
- Alpha mode
- Rest or response state
- Interaction role
- Camera
- Visible collections
- Safe regions and target bounds
- Render duration
- PNG and delivery-variant sizes
- Render settings and revision

### 25.4 Browser verification

For every scene and layout:

1. Load all delivery layers in a real browser
2. Confirm natural dimensions and complete loading
3. Capture rest state
4. Activate each interaction and capture response state
5. Check alpha edges, seams, ordering, and target alignment
6. Check English and Indonesian panel fit
7. Check reduced-motion behavior
8. Check the target iPad in Safari before production approval

## 26. Covers, Text, and Localization in Rendered Assets

Do not bake any language-dependent text into Blender output, including:

- Story prose
- Book titles
- Route names
- Character names
- Buttons
- Parent instructions
- Progress labels

Rendered symbols must be understandable without English-only letterforms. Web text overlays provide localization, semantics, accessibility, and responsive fitting.

## 27. Accessibility and Child-Safety Rules

- Primary child targets aim for at least 56 × 56 CSS pixels
- Illustrations cannot be the sole background for text contrast
- Color never acts as the only state indicator
- Characters and required actions remain readable with effects disabled
- Decorative layers receive empty alternative text
- Meaningful scene descriptions belong in semantic page content, not filenames
- Avoid flashes, rapid scale changes, and surprise movement
- Avoid severe distress, injury, threatening pursuit, weapons, or hostile expressions
- Ensure optional discoveries remain visibly optional and never block the page turn

## 28. Do and Do Not

### Do

- Start with silhouette, emotion, and text-safe composition
- Use warm light to express care and connection
- Preserve negative space
- Make choices equal in scale and visual warmth
- Review renders at actual display size
- Create both iPad and phone cameras
- Isolate interactive targets and response effects
- Reuse approved models and materials
- Let small handmade variation support warmth

### Do not

- Add faces or personalities to machines
- Add dense science-fiction detail
- Use glossy toy-plastic surfaces broadly
- Center critical content on the fold
- Bake text into art
- Assume one crop works for all devices
- Use effects to hide unclear staging
- Make one astronaut appear canonical or more capable
- Make Lumi's dim state look injured or frightening
- Use constant atmospheric motion
- Treat the keepsake as currency or achievement UI

## 29. Scene Review Checklist

Before approving a scene for export, verify:

### Story and emotion

- [ ] The still image communicates the spread's purpose
- [ ] Character gaze and pose support the focal action
- [ ] The emotional tone is warm and age-appropriate
- [ ] Optional interaction is not required to understand the scene

### Composition

- [ ] Text-safe region is deliberate and recorded
- [ ] Faces, Lumi, and targets remain clear of the panel
- [ ] Critical content clears the iPad center fold
- [ ] iPad and phone cameras are independently reviewed
- [ ] Navigation edges do not overlap targets

### Visual system

- [ ] Shapes are rounded and silhouettes are readable
- [ ] Material response remains matte and softly crafted
- [ ] Warm-gold light retains its guidance meaning
- [ ] Atmospheric detail remains tertiary
- [ ] Machines remain non-anthropomorphic

### Export

- [ ] Semantic collections are named and isolated
- [ ] PNG masters align on a shared canvas
- [ ] WebP candidates preserve clean alpha
- [ ] Manifest is complete
- [ ] Browser rest and response screenshots pass
- [ ] English and Indonesian panels fit
- [ ] Reduced-motion response remains understandable

## 30. Character Review Checklist

- [ ] Identity matches the authored definition
- [ ] Face remains legible through the visor
- [ ] Hair fits naturally within the helmet
- [ ] Accent color is correct and not the sole identity cue
- [ ] Proportions read as a young child, not toddler or adult
- [ ] Expression is restrained and emotionally clear
- [ ] Hands and held props make believable contact
- [ ] Trio comparison gives equal scale, detail, and competence
- [ ] No cultural stereotype substitutes for individual design

## 31. Pending Decisions and Validation Gates

The following remain open:

1. Child's unprompted response to the soft-clay scene
2. Safari and offline behavior on the target iPad
3. Final Maya and Niko model approval
4. Final font weights and physical-device type scale
5. Final bookshelf composition and portal-cover production test
6. Route A and Route B environment look tests
7. Sustainable per-scene production-time budget
8. Whether most response glows remain hybrid Blender/CSS or become CSS-only
9. Final page-turn and completion-transition timing after implementation

These items may refine this Bible. They do not justify uncontrolled visual drift elsewhere.

## 32. Change Control

### 32.1 Requires Art Bible revision

- Changing the soft-clay direction for the first story
- Changing an astronaut's authored identity, appearance, or accent
- Changing Lumi's anatomy or glow transformation
- Changing the global typography pairing
- Changing the library material concept
- Changing the layered export model or primary render engine
- Reinterpreting warm gold away from guidance and connection

### 32.2 May vary per scene without revision

- Pose and expression within the approved language
- Camera placement within responsive rules
- Environmental arrangement within the route grammar
- Exact number of decorative stars, rocks, or crystals
- Strength of a reviewed glow within accessibility and hierarchy limits

### 32.3 Approval evidence

When revising a locked rule, record:

- Reason for change
- Before-and-after visual evidence
- Parent decision
- Child observation when relevant
- iPad and phone impact
- Performance and export impact

## 33. Production Source Reference

The current visual reference source is:

```text
art/spikes/share-the-light/source/starlight-sp08-layered-spike.blend
```

Supporting references:

```text
art/spikes/share-the-light/look-tests/02-soft-clay.png
art/spikes/share-the-light/responsive-proofs/ipad-webp-rest.png
art/spikes/share-the-light/responsive-proofs/ipad-webp-response.png
art/spikes/share-the-light/responsive-proofs/phone-webp-rest-id.png
art/spikes/share-the-light/responsive-proofs/phone-webp-response-id.png
art/spikes/share-the-light/manifest/asset-manifest.json
```

The Blender source defines the validated rendered material values. This document defines their intended meaning, extension, and production boundaries.
