# Blender Technical-Art Spike Brief: Share the Light

**Status:** Executed — Proceed with conditions  
**Product:** Aby Little Book private family prototype  
**Story:** *The Starlight Rescue* / *Penyelamatan Cahaya Bintang*  
**Representative scene:** Spread 08 — Share the Light / Berbagi Cahaya  
**Selected astronaut:** Aby  
**Primary render engine:** Eevee  
**Primary platform:** iPad, landscape orientation  
**Last updated:** 2026-08-11

**Execution result:** [`../art/spikes/share-the-light/notes/SPIKE-RESULT.md`](../art/spikes/share-the-light/notes/SPIKE-RESULT.md)

## 1. Purpose

This spike determines whether Blender, operated through an AI agent and Blender MCP, can produce appealing, consistent, layered, web-ready storybook artwork at a sustainable level of effort.

The spike is not full art production. It is a constrained technical and visual experiment that produces one approved representative scene and enough evidence to decide whether the proposed Blender-to-web pipeline should be used for the complete story.

The result must answer five central questions:

1. Does the scene feel warm, magical, and appropriate for a child aged 4–6?
2. Can Aby, Lumi, and the star lamp remain clear and emotionally readable at iPad size?
3. Can Blender export clean independent layers that recompose correctly in a browser?
4. Can one composition support both an iPad landscape spread and a phone portrait page?
5. Is the modeling, staging, rendering, export, and revision workflow practical enough to repeat?

## 2. Source Documents

This brief depends on:

- `docs/PRD.md` for product scope, art constraints, and prototype acceptance
- `docs/STORY-SPEC.md` for Spread 08 narrative, interaction, sound, and layer needs
- `docs/UX-SPEC.md` for the two-page reader, text panel, hit areas, responsive crops, and interaction behavior

If this brief conflicts with a product requirement, the PRD takes precedence. If it conflicts with story content, the Story Specification takes precedence. Final visual styling remains subject to the later Art Bible.

## 3. Spike Decision

### 3.1 Selected moment

The spike will build Spread 08, in which Aby offers Lumi the warm star lamp and invites Lumi to travel together.

**English story text**

> Aby held out the warm star lamp. “Stay near my light, Lumi. We can go together.”

**Indonesian story text**

> Aby mengangkat lampu bintang yang hangat. “Tetaplah dekat cahayaku, Lumi. Kita bisa pergi bersama.”

The story text is included here for composition testing only. It must be rendered by the web interface and must not be embedded in Blender output.

### 3.2 Why this scene

Spread 08 tests the highest-value requirements together:

- A young astronaut with a readable, caring pose
- Lumi in a dim but safe emotional state
- Cooperation and proximity between two living characters
- A non-living handheld prop with no face or personality
- Warm light against a quiet space environment
- A separately interactive star-lamp target
- A separately rendered beam and shared-glow response
- A text-safe region large enough for both languages
- Foreground depth and transparent compositing
- A crop that must preserve two faces, one prop, and the emotional relationship

## 4. Hypotheses

The spike tests the following hypotheses.

| ID | Hypothesis | Evidence required |
|---|---|---|
| H-01 | A simple stylized 3D direction can feel like a picture book rather than a generic game render. | Parent approval and child observation of the final composite |
| H-02 | One reusable Aby model and one reusable Lumi model can communicate warmth at reading distance. | Clear silhouettes, pose readability, and auxiliary silhouette checks |
| H-03 | Eevee can produce the required softness and glow with acceptable iteration speed. | Approved beauty render plus recorded render times |
| H-04 | The scene can be decomposed into independently usable web layers without visible seams. | Browser recomposition matching the Blender reference composite |
| H-05 | One authored scene can support iPad landscape and phone portrait layouts. | Approved composites for both layout classes |
| H-06 | The lamp can be independently tapped and animated without live 3D. | Separate target layer, hit-area proof, and controllable effect layer |
| H-07 | AI-agent-assisted Blender production is repeatable and understandable. | Saved source file, structured scene, execution log, and reproducible export steps |

