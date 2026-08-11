# Aby Little Book — Development Roadmap

**Status:** Draft 1  
**Product stage:** Private family prototype  
**Primary device:** iPad in landscape orientation  
**Last updated:** 2026-08-11

---

## 1. Purpose

This roadmap describes the high-level development phases for the first complete version of **Aby Little Book** and its initial story, **The Starlight Rescue**.

It communicates sequence, outcomes, and exit gates. Detailed requirements and technical decisions remain in the supporting specifications; this document does not replace them or prescribe task-level implementation.

---

## 2. Roadmap principles

1. Validate the highest-risk behavior before producing the entire book.
2. Build one complete vertical slice before expanding breadth.
3. Treat English and Indonesian as equal product requirements throughout development.
4. Preserve the experience as a book gently brought to life, not a game with text added.
5. Keep the prototype local-first, private, and free of accounts, analytics, and backend services.
6. Use physical iPad evidence for decisions that browser automation cannot establish.
7. Do not publish a release unless its exact container image can be identified and rolled back.

---

## 3. Phase overview

| Phase | Name | Primary outcome | Status |
|---|---|---|---|
| 0 | Product and visual foundation | Product, story, UX, architecture, and provisional art direction are defined | Complete with validation conditions |
| 1 | Engineering foundation | A tested application shell and delivery pipeline are operational | Not started |
| 2 | Story engine foundation | Validated bilingual content and deterministic reading state work independently of the UI | Not started |
| 3 | Representative vertical slice | Spread 08 works end to end on the target reading layouts | Not started |
| 4 | Local-first and offline foundation | Progress, preparation, offline reading, and speech behavior are reliable | Not started |
| 5 | Complete product journey | Bookshelf-to-completion and replay flows work as one coherent experience | Not started |
| 6 | Full story production | Both complete story routes and all production assets are integrated | Not started |
| 7 | Quality and family validation | The experience passes automated, physical-device, accessibility, and child-use gates | Not started |
| 8 | Private family release | A versioned, rollback-ready prototype is deployed through Coolify | Not started |

---

## 4. Phase 0 — Product and visual foundation

### Outcome

The prototype has an agreed product scope, complete bilingual story draft, reader behavior, technical architecture, and evidence-backed provisional visual direction.

### Completed foundations

- Product requirements and explicit prototype boundaries
- Full English and Indonesian story specification
- Reader, bookshelf, parent-control, and responsive UX specification
- Blender feasibility spike for Spread 08
- Provisional soft-clay Art Bible
- Static PWA architecture and release design
- Browser-recomposable iPad and phone asset proof

### Conditions carried forward

- Observe the child's unprompted response to the soft-clay scene.
- Validate layered composition on physical iPad Safari.
- Obtain visual approval for Maya and Niko before full character production.
- Measure production time again on a second scene before committing to the full art schedule.

---

## 5. Phase 1 — Engineering foundation

### Outcome

A minimal, production-shaped application can be developed, tested, packaged, and previewed consistently.

### Major work

- Scaffold the Vite, React, TypeScript, pnpm, and Tailwind CSS v4 application.
- Establish semantic design tokens and bundled font loading.
- Add unit, component, and browser-test foundations.
- Establish required pull-request checks in GitHub Actions.
- Build the unprivileged Nginx container and local production preview.
- Add application version information and basic health verification.

### Exit gate

A pull request can build, test, create the production container, and exercise the static application in Chromium and WebKit without relying on a backend.

---

## 6. Phase 2 — Story engine foundation

### Outcome

The complete story can be represented and validated as content rather than application code.

### Major work

- Define Zod schemas for the book, spreads, routes, interactions, layouts, assets, and package manifest.
- Encode both languages and all three astronaut variants using stable identifiers and approved tokens.
- Validate graph reachability, one-route selection, convergence, localization parity, and asset references.
- Implement the pure route engine and reader reducer.
- Test route locking, replay, completion, astronaut substitution, and recovery from invalid content.

### Exit gate

Automated tests prove that both ten-spread routes converge correctly, all required content exists in English and Indonesian, and reader state transitions are deterministic.

---

## 7. Phase 3 — Representative vertical slice

### Outcome

Spread 08, **Share the Light**, works as a production-quality reader slice using the approved Blender assets.

### Major work

- Integrate semantic full-canvas WebP layers and authored iPad and phone layouts.
- Render the inset story panel with the exact bilingual text.
- Implement tappable words, isolated pronunciation feedback, and speech cancellation.
- Implement swipe, edge-tap, keyboard, and pointer-ownership rules.
- Implement the optional star-lamp interaction, delayed hint, and visible response.
- Add reduced-motion, text scaling, semantic controls, and focus behavior.
- Validate safe regions, target bounds, layer alignment, and memory behavior.

### Exit gate

The same content package produces a readable and correctly aligned Spread 08 in automated Chromium and WebKit checks and on the physical iPad, with no conflict between word taps, lamp interaction, and page navigation.

### Production decision

Only after this gate passes should the project commit to producing all remaining story scenes.

---

## 8. Phase 4 — Local-first and offline foundation

### Outcome

The current book can be explicitly prepared, verified, resumed, and read without a network connection.

### Major work

