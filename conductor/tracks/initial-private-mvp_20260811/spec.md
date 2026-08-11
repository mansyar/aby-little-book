# Specification: Initial Private MVP

## Overview

Implement and privately deploy the first complete Aby Little Book prototype: a
calm bilingual English-Indonesian interactive picture-book PWA for children aged
4-6 and accompanying adults.

The prototype contains one polished 5-7 minute story, *The Starlight Rescue*.
It must prove that a child can understand, enjoy, and complete the story on the
family iPad while validating reusable, but not speculative, foundations for
later authored books.

Implementation must follow a representative-slice-first sequence. Contracts,
state logic, persistence foundations, and the application shell precede a
production-quality Spread 08 vertical slice. Remaining story art and scenes may
be produced only after that slice validates the Blender-to-browser pipeline and
target-device experience.

## Goals

1. Deliver one complete, polished story in natural English and Indonesian.
2. Preserve the experience of a cherished picture book rather than a game.
3. Support shared reading and early independent reading.
4. Provide safe child agency without wrong choices or failure states.
5. Work reliably as an installed, explicitly prepared offline PWA.
6. Preserve progress and preferences locally across interruption and restart.
7. Meet accessibility, responsive-layout, and target-iPad requirements.
8. Validate a repeatable soft-clay Blender-to-layered-WebP production pipeline.
9. Produce an immutable, private, verifiable deployment with rollback evidence.
10. Gather child and caregiver evidence about comprehension and enjoyment.

## Functional Requirements

### 1. Application shell and bookshelf

- Present a calm celestial bookshelf as the application home.
- Show *The Starlight Rescue* with its preparation, progress, completion, and
  replay states.
- Provide a gentle portal preview and entry into the story.
- Restore the last stable reading position through a clear Continue action.
- Show the Lumi keepsake after story completion.
- Provide caregiver-accessible language, sound, accessibility, preparation, and
  reset controls.
- Protect destructive reset behavior with a clear adult gate and confirmation.

### 2. Story content and structure

- Deliver the approved ten-spread *The Starlight Rescue* experience.
- Support three authored astronaut choices without changing narrative progress.
- Present one safe route choice with two complete routes that converge on the
  same ending.
- Lock the selected route for the current reading while allowing alternate-route
  discovery through replay.
- Keep choices equally valid and free of punishment, scoring, or failure.
- Limit each spread to the approved concise bilingual prose and validated
  interaction definitions.
- Store story and localization content as validated data rather than React code.

### 3. Reader experience

- Render story prose as semantic HTML over layered scene artwork.
- Support swipe and edge-tap navigation on touch devices.
- Support pointer and keyboard navigation on desktop.
- Prevent gestures originating on words, scene targets, choices, shelf items, or
  parent controls from triggering page navigation.
- Prevent repeated navigation while a page transition commits.
- Provide stable backward navigation without invalidating route state.
- Cancel pronunciation and transient hints when navigation commits.
- Preserve story comprehension when optional interactions are ignored.

### 4. Pronunciation and sound

- Make each eligible story word an accessible control for isolated
  pronunciation.
- Support English and Indonesian through a speech-provider interface.
- Cancel or replace prior pronunciation so speech never overlaps.
- Evaluate browser speech on the physical target iPad, online and offline.
- Use reviewed local word clips only if target-device evidence shows browser
  speech is unavailable or unacceptable.
- Provide only brief, local, purposeful effects.
- Provide equivalent understanding when sound is disabled or unavailable.
- Do not add full narration, music, ambience, autoplay, or recording.

### 5. Responsive and accessible presentation

- Provide authored iPad-landscape and phone-portrait scene layouts.
- Adapt desktop behavior for pointer and keyboard use.
- Preserve text-safe, character-safe, fold, and interaction-target regions.
- Meet approved text sizing, contrast, semantic, focus, keyboard, touch-target,
  and reduced-motion requirements.
- Do not rely on color, motion, sound, or position alone to communicate meaning.
- Use localized scene descriptions and empty alternative text for decorative
  layers.