## 5. Goals

The spike must:

1. Explore visual feasibility through inexpensive look tests.
2. Select one direction for a complete representative scene.
3. Model or assemble reusable first-pass versions of Aby, Lumi, the star lamp, and the quiet moon environment.
4. Stage the emotional action from Spread 08.
5. Reserve a deliberate text-safe region.
6. Render a full layered web asset set.
7. Produce PNG masters and optimized WebP delivery tests.
8. Validate an iPad landscape spread and phone portrait page.
9. Demonstrate independent lamp interaction and glow behavior.
10. Record time, file-size, render, and revision evidence without setting an arbitrary production-time cap in advance.

## 6. Non-Goals

The spike will not:

- Produce all story spreads
- Finalize the complete Art Bible
- Finalize Aby, Maya, Niko, Lumi, or family character designs
- Build Maya or Niko models
- Produce a full character turnaround
- Animate full character performances or lip synchronization
- Build the asteroid garden or singing starfield routes
- Produce live 3D assets for the child-facing reader
- Bake story text or interface controls into rendered artwork
- Compare a prescribed number of fully finished visual styles
- Optimize every production asset before feasibility is known
- Establish final performance budgets before representative measurements exist
- Add music, narration, or non-story interactions

Small auxiliary renders from the same scene and models are permitted only when they validate silhouette, crop, transparency, lighting, or layer behavior.

## 7. Creative Constraints

### 7.1 Emotional target

The scene should communicate:

- Safety
- Kindness
- Gentle uncertainty
- Cooperation rather than rescue by force
- Warmth emerging inside a quiet, unfamiliar place

Aby should approach at Lumi's level. Lumi should appear reassured by the offered light, not injured, terrified, or helpless.

### 7.2 Child suitability

- Use simple, readable silhouettes and rounded or softened forms.
- Avoid sharp threatening shapes, realistic peril, hard horror-like shadows, and empty oppressive darkness.
- Keep facial expressions legible without exaggerated distress.
- Keep visual detail below the level that competes with the story text.
- Ensure the star lamp reads immediately as a handheld tool.

### 7.3 Living and non-living forms

- Aby and Lumi may be expressive living characters.
- The lamp, spacecraft, tools, rocks, and other machines or props must not have faces, voices, emotions, or human body language.
- The lamp's response comes from light and a soft mechanical action, not apparent personality.

### 7.4 Style remains open

The spike may test feasible stylized approaches such as:

- Paper diorama
- Soft clay
- Miniature toy set
- Rounded low-poly forms
- Another Blender-friendly storybook direction

This list is illustrative, not a requirement to build every option. The style must emerge from evidence about appeal, clarity, layer production, render speed, and reuse.

## 8. Look-Test Phase

### 8.1 Intent

Explore cheaply before refining. Do not fully model or polish several competing scenes.

### 8.2 Allowed look tests

Use simple proxy geometry or early models to compare only the variables needed to choose a direction, such as:

- Shape language
- Material softness
- Surface texture scale
- Key-to-fill lighting balance
- Glow treatment
- Camera height and lens feel
- Background darkness and color separation
- Paper, clay, toy, or low-poly material cues

### 8.3 Constraints

- Keep all tests based on Spread 08.
- Preserve the same basic emotional staging so visual directions can be compared fairly.
- Produce only as many tests as are cheap and informative.
- Stop exploring once one direction clearly satisfies the feasibility criteria better than the alternatives.
- Do not count look tests as additional finished story scenes.

### 8.4 Selection record

Record:

1. Directions attempted
2. Time spent on each
3. What each test proved or disproved
4. Why the selected direction best balances appeal and feasibility
5. Which limitations must be addressed in the Art Bible

## 9. Required Scene Content

The final representative scene must contain:

### 9.1 Aby