- Implement versioned IndexedDB storage for settings, progress, completion, and package state.
- Implement stable save points and automatic resume.
- Build explicit **Download Book** preparation with asset hashing and atomic readiness.
- Configure the service worker, application-shell caching, and safe update behavior.
- Implement calm recovery for missing or evicted assets.
- Evaluate English and Indonesian browser speech on the target iPad, online and offline.
- Retain browser speech or activate the reviewed-audio provider based on evidence.

### Exit gate

After one successful preparation, the book opens, pronounces words through the accepted provider, saves progress, restarts, resumes, and completes on the target iPad with the network disconnected.

---

## 9. Phase 5 — Complete product journey

### Outcome

The application functions as one coherent child-facing experience rather than an isolated reader demonstration.

### Major work

- Build the celestial bookshelf and layered portal-book presentation.
- Add whole-application English and Indonesian switching.
- Build the portal preview and remembered Aby, Maya, or Niko selection.
- Implement Open Book, Continue, and Read Again states.
- Add progress ribbon, protected bookmark exit, route choice, and locked-route behavior.
- Add explicit close-book completion, Lumi's shelf arrival, and alternate-route replay invitation.
- Add the hold-plus-reading-prompt parent gate with sound and reset controls.
- Add orientation, loading, offline, update, and recovery states.

### Exit gate

A child can move from launch to bookshelf, prepare and open the story, choose an astronaut and route, leave and resume, complete the book, receive Lumi, and replay the alternate route without developer assistance.

---

## 10. Phase 6 — Full story production

### Outcome

Every spread in both routes has approved, optimized, and integrated production content.

### Major work

- Finalize and approve Maya and Niko within the shared astronaut system.
- Produce shared spreads, the Glowing Asteroid Garden route, and the Singing Starfield route.
- Produce responsive iPad and phone compositions for every spread.
- Export semantic PNG masters, optimized WebP delivery layers, and manifests.
- Integrate all optional discoveries, route choice, gentle effects, and acknowledgements.
- Complete bilingual editorial and read-aloud review.
- Measure second-scene and full-book production cost, package size, and device memory.
- Update the provisional Art Bible when production evidence changes a visual rule.

### Exit gate

Both complete routes pass content, asset, browser-composition, package-budget, and bilingual review checks with no placeholder story content or temporary art.

---

## 11. Phase 7 — Quality and family validation

### Outcome

The prototype is technically stable, understandable to the child, comfortable for shared reading, and ready for private family use.

### Major work

- Complete unit, component, integration, and end-to-end coverage for critical journeys.
- Run Chromium and WebKit browser matrices.
- Validate physical iPad Safari in landscape, including offline use and restart recovery.
- Validate every word, both languages, all astronauts, both routes, and Lumi completion state.
- Review target sizes, contrast, semantics, keyboard use, reduced motion, and orientation behavior.
- Observe whether the child can navigate mostly alone, remains engaged, and asks to replay.
- Observe whether the parent enjoys shared reading and whether hints or controls cause confusion.
- Resolve defects and tune gesture, hold, hint, type-size, and motion thresholds from evidence.

### Exit gate

All technical acceptance criteria pass, no release-blocking accessibility or content defects remain, and family observation supports the prototype's success criteria.

---

## 12. Phase 8 — Private family release

### Outcome

A reproducible prototype is available at the private unlisted family URL and can be safely rolled back.

### Major work

- Publish an owner-approved semantic version tag.
- Build and publish the exact immutable private GHCR image.
- Create curated GitHub release notes with validation status and known issues.
- Deploy the exact versioned image to Coolify.
- Verify HTTPS, health, version identity, cache headers, security headers, installation, and offline reading.
- Record the prior known-good image and prove the rollback procedure.

### Exit gate

The deployed version matches its Git tag and image digest, completes the family reading journey on the target iPad, and can be replaced by the prior immutable image without rebuilding source.

---

## 13. Prototype completion definition

The first prototype is complete when:

1. One bilingual story supports both ten-spread routes and one shared positive ending.
2. Aby, Maya, and Niko are selectable and remembered locally.
3. Every visible story word can be heard independently through the accepted speech provider.
4. Optional scene interactions remain discoverable but never block reading.
5. Progress, route history, settings, completion, and Lumi persist locally.
6. The prepared book works offline on the target iPad.
7. The child can navigate mostly independently and shows interest in replaying.
8. The parent finds the shared-reading experience enjoyable.
9. The complete art pipeline is repeatable at an acceptable production cost.
10. The released container is versioned, verifiable, private, and rollback-ready.

---

## 14. Beyond the prototype

The following are intentionally outside this roadmap:

- Additional books or a large downloadable library
- Parent or child accounts
- Cross-device synchronization
- Multiple child profiles
- AI-assisted story creation and moderation
- Public launch, subscriptions, or payments
- Social features, analytics, scores, streaks, or competitive rewards
- Backend APIs and server-side content management

These opportunities should be reconsidered only after the private prototype demonstrates that the child wants to read, interact with, and replay the experience.

---

## 15. Source documents

- [Product Requirements Document](./PRD.md)
- [Story Specification](./STORY-SPEC.md)
- [UX Specification](./UX-SPEC.md)
- [Blender Spike Brief](./BLENDER-SPIKE-BRIEF.md)
- [Art Bible](./ART-BIBLE.md)
- [Technical Design Document](./TDD.md)
- [Executed Blender Spike Result](../art/spikes/share-the-light/notes/SPIKE-RESULT.md)

When this roadmap conflicts with a detailed source document, the detailed source document governs its respective product, story, UX, art, or technical domain.