- Support language changes without losing progress.
- Keep child-facing errors calm, non-blaming, and recovery-oriented.

### 6. Local persistence

- Store settings, stable progress, astronaut choice, selected route, route
  history, completion state, Lumi keepsake, and package readiness in IndexedDB.
- Version persisted data and provide tested migrations.
- Save only at defined stable points.
- Resume safely after reload, browser termination, or installed-PWA restart.
- Reset local state only after the caregiver gate and explicit confirmation.
- Collect no child identity, voice, likeness, or behavioral analytics.

### 7. Offline preparation and updates

- Install as a PWA on the target iPad.
- Precache only the minimal application shell.
- Provide an explicit Download/Prepare Book action for the complete versioned
  story package.
- Verify every required asset and hash before atomically marking the book ready.
- Complete the full story after network disconnection once preparation succeeds.
- Detect missing or evicted assets and offer one calm recovery path.
- Keep story package versions immutable.
- Do not activate an update in a way that interrupts an open reader.
- Preserve progress across service-worker and application updates.

### 8. Scene rendering and interaction

- Compose each scene from registered full-canvas transparent WebP layers in the
  DOM.
- Load only the active layout's layer set.
- Decode destination layers before navigation commits where supported.
- Bound decoded-scene retention to protect iPad memory.
- Implement approved optional interactions with semantic HTML hit targets.
- Provide restrained delayed hints and reduced-motion equivalents.
- Validate layer order, alpha edges, alignment, safe regions, targets, and
  English/Indonesian text fit in real browsers.
- Do not use Canvas or WebGL for prose, controls, hit testing, or general scene
  composition.

### 9. Art production

- Use the approved soft-clay diorama direction and Blender 5.2.0 LTS,
  Eevee-first pipeline.
- Treat the existing Spread 08 Share the Light assets as the representative
  renderer and production reference.
- Do not begin all remaining production scenes until Spread 08 passes browser
  recomposition, responsive, accessibility, interaction, performance, and
  physical-iPad review.
- After approval, create the remaining required scenes and states using authored
  iPad-landscape and phone-portrait cameras.
- Retain Blender sources and transparent PNG masters outside the runtime image.
- Export optimized transparent WebP delivery layers and validated manifests.
- Record reproducibility metadata, safe regions, layer order, hashes, render
  settings, and package budgets.

### 10. Validation and delivery

- Run strict TypeScript 7, Biome lint/format, localization parity, schema, route,
  asset-reference, hash, unit/component, production-build, and browser gates.
- Run Playwright critical journeys in Chromium and WebKit.
- Maintain at least 80% line and branch coverage for logic-bearing code.
- Validate installation, offline completion, restart recovery, pronunciation,
  touch behavior, and performance on the physical family iPad.
- Complete fluent-adult Indonesian review and English/story/UX review.
- Complete accessibility review for semantics, focus, keyboard, touch, contrast,
  reduced motion, and equivalent understanding.
- Observe the child and caregiver using the complete prototype and record
  comprehension, independent navigation, engagement, replay interest, and
  confusion without collecting analytics.
- Build a pinned, non-root Nginx container listening on port 8080.
- Expose static `/healthz` and `/version.json`.
- Publish an owner-approved immutable private GHCR image.
- Deploy the exact semantic tag or digest through Coolify over HTTPS.
- Verify version identity, health, cache/security/no-index headers, installation,
  and the critical family journey after deployment.
- Record and prove rollback to the prior known-good immutable image.

## Non-Functional Requirements

### Experience quality

- Reading and comprehension take priority over interaction and decoration.
- Motion, sound, prompts, and errors remain calm, warm, and non-demanding.
- Optional discoveries never block story completion.
- English and Indonesian are equally authored and fully supported.

### Performance and resilience

- The active story remains responsive on the current family iPad.
- Scene loading and transitions avoid visible broken composition.
- Memory use is bounded by loading only the active layout and nearby scenes.
- Stable progress survives expected interruption, restart, and offline use.
- Package preparation fails atomically rather than leaving false-ready state.