- One authored young astronaut model representing Aby
- A kind, careful posture at Lumi's level
- A visible face and eyes at target reading size
- A hand or arm pose that clearly offers the lamp
- A suit silhouette that remains readable against the background
- No dependence on tiny costume details for character recognition

The design is a first reusable production candidate, not final approval for all future scenes.

### 9.2 Lumi

- One small friendly living alien
- A distinct silhouette at iPad size
- A dim natural glow that remains visible without appearing ghostly or frightening
- An expression and pose indicating uncertainty becoming trust
- Clear visual potential for a later bright state and shelf keepsake

### 9.3 Star lamp

- Handheld scale appropriate to Aby
- Ordinary, functional tool design
- Warm light source
- No face, eyes, mouth, limbs, or expressive behavior
- Sufficient visible area and separate hit region for child interaction
- Geometry and/or render grouping that permits an independent target export

### 9.4 Environment

- Sheltered area on Lumi's quiet moon
- Visible outer-space context
- Soft forms that frame the characters without enclosing them threateningly
- Foreground element sufficient to test depth and transparent export
- No unrelated route environment or visual storytelling that conflicts with Spread 08

### 9.5 Interaction response

The static rest scene shows the lamp's warm resting light. The interactive response must support:

1. Lamp activation or emphasis
2. A beam widening gently toward Lumi
3. A soft shared glow around both characters
4. Lumi taking or implying one calm step into the light

The spike does not need skeletal animation for Lumi's step. A second pose, small layer translation, dissolve, or other restrained pre-rendered response may be tested if it proves the web technique.

## 10. Composition Requirements

### 10.1 Narrative hierarchy

The viewer should perceive the scene in this order:

1. Aby offering the lamp to Lumi
2. Lumi responding to the offered light
3. The safe path created by the lamp
4. The quiet moon and space context
5. The story text panel

The panel must be easy to find and read, but it must not become the scene's brightest or largest visual object.

### 10.2 Primary iPad composition

- Compose for a landscape 4:3 application viewport containing a centered two-page book.
- Treat the spread as one continuous illustration divided by a center fold.
- Keep Aby's face, Lumi, the lamp, and the essential beam away from the center-fold exclusion zone.
- Keep the interactive lamp target away from left and right navigation-edge zones.
- Reserve one coherent text-safe region that can hold the longer of the two language layouts without scrolling.
- Prefer the text-safe region on the side opposite the strongest character grouping, subject to successful reading order and balance.

### 10.3 Initial safe-region template

The spike should test, then document, a normalized overlay containing:

- Center-fold caution band
- Left and right page-navigation caution bands
- Story text-safe region
- Character and required-action safe region
- Outer crop-loss allowance
- Visible-book boundary

Exact percentages are an output of the spike rather than a fixed assumption. The resulting overlay becomes an input to the Art Bible.

### 10.4 Phone composition

- Produce a portrait single-page composite from the same source scene and reusable layers.
- Preserve Aby's face, Lumi, the lamp, and the shared-light relationship.
- Reposition layers and camera framing when necessary; do not rely on a blind center crop.
- Place the text panel in a mobile-safe region without covering faces or the lamp.
- Do not shrink the two-page book into a miniature spread.

### 10.5 Text-panel proof

Text remains web-rendered. The compositing proof must overlay both complete scripts separately using an approximate readable interface panel:

- One iPad English composite
- One iPad Indonesian composite
- One phone English composite
- One phone Indonesian composite

These are layout proofs, not final typography approval.

## 11. Blender Scene Structure

### 11.1 General organization

The `.blend` file must remain understandable to another artist or agent. Use named collections rather than leaving generated objects in one root list.

Suggested collection structure:

```text
SP08_SHARE_LIGHT
├── CAMERAS
│   ├── CAM_IPAD_SPREAD
│   └── CAM_PHONE_PAGE
├── LIGHTS
├── WORLD
├── BG_SPACE
├── ENV_MOON
├── CHAR_ABY
├── CHAR_LUMI
├── PROP_LAMP
├── FG_MOON
├── FX_LAMP_BEAM
├── FX_SHARED_GLOW
├── HOLDOUTS_SHADOWS
└── GUIDES_SAFE_REGIONS
```

Equivalent naming is acceptable if it is systematic and documented.

### 11.2 Naming

- Use stable descriptive object, material, collection, camera, light, and output names.
- Do not leave production objects named only `Cube.001`, `Material.003`, or similar defaults.
- Prefix validation-only helpers clearly so they can be hidden from production renders.
- Keep exported layer names aligned with the manifest.

### 11.3 Reproducibility

- Save the final Blender source file with all required procedural settings.
- Pack small generated dependencies where practical or document every external dependency.
- Use fixed seeds for procedural variation that affects the approved appearance.
- Document Blender version, render engine, color-management settings, and required add-ons.
- Avoid an undocumented manual compositor step that cannot be reproduced through Blender MCP or an explicit export command.

### 11.4 Reuse

Aby, Lumi, and the lamp should be separable assets or collections that can later be linked, appended, or duplicated into other scenes. Do not merge the entire scene into one irreversible mesh merely to simplify this render.

## 12. Render Strategy

### 12.1 Engine decision

- Use Eevee first for look development and final spike output.
- Prefer lighting and materials that remain stable under fast iterative rendering.
- Use Cycles only for a bounded diagnostic comparison when Eevee demonstrably cannot meet an essential requirement.
- Do not create equal full pipelines for both engines.

### 12.2 Lighting

The lighting design should include:

- A soft environmental base that preserves readable silhouettes
- A warm motivated source from the star lamp
- Gentle separation between Aby, Lumi, and the moon surface
- Controlled bloom or glow that does not wash out faces or transparent edges
- No realistic high-contrast darkness that makes Lumi's condition frightening

### 12.3 Color management

- Use one documented color-management configuration for all layers and the reference composite.
- Verify that browser-recombined layers do not become lighter, darker, or differently saturated than the Blender reference.
- Avoid depending on display-only effects that cannot be reproduced in exported layers.

### 12.4 Transparency and occlusion

- Export alpha with clean edges and consistent interpretation.
- Check for dark or bright fringes around Aby, Lumi, the lamp, foreground forms, and glows.
- Preserve correct occlusion where the lamp crosses Aby's hand and where light passes behind or in front of characters.
- Use holdouts, masks, shadow layers, or a documented grouping strategy where independent layers otherwise break visual integration.
- The independently recomposed scene should closely match the approved flattened reference.

## 13. Required Layer Set

The final scene must provide the following logical layers. More layers are allowed only when they solve a demonstrated compositing need.

| Layer ID | Content | Transparency | Intended web use |
|---|---|---|---|
| `bg-space` | Space field and distant context | Optional | Static scene base |
| `env-moon` | Sheltered moon environment behind characters | Yes or composited with background | Reusable environmental depth |
| `char-aby` | Aby and character-specific occlusion as documented | Yes | Astronaut variant layer |
| `char-lumi` | Lumi rest state | Yes | Character response and later variant swap |
| `prop-lamp` | Visible lamp target | Yes | Independent hit target and subtle emphasis |
| `fg-moon` | Foreground framing forms | Yes | Depth and page transition proof |
| `fx-lamp-beam` | Widened beam response | Yes | Interaction response |
| `fx-shared-glow` | Warm shared-light effect | Yes | Interaction response |
| `shadow-integration` | Any shadows or contact treatment needed for correct recomposition | Yes | Prevent floating cutout appearance |
| `reference-composite` | Approved complete Blender render | No | Visual comparison only |

If separating the lamp from Aby creates an unavoidable hand-occlusion problem, use documented front/back character masks or lamp sublayers rather than abandoning independent lamp interaction.

