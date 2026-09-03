# Product Guidelines: Aby Little Book — Interactive 3D Storybook

## Experience Promise

Aby Little Book should feel like stepping onto a quiet dock at night and being
invited to touch the water gently. Every word, model, glow, motion, and sound
must support story comprehension, emotional safety, and shared reading.

## Brand Character

The product is:

- Calm, never overstimulating
- Touchable, never demanding
- Magical, never flashy
- Reassuring, never demanding
- Warm, never patronizing
- Curious, never chaotic
- Polished, never sterile

## Core Design Principle

> A book you can touch gently — not a game with text added to it.

When priorities conflict, choose comprehension and calm over novelty, spectacle,
engagement mechanics, or decorative complexity.

## Voice and Tone

### Child-facing voice

Use warm, direct, concrete language that a child aged 4–6 can understand.
Invite to touch; never command.

- Prefer short sentences and familiar words.
- Give one clear idea or action at a time: “Touch the turtle softly.”
- Invite rather than command when either approach works.
- Encourage exploration without urgency.
- Describe outcomes without judging the child.
- Never use baby talk, sarcasm, shame, failure language, or pressure.
- Never imply that speed, repetition, or completion earns greater worth.

### Caregiver-facing voice

Use concise, respectful, transparent language.

- Explain 3D downloads, offline packages, WebGL fallback, and destructive actions plainly.
- State what will happen before requesting confirmation.
- Avoid technical jargon unless it helps resolve a problem.
- Never use manipulative urgency or obscure privacy implications.

### System and error messages

- Explain the current state in plain language.
- Offer one safe next step.
- Preserve progress whenever possible.
- Provide a poster fallback if WebGL is missing; story never blocks.
- Do not blame the child or caregiver.
- Keep technical diagnostics (hashes, GLB versions) outside child-facing surfaces.

## Bilingual Writing

English and Indonesian are equal product requirements.

- Author natural phrasing in each language rather than translating mechanically.
- Preserve intent, emotional tone, reading level, and interaction meaning.
- Allow sentence structure to differ when natural language requires it.
- Review Indonesian content with a fluent adult.
- Test both languages in every supported layout and camera beat.
- Never shorten one language by removing important meaning merely to fit.
- Resolve personalized text naturally before pronunciation or display.

## Story Prose

- Keep the night-lake sharing story emotionally clear and suitable for ages 4–6.
- Use no more than two short story sentences per spread, rendered as DOM overlay.
- Favor concrete water, boat, turtle action and sensory detail.
- Treat shyness gently; sharing means offering without losing your own light.
- Keep choices equally valid and free of punishment.
- Keep turtle minimal: bead eyes, blush, no mouth; cute via proportion, not detail.
- Preserve space for the accompanying adult to read, pause, and discuss.

## Interaction Principles

1. Reading remains the primary activity.
2. Children cannot make a wrong choice, get lost in orbit, or enter a failure state.
3. Optional touches remain optional; comprehension never requires them.
4. Required actions are obvious, forgiving, and accessible.
5. Feedback is glow-plus-word: soft pulse + isolated pronunciation, never overlapping.
6. Motion and sound serve meaning rather than demand attention.
7. Camera is guided: gentle drifts on story beats only, no free orbit.
8. Progress is stable across interruption, restart, language change, and offline use.
9. Parent-only and destructive actions use a clear adult gate.

## Visual and Motion Direction

- Use lantern-calm 3D: slow bobbing, soft glow pulse, tiny camera drifts.
- Starlit Dock: wooden dock, calm water shader, bobbing story boats, fireflies as instanced points.
- Prioritize relationships, story actions, and readable DOM text panels over scenery.
- Use depth, glow, and motion sparingly to guide attention to the turtle and sharing beats.
- Avoid visual clutter, rapid movement, harsh flashes, and reward-like effects.
- Keep 3D hotspots visually part of the lake world while preserving affordance and large touch targets.
- Respect reduced-motion: freeze water, fireflies, bobbing, and camera drift without hiding story.
- Do not bake story text into 3D textures.

## Sound and Pronunciation

- Sound is optional, brief, local, and purposeful.
- Tap gives soft visual glow; word taps speak the isolated word via provider, canceling prior speech so sounds never overlap.
- Pronunciation supports individual words; it does not replace shared reading.
- Do not autoplay full narration, music, or ambience.
- Provide equivalent understanding when sound is unavailable.
- Avoid abrupt, loud, competitive, or reward-associated sounds.

## Accessibility and Inclusion

- Meet defined semantic, keyboard, contrast, touch-target, and reduced-motion requirements, including in 3D.
- Every 3D hotspot has a DOM-accessible equivalent with name, focus, and keyboard activation.
- Do not rely on color, motion, position, or sound alone to communicate meaning.
- Keep controls discoverable for children while remaining usable by adults.
- Support reading together, independent exploration, and varied motor precision.
- Preserve the child’s dignity in every state and message.

## Privacy and Trust

- Collect no child names, photos, voices, likenesses, or behavioral analytics.
- Use no accounts, advertising, tracking, or manipulative engagement patterns.
- Keep progress and preferences local to the device.
- Explain 3D package size, offline preparation, and destructive reset behavior clearly.
- Design for family trust rather than data collection.

## Agent-Built Art Direction

- Style Bible as code is truth: colors, roughness, bevel, light rig, camera presets.
- Builders are the only source: versioned Python, deterministic seeds, no hand edits.
- Cute-minimal characters only; no realistic faces.
- Every asset ships with hash, poly/texture budgets, tap pivots, and preview renders.
- Auto-review (budgets, vision checks, browser captures) gates; human review is exception-only.

## Decision Test

Before approving a product decision, ask:

1. Does it help the child understand or enjoy the sharing story?
2. Is it calm, safe, forgiving, and gently touchable?
3. Does it work naturally in English and Indonesian as DOM text?
4. Is it accessible on the target iPad, with reduced-motion and fallback?
5. Does it preserve privacy and local-first behavior?
6. Can an agent rebuild it deterministically?
7. Is it necessary for the validated prototype scope?

If the answer is no, simplify or remove it.