### Privacy and security

- No accounts, authentication, backend, analytics, advertising, tracking, or
  remote error collection.
- No third-party scripts, remote fonts, or externally hosted runtime media.
- No application secrets or writable runtime volume.
- The production container runs unprivileged and passes the agreed scan gate.
- The private release is not indexed and uses immutable deployment identity.

### Maintainability and compatibility

- Use strict TypeScript 7, focused dependencies, feature-first organization,
  pure reducers, Zod-inferred contracts, and repository/provider boundaries.
- Configure Biome to enforce the applicable TypeScript, HTML/CSS, and general
  project code style guides.
- At bootstrap and intentional upgrade points, select the newest stable package
  versions whose engine and peer ranges are mutually compatible with Node.js 24
  and TypeScript 7.
- Pin the accepted dependency set in `package.json` and `pnpm-lock.yaml`; do not
  use prereleases or independently upgrade packages beyond compatible ranges.
- Keep story content separate from application behavior.
- Add no abstraction whose only purpose is a hypothetical future platform.
- Preserve reproducible content, asset, container, and release outputs.

## Required Implementation Sequence

1. Establish the pinned toolchain, application shell, design tokens, tests, CI,
   and static container foundations.
2. Define and test story, localization, route, package, asset, and persistence
   contracts with invalid fixtures and validators.
3. Implement and test pure application/reader state, route traversal, replay,
   localization resolution, and persistence repositories.
4. Integrate Spread 08 as the representative vertical slice, including layered
   rendering, text, pronunciation, interaction ownership, responsive layouts,
   reduced motion, and browser/device evidence.
5. Obtain explicit slice approval before producing remaining scenes.
6. Implement offline preparation, service-worker safety, bookshelf, caregiver
   controls, completion, Lumi keepsake, and replay flows.
7. Produce and integrate remaining approved story art and localized content.
8. Complete browser, accessibility, bilingual, physical-iPad, and family
   validation; resolve release-blocking findings.
9. Build, publish, deploy, verify, and document rollback of the private immutable
   release.

## Acceptance Criteria

The track is complete only when:

1. A child can move from bookshelf to completion of either route with
   age-appropriate adult support.
2. Both routes, all astronaut choices, and the converged ending work in English
   and Indonesian.
3. Every eligible word provides acceptable isolated pronunciation through the
   evidence-selected provider.
4. The explicitly prepared installed PWA completes offline on the physical iPad.
5. Progress, settings, choices, route history, completion, and Lumi survive
   termination and reopening.
6. Touch, keyboard, pointer, responsive layouts, reduced motion, semantics,
   focus, contrast, and target sizes pass their defined checks.
7. Optional interactions never block reading or create a failure state.
8. All runtime assets are final, validated, versioned, locally served, and within
   approved budgets; no placeholders remain.
9. Scoped coverage and all configured validation, browser, build, container, and
   security gates pass.
10. English and Indonesian receive human review.
11. Physical-iPad evidence confirms installation, performance, offline use,
    restart recovery, speech, and critical interactions.
12. Child/caregiver observation supports comprehension, enjoyment, and the
    reading-first experience, with findings recorded manually.
13. The private Coolify deployment matches its approved Git tag and GHCR digest,
    reports healthy/versioned output, and has a proven rollback path.
14. The Blender-to-browser process is documented and judged practical enough to
    repeat for a later authored story.

## Out of Scope

- Public or commercial launch
- More than one production story
- Accounts, profiles, authentication, cloud sync, or backend services
- Analytics, advertising, tracking, telemetry, or remote error collection
- CMS or runtime AI generation/editing
- Full narration, voice recording, music, or ambience
- Points, streaks, competitive rewards, complex mini-games, or failure states
- Social, sharing, community, or publishing features
- Hosted fonts, third-party scripts, or remotely hosted story media
- Routing library, speculative global-state framework, Canvas-first/WebGL
  renderer, or live 3D
- Multi-book download management or abstractions not needed by this prototype