## 14. File Formats and Dimensions

### 14.1 Master exports

- Use lossless PNG for transparent layer masters and validation composites.
- Preserve alpha and sufficient bit depth for clean glows where required.
- Retain Blender source and any masks needed to regenerate exports.

### 14.2 Web delivery tests

- Encode transparent and opaque WebP variants appropriate to each layer.
- Compare visual quality, alpha edges, color, and file size against PNG masters.
- Use lossless WebP only where lossy compression creates visible defects.
- Do not require AVIF comparison in this spike.

### 14.3 Resolution

Final pixel dimensions depend on the physical family iPad and later performance budgets. For the spike:

- Render masters at sufficient resolution to evaluate on a retina-class iPad without visible softness.
- Produce delivery-sized tests for the actual viewport once the target iPad dimensions are confirmed.
- Avoid exporting every transparent layer at full-canvas resolution when a tightly bounded layer plus placement metadata is materially smaller.
- Record both canvas dimensions and visible-content bounds for every layer.

### 14.4 Naming convention

Use a consistent pattern such as:

```text
starlight-sp08-ipad-bg-space.png
starlight-sp08-ipad-char-aby.png
starlight-sp08-ipad-char-lumi.png
starlight-sp08-ipad-prop-lamp.png
starlight-sp08-ipad-fx-lamp-beam.png
starlight-sp08-phone-reference.webp
```

The final implementation may replace this convention, but the spike must avoid ambiguous filenames.

## 15. Asset Manifest

Provide a machine-readable manifest or structured table containing at least:

- Asset ID
- Scene ID
- Layout class
- Filename
- Format
- Pixel dimensions
- Canvas or local bounds
- Placement coordinates relative to the scene
- Layer order
- Alpha behavior
- Interactive status
- Suggested hit bounds for the lamp
- Rest or response state
- File size
- Source collection or render view layer
- Notes about masks, shadows, or blending

The manifest is evidence that the output can become structured story data rather than a pile of manually aligned images.

## 16. Browser Compositing Proof

The spike must prove the exports outside Blender with a minimal browser-based compositor or equivalent web test harness.

### 16.1 Required behaviors

- Reassemble all rest-state layers in correct order.
- Toggle the lamp-beam and shared-glow response independently.
- Show a visible but non-production lamp hit-area overlay for validation.
- Overlay the approximate story text panel without modifying art files.
- Switch between iPad landscape and phone portrait compositions.
- Compare the recomposed output with the Blender reference composite.

### 16.2 Pass conditions

- No obvious alpha fringe, seam, incorrect occlusion, or color mismatch at normal reading size.
- The lamp response can run without rerendering or moving the full scene.
- Text remains readable in English and Indonesian.
- Essential subjects remain visible in both layouts.
- Layer loading and toggling feel immediate on the target iPad after assets are available.

The proof is technical validation, not the beginning of the production reader implementation.

## 17. Blender MCP Execution Requirements

### 17.1 Agent workflow

The Blender agent should work in small, verifiable stages:

1. Establish cameras, safe-region guides, and proxy composition.
2. Capture a viewport or draft render for composition review.
3. Build cheap look tests with proxy or early assets.
4. Select and record one direction.
5. Refine Aby, Lumi, lamp, and environment assets.
6. Establish Eevee lighting and material system.
7. Validate the reference composite.
8. Organize render collections and masks.
9. Export and inspect one critical transparent layer before batch export.
10. Export the full layer set and manifest.
11. Validate browser recomposition and responsive layouts.
12. Record performance and production evidence.

Do not attempt the full scene, all exports, and every validation step in one opaque script execution.

### 17.2 Checkpoints

Capture review images at these checkpoints:

- Proxy composition with text and safe-region overlays
- Look-test comparison
- Selected-direction clay or draft render
- Final reference composite
- Layer-isolation view
- iPad browser recomposition
- Phone browser recomposition

### 17.3 Failure handling

If an MCP operation or render fails:

- Preserve the last valid `.blend` state.
- Record the failed step and error.
- Correct the root cause rather than layering an undocumented workaround.
- Re-run only the affected validation, not the entire spike, unless shared scene state changed.

## 18. Time and Effort Measurement

The spike does not impose a one-day or two-day pass/fail limit. It must first produce evidence.

Record approximate active and elapsed time for:

| Activity | Measurement |
|---|---|
| Composition and proxy staging | Active iteration time |
| Look tests | Time per attempted direction |
| Aby modeling and materials | Active production time |
| Lumi modeling and materials | Active production time |
| Lamp and environment | Active production time |
| Lighting and final look | Active iteration time |
| Layer setup and masks | Active technical-art time |
| Rendering | Time per layer and total batch time |
| WebP encoding | Total processing time |
| Browser compositing proof | Active implementation time |
| Parent revision | Time and number of material changes |

Also record:

- Number of Blender MCP calls or execution stages where practical
- Number of failed or repeated render/export attempts
- Peak source-file size
- Total PNG master size
- Total WebP delivery size
- Estimated reuse value of each major asset

The Art Bible and Implementation Plan will use these measurements to set a realistic per-scene budget.

## 19. Technical Measurements

Collect evidence rather than optimizing blindly.

### 19.1 Render measurements

- Blender version and Eevee mode
- Test machine hardware summary
- Master resolution
- Samples and relevant quality settings
- Reference-composite render time
- Time for each transparent layer
- Full batch export time

### 19.2 Delivery measurements

- PNG and WebP size per layer
- Total bytes required for the scene's rest state
- Additional bytes for the interaction response
- Browser-decoded dimensions
- Observable load or decode delay on the target iPad
- Visual defects introduced by WebP compression

### 19.3 Composition measurements

- Text-safe region dimensions in normalized coordinates
- Center-fold exclusion region
- Navigation-edge exclusion regions
- Lamp visible bounds and forgiving hit bounds
- iPad and phone placement metadata

These measurements inform later budgets; they are not permission to sacrifice child appeal or readability for the smallest possible files.

## 20. Review Process

### 20.1 Technical review

Before family review, verify:

- All required content is present.
- The scene is safe and emotionally appropriate.
- The full layer set recomposes correctly.
- English and Indonesian text-panel proofs fit.
- iPad and phone compositions preserve the narrative action.
- No machine or prop appears alive.
- Performance evidence and time logs are complete.

### 20.2 Parent review

The parent reviews the selected scene before showing it to the child. The parent checks:

- Story accuracy
- Emotional warmth
- Age suitability
- Character approachability
- Text readability
- Visual calmness
- Absence of frightening or confusing details

The parent may request one bounded revision round to correct material issues. Cosmetic exploration beyond that round should be deferred unless it blocks approval.

### 20.3 Child observation

After parent approval, show the final composite or simple interaction proof to the child without explaining what to like.

Observe:

- Which character or object the child notices first
- Whether Aby and Lumi seem friendly
- Whether the child understands that Aby is helping Lumi
- Whether the lamp is noticed as tappable
- Whether the child is curious, indifferent, or uncomfortable
- Whether the child wants to touch, explore, or see more

Do not ask the child to score the art or choose among polished alternatives. Record simple observations manually; use no analytics, camera, microphone, or biometric analysis.

## 21. Evaluation Rubric

Score each category from 1 to 5 after the technical and family review.

| Category | 1 — Fails | 3 — Usable with revision | 5 — Strong evidence |
|---|---|---|---|
| Child appeal | Cold, frightening, or ignored | Acceptable but generic or unclear | Warm, inviting, and prompts curiosity |
| Emotional clarity | Helping action is unreadable | Understandable with explanation | Cooperation reads immediately |
| Character readability | Faces or silhouettes disappear | Readable at primary size | Clear across iPad and phone proofs |
| Story accuracy | Contradicts Spread 08 | Mostly accurate with minor issues | Precisely supports the intended moment |
| Text integration | Panel obscures action or fails to fit | Fits with compromises | Both languages fit comfortably and calmly |
| Responsive composition | Important content is cropped | Requires notable repositioning | Layers adapt naturally to both layouts |
| Layer quality | Seams, fringes, or broken occlusion | Minor correctable defects | Browser composite closely matches reference |
| Interaction feasibility | Lamp cannot be isolated convincingly | Works with moderate special handling | Target and effects operate independently |
| Render feasibility | Unstable or prohibitively slow | Manageable with optimization | Fast, repeatable Eevee workflow |
| Reuse potential | Scene-specific and irreversible | Some reusable assets | Characters, prop, and setup transfer cleanly |
| Production clarity | Undocumented or opaque | Reproducible with guidance | Organized, documented, and agent-repeatable |

### 21.1 Approval gate

The direction may proceed to the Art Bible only when:

- No category scores 1.
- Child safety, story accuracy, text integration, layer quality, and interaction feasibility each score at least 4.
- The parent approves the scene for child observation.
- Child observation reveals no discomfort or major narrative misunderstanding.
- All mandatory technical deliverables exist.
- Any score below 4 has a documented mitigation or reason for acceptance.

A high visual score cannot compensate for failed layered export, unreadable text, or an unusable responsive crop.

## 22. Required Deliverables

### 22.1 Visual exploration

- Low-cost look-test outputs
- Brief selection record explaining the chosen direction
- Selected-direction draft render

### 22.2 Blender source

- Final organized `.blend` file
- Documented Blender version and required dependencies
- Named cameras, collections, materials, lights, guides, and render layers
- Reusable Aby, Lumi, and lamp assets within or alongside the scene

### 22.3 Master images

- Approved iPad reference composite in PNG
- Required transparent PNG master layers
- Auxiliary validation renders used for silhouette, crop, or alpha checks
- Safe-region guide overlay

### 22.4 Web delivery proof

- Optimized WebP test layers
- iPad English composite with web-rendered panel
- iPad Indonesian composite with web-rendered panel
- Phone English composite with web-rendered panel
- Phone Indonesian composite with web-rendered panel
- Independent lamp-response demonstration
- Browser recomposition comparison against the reference render

### 22.5 Documentation and evidence

- Asset manifest
- Time and effort log
- Render-settings record
- File-size comparison
- Known limitations and recommended fixes
- Completed evaluation rubric
- Parent review result
- Child-observation notes, if parent approval is granted
- Recommendation: proceed, revise and retest, or reject the pipeline

## 23. Suggested Artifact Organization

When the spike is executed, keep source, output, and evidence separate. A suggested structure is:

```text
art/
└── spikes/
    └── share-the-light/
        ├── source/
        ├── look-tests/
        ├── renders/
        │   ├── png-master/
        │   └── webp-test/
        ├── responsive-proofs/
        ├── web-proof/
        ├── manifest/
        └── notes/
```

This structure is guidance for later execution and is not created by this document task.

## 24. Acceptance Criteria

The Blender spike is complete when:

1. Spread 08 is represented accurately with Aby, Lumi, the star lamp, and the quiet moon.
2. One selected visual direction has been reached through bounded, inexpensive look tests.
3. The final scene feels safe, warm, and appropriate for ages 4–6.
4. Aby's offer, Lumi's response, and the shared guiding light read without prose explanation.
5. The lamp remains clearly non-living and independently interactive.
6. The complete required layer set is exported as lossless PNG masters.
7. WebP delivery tests preserve acceptable color, edges, transparency, and detail.
8. Browser recomposition closely matches the Blender reference composite.
9. The lamp beam and shared glow can be activated independently in the web proof.
10. English and Indonesian text panels fit without covering essential scene content.
11. The iPad landscape and phone portrait proofs preserve all essential narrative information.
12. The scene remains clear with motion removed and sound unavailable.
13. File sizes, render times, production time, revision effort, and failures are recorded.
14. The `.blend` file and exports are organized, named, and reproducible by another artist or agent.
15. The evaluation rubric and parent review are complete.
16. Child observation, if approved by the parent, reveals no major discomfort or misunderstanding.
17. The final report recommends proceeding, revising and retesting, or rejecting the pipeline with supporting evidence.

## 25. Stop Conditions

Stop and reassess rather than expanding scope if:

- Aby or Lumi cannot become child-friendly without abandoning the selected approach.
- The scene repeatedly resembles a game cinematic rather than an illustrated book.
- Eevee cannot produce acceptable light and transparency after one bounded diagnostic cycle.
- Correct layer recomposition requires extensive one-off manual painting or fragile masks.
- Phone adaptation requires an entirely separate scene rather than camera and layer recomposition.
- The lamp cannot be isolated without visibly breaking Aby's hand contact or scene lighting.
- Render or export failures cannot be reproduced and diagnosed.
- Look testing continues without producing new evidence.
- Additional characters, routes, or scenes are proposed merely to make the spike feel more complete.

If a stop condition occurs, document the evidence and choose among simplifying the visual direction, changing the layer strategy, running one targeted diagnostic, or rejecting the pipeline.

## 26. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Character design looks generic or synthetic | Weak emotional attachment | Favor strong silhouettes and authored proportions; use parent review before polishing |
| Glow hides facial expressions or alpha edges | Emotional and technical clarity fail | Separate motivated light from bloom; export controlled glow layers |
| Lamp separation breaks hand occlusion | Interaction layer looks like a sticker | Use documented front/back masks or character sublayers |
| Transparent layers do not match the beauty render | Browser scene loses quality | Validate one critical layer early; lock color management and alpha strategy |
| iPad composition fails on phone | Responsive reader needs separate art | Preserve reusable layers and permit camera-aware repositioning rather than blind cropping |
| Look exploration consumes the spike | No technical evidence is produced | Use proxy geometry, record learnings, and stop when one direction leads clearly |
| Eevee output feels too game-like | Product principle is violated | Test material softness, camera language, restrained depth, and storybook surface treatment |
| Cycles becomes an unplanned parallel pipeline | Time and complexity expand | Permit only one bounded diagnostic if an essential Eevee limitation is identified |
| AI agent creates opaque or fragile scene structure | Production cannot scale | Enforce named collections, checkpoints, manifests, fixed seeds, and reproducible exports |
| Child preference is overinterpreted from one reaction | Art direction follows weak evidence | Treat observation as a safety and clarity signal, not quantitative research |

## 27. Decision Outcomes

The spike concludes with exactly one recommendation.

### 27.1 Proceed

Use when the direction passes the approval gate. The next step is to create the Art Bible from the approved scene and measured pipeline.

### 27.2 Revise and retest

Use when the core pipeline is feasible but one bounded issue—such as text-safe composition, lamp occlusion, glow export, or phone framing—needs correction. Define one targeted retest rather than repeating the entire spike.

### 27.3 Reject

Use when the chosen Blender approach cannot satisfy child appeal, emotional clarity, layered export, responsive composition, or repeatable production without disproportionate manual work. Record which alternative pipeline should be considered next.

## 28. Downstream Handoff

If the result is **Proceed**, the approved scene and evidence become source material for the Art Bible, which will define:

- Final shape and material language
- Character proportions and expression rules
- Palette and glow hierarchy
- Camera and composition templates
- Text-safe, fold-safe, navigation-safe, and crop-safe regions
- Lighting rigs and Eevee settings
- Layer, alpha, shadow, naming, and export standards
- WebP quality rules and target budgets
- Reusable asset and pose strategy for all remaining spreads

The Art Bible must describe the direction that actually passed this spike. It must not invent a separate visual system without another explicit feasibility review.
