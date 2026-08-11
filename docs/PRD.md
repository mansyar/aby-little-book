# Product Requirements Document: Aby Little Book

**Status:** Draft 1  
**Product stage:** Private family prototype  
**Primary platform:** iPad, landscape orientation  
**Last updated:** 2026-08-11

## 1. Product Summary

Aby Little Book is a web-based, interactive storybook for children aged 4–6. It opens as a magical bookshelf where each book acts as a portal into a distinct story world.

The first prototype will contain one polished bilingual space adventure. A child chooses a preset astronaut, reads alone or with a parent, taps any story word to hear it pronounced, discovers optional scene interactions, and makes one meaningful route choice. Both routes lead to the same reassuring conclusion. Completing the story adds the rescued creature to the bookshelf as a keepsake and invites the child to replay the undiscovered route.

The prototype is intended for one family. It will store progress on the device, work offline after the book is available, and require no child account or sensitive child data.

## 2. Problem Statement

Most digital reading experiences for young children fall into one of two extremes:

- Static ebooks do little to support emerging readers or invite exploration.
- Game-like story apps can overstimulate children and make reading secondary to rewards and activities.

The product should bring a picture book gently to life while preserving shared reading, clear storytelling, and the child’s imagination.

## 3. Product Vision

Create a calm, magical bookshelf where young children can enter illustrated worlds, participate in stories without making wrong choices, and gain confidence as early readers.

### Core design principle

> A book brought gently to life—not a game with text added to it.

## 4. Goals

The first prototype must:

1. Validate that a child aged 4–6 can understand and enjoy the bookshelf and reader.
2. Deliver one complete, polished 5–7 minute story.
3. Support shared reading and early independent reading without full narration.
4. Give the child meaningful agency through one safe branching decision.
5. Support English and Indonesian throughout the experience.
6. Validate a repeatable Blender-to-web illustration pipeline.
7. Preserve progress and allow the current book to work offline on the target iPad.
8. Avoid collecting sensitive child information.

## 5. Non-Goals

The first prototype will not include:

- A public release or commercial offering
- Parent or child accounts
- Cloud synchronization
- Multiple child profiles
- A library of multiple complete books
- An AI-assisted story editor
- Live AI generation in the child-facing experience
- Full-story narration
- Parent-recorded narration
- Music or continuous ambient audio
- Points, streaks, generic badges, or competitive rewards
- Complex mini-games
- Multiple story endings
- Social, sharing, community, or publishing features
- Child photos, voice recordings, names, or likeness-based personalization
- Live 3D rendering as the primary story presentation

## 6. Target Users

### Primary user: emerging reader

- Age 4–6
- Developing word recognition and reading confidence
- Uses touch controls more readily than text-heavy navigation
- May read independently for short periods
- Benefits from immediate pronunciation help
- Needs large targets, obvious feedback, and forgiving interactions

### Secondary user: parent or caregiver

- Reads alongside the child or supervises independent reading
- Wants a calm, safe, repeatable experience
- Controls sound and can reset progress
- Does not need an account for the prototype

## 7. Usage Context

- **Primary device:** iPad
- **Primary orientation:** Landscape
- **Primary input:** Touch
- **Typical session:** 5–7 minutes
- **Reading modes:** Shared parent-child reading and early independent reading
- **Connectivity:** The current book must remain readable after connectivity is lost
- **Secondary layouts:** Desktop/tablet spreads and phone-friendly single pages

## 8. Product Principles

1. **Reading remains central.** Interactions support the story rather than interrupt it.
2. **No wrong choices.** Branches may differ, but every route remains safe and satisfying.
3. **Calm over stimulation.** Motion and sound are subtle, purposeful, and limited.
4. **Help is available everywhere.** Every story word can provide pronunciation support.
5. **Discovery is optional.** Decorative interactions never prevent page progression.
6. **The child stays in control.** Navigation is predictable and actions give immediate feedback.
7. **Privacy by omission.** Do not collect child data that the experience does not need.
8. **Art serves usability.** Every scene reserves readable space for text and interactive targets.

## 9. Prototype Success Criteria

The prototype will be considered successful when observed use demonstrates that:

1. The child can identify and open the available book with little or no instruction.
2. The child can move between pages and activate word pronunciation independently.
3. The child remains engaged through the full 5–7 minute story.
4. The route choice is understood without creating anxiety or confusion.
5. Optional discoveries are noticed but do not prevent reading.
6. The child recognizes the completion keepsake and asks or chooses to replay.
7. The parent enjoys using the experience as shared reading time.
8. The Blender pipeline can produce consistent, layered scenes at acceptable quality and effort.

These outcomes will be evaluated through direct observation rather than analytics or self-reported ratings from the child.

## 10. First Story Definition

### 10.1 Premise

A young astronaut receives or discovers a call for help from a stranded friendly alien. Although the destination is unfamiliar, the astronaut chooses to help. The child selects one of two routes through space. Each route presents a distinct scene and discovery before reconnecting with the rescue. The astronaut reaches the alien, helps it return to safety, and learns that courage means helping even when the path feels uncertain.

### 10.2 Theme

- Primary theme: Courage and confidence
- Supporting theme: Kindness through helping someone in need
- Emotional outcome: Reassurance, pride, and curiosity

### 10.3 Structure

- 8–10 reading spreads in one complete playthrough
- 1–2 short sentences per spread
- One major route choice
- Two visually and narratively distinct routes
- One shared positive ending
- Approximately one interaction per scene
- A mixture of route choice and environmental discoveries
- No failure state or negative ending

### 10.4 Astronaut selection

- Before reading, the child chooses from 2–3 authored astronaut presets.
- Each preset has a fixed appearance and name.
- Presets are not based on the child’s personal data or likeness.
- The selected astronaut is remembered on the device.
- The selection can be changed from the book-opening flow.

### 10.5 Completion reward

- Completing the story adds the rescued creature to the bookshelf.
- The creature acts as a story-specific keepsake, not a generic badge or point.
- The completed book subtly indicates that another route remains undiscovered.
- The child can replay from the shelf to explore the alternate route.

## 11. Core User Journeys

### 11.1 Start a new story

1. Child arrives at the magical bookshelf.
2. Child selects the space book.
3. Book preview opens as a portal into the story world.
4. Child selects English or Indonesian.
5. Child confirms or changes the preset astronaut.
6. Child opens the book.
7. The first spread appears.

### 11.2 Read and explore

1. Child or parent reads the 1–2 short sentences.
2. Child may tap any word to hear it pronounced.
3. Child may discover the optional scene interaction.
4. After a short delay, an undiscovered interactive object may pulse subtly.
5. Child swipes or taps a page edge to continue.
6. At the branch scene, child chooses one of two routes.
7. The selected route remains locked for that playthrough.

### 11.3 Resume an unfinished story

1. Child reopens the book from the shelf.
2. The application resumes at the last completed spread automatically.
3. The selected language, astronaut, and route state are restored.

### 11.4 Complete and replay

1. Child reaches the shared ending and completes the rescue.
2. A gentle completion moment introduces the rescued creature.
3. The application returns to or reveals the bookshelf.
4. The creature now lives on the shelf as a keepsake.
5. The book signals that an alternate route can be discovered.
6. Reopening a completed book starts a new playthrough and permits a new route choice.

### 11.5 Access parent controls

1. Parent presses and holds the parent-control affordance.
2. The application displays a short written instruction intended for an adult reader.
3. After completing the prompt, the parent can change sound settings or reset progress.

## 12. Functional Requirements

Priority definitions:

- **Must:** Required for prototype acceptance
- **Should:** Important but may be adjusted if it threatens the prototype schedule
- **Could:** Optional enhancement

### 12.1 Bookshelf

| ID | Priority | Requirement |
|---|---|---|
| SHELF-01 | Must | Present the opening experience as a magical bookshelf rather than a generic cover grid. |
| SHELF-02 | Must | Display the space book as a selectable portal into its story world. |
| SHELF-03 | Must | Make the primary book-selection target large and touch friendly. |
| SHELF-04 | Must | Show the rescued creature keepsake after story completion. |
| SHELF-05 | Must | Preserve the keepsake after closing and reopening the application. |
| SHELF-06 | Must | Indicate subtly when an alternate route remains undiscovered. |
| SHELF-07 | Should | Use restrained animation that makes the shelf feel alive without competing for attention. |

### 12.2 Book opening and configuration

| ID | Priority | Requirement |
|---|---|---|
| OPEN-01 | Must | Allow selection of English or Indonesian before opening the story. |
| OPEN-02 | Must | Apply the selected language to the shelf, reader, prompts, and parent controls. |
| OPEN-03 | Must | Allow selection from 2–3 fixed astronaut presets. |
| OPEN-04 | Must | Remember the selected astronaut and language on the device. |
| OPEN-05 | Must | Preserve story progress when the interface language changes. |
| OPEN-06 | Should | Preview the selected astronaut before opening the book. |

### 12.3 Reader and navigation

| ID | Priority | Requirement |
|---|---|---|
| READ-01 | Must | Present a two-page, book-like spread on the target iPad in landscape. |
| READ-02 | Must | Support both horizontal swipe and tap-edge navigation. |
| READ-03 | Must | Use a brief book-like page transition without requiring realistic page dragging. |
| READ-04 | Must | Prevent accidental navigation while the child is interacting with a scene object. |
| READ-05 | Must | Automatically restore the last completed spread after reopening an unfinished book. |
| READ-06 | Must | Allow previously visited spreads to be reviewed while keeping the selected route locked. |
| READ-07 | Must | Prevent the route from being changed until the story is completed and replayed. |
| READ-08 | Must | Provide a clear, protected path back to the bookshelf. |
| READ-09 | Should | Adapt to a single-page presentation on narrow phone screens. |
| READ-10 | Should | Remain functional on desktop browsers using pointer input. |

### 12.4 Story text and word assistance

| ID | Priority | Requirement |
|---|---|---|
| TEXT-01 | Must | Display 1–2 short sentences per spread in a dedicated text region. |
| TEXT-02 | Must | Keep the text panel visually subordinate to, and non-obstructive of, the scene. |
| TEXT-03 | Must | Reserve a text-safe region in every illustration composition. |
| TEXT-04 | Must | Make every visible story word independently tappable. |
| TEXT-05 | Must | Highlight the selected word while it is being pronounced. |
| TEXT-06 | Must | Pronounce the selected word in the active story language. |
| TEXT-07 | Must | Avoid full-sentence or automatic story narration. |
| TEXT-08 | Should | Prevent repeated rapid taps from producing overlapping speech. |

### 12.5 Branching

| ID | Priority | Requirement |
|---|---|---|
| BRANCH-01 | Must | Present one major choice between two routes through space. |
| BRANCH-02 | Must | Make both choices visually distinct and equally valid. |
| BRANCH-03 | Must | Give each route at least one distinct scene or discovery. |
| BRANCH-04 | Must | Reconnect both routes before the shared rescue and ending. |
| BRANCH-05 | Must | Persist the selected route when the reading session is resumed. |
| BRANCH-06 | Must | Reset route eligibility when a completed story is replayed. |

### 12.6 Scene interactions

| ID | Priority | Requirement |
|---|---|---|
| INT-01 | Must | Provide approximately one interaction per scene. |
| INT-02 | Must | Mix narrative choice with simple environmental discoveries. |
| INT-03 | Must | Never require an optional discovery to turn the page. |
| INT-04 | Must | Give immediate visual and gentle audio feedback after a successful interaction. |
| INT-05 | Must | Pulse an undiscovered interactive object subtly after a short period of inactivity. |
| INT-06 | Must | Keep interactive targets large enough for young children using touch. |
| INT-07 | Should | Allow completed environmental interactions to be replayed when revisiting a spread. |

### 12.7 Sound

| ID | Priority | Requirement |
|---|---|---|
| SOUND-01 | Must | Include pronunciation audio for tapped words. |
| SOUND-02 | Must | Include gentle effects for page turns, discoveries, choices, and completion. |
| SOUND-03 | Must | Exclude music, continuous ambience, and full narration. |
| SOUND-04 | Must | Provide mute or volume control behind the parent gate. |
| SOUND-05 | Must | Prevent effects from overwhelming or obscuring spoken words. |
| SOUND-06 | Should | Respect reduced-motion and device audio expectations where applicable. |

### 12.8 Parent gate and reset

| ID | Priority | Requirement |
|---|---|---|
| PARENT-01 | Must | Protect parent controls with a press-and-hold gesture followed by a short reading prompt. |
| PARENT-02 | Must | Localize the parent gate and controls in English and Indonesian. |
| PARENT-03 | Must | Allow the parent to change sound settings. |
| PARENT-04 | Must | Allow the parent to reset story progress and keepsakes. |
| PARENT-05 | Must | Require confirmation before destructive reset. |
| PARENT-06 | Must | Keep the gate unobtrusive in the child-facing interface. |

### 12.9 Local progress

| ID | Priority | Requirement |
|---|---|---|
| DATA-01 | Must | Store settings, selected astronaut, reading position, route, route discovery, and keepsake locally. |
| DATA-02 | Must | Restore valid local progress after closing and reopening the browser or installed web app. |
| DATA-03 | Must | Require no account or sign-in. |
| DATA-04 | Must | Collect no child name, image, voice, or likeness. |
| DATA-05 | Must | Keep language selection independent from narrative progress. |

### 12.10 Offline behavior

| ID | Priority | Requirement |
|---|---|---|
| OFFLINE-01 | Must | Make the complete current book and required visual assets available without a network connection after initial availability. |
| OFFLINE-02 | Must | Preserve reading, interactions, progress, and keepsakes offline. |
| OFFLINE-03 | Must | Validate English and Indonesian word pronunciation offline on the target iPad. |
| OFFLINE-04 | Must | If acceptable offline browser voices are unavailable, replace runtime speech with pre-generated and reviewed word clips before prototype acceptance. |
| OFFLINE-05 | Should | Communicate clearly if initial book preparation requires connectivity. |

## 13. Localization Requirements

- English and Indonesian are equal supported languages.
- The entire application interface must be translated, not only story text.
- Story meaning, emotional tone, and age appropriateness must be preserved rather than translated mechanically.
- Text layouts must tolerate different line lengths without reducing readability.
- Language changes must not create separate progress histories.
- Word pronunciation must use the correct language voice or reviewed audio asset.
- Generated or translated content must be reviewed by a fluent adult before child use.

## 14. Visual and Asset Requirements

### 14.1 General requirements

- Art must be suitable for children aged 4–6.
- Machines such as rockets must remain non-living objects without faces or human personalities.
- Living characters may include humans, friendly aliens, or animals.
- Scenes must avoid frightening imagery, visual clutter, and realistic peril.
- Every scene must include a reserved text-safe region.
- Important content must remain visible under responsive cropping.
- Interactive objects must be separable from the background where animation or tapping requires it.
- Generated images must not contain embedded text; application text is rendered by the web interface.

### 14.2 Blender technical-art spike

Art direction will be selected only after a constrained Blender spike.

The spike will produce one representative story scene containing:

- A preset young astronaut
- A space environment
- The stranded friendly alien or a clear indication of the rescue objective
- At least one independently rendered interactive object
- A reserved text-safe region
- Background, character, foreground, interaction, and effect layers as applicable

The spike must evaluate:

1. Child appeal and emotional warmth
2. Astronaut and alien consistency
3. Visual clarity at iPad reading size
4. Responsive cropping feasibility
5. Transparent layered export quality
6. File size and loading behavior
7. Render and iteration time
8. Reuse across multiple scenes and poses
9. Web animation feasibility

The exploration may consider paper diorama, soft clay, miniature toy-set, low-poly, or another feasible direction. The number of explored directions is determined by feasibility, but the deliverable remains one approved representative scene.

### 14.3 Delivery format

- Use pre-rendered image layers for the prototype.
- Prefer web-optimized formats for delivery while retaining lossless source exports where needed.
- Do not require live 3D rendering for story playback.
- Short pre-rendered effects may be considered only if they improve the scene without harming performance or calmness.

## 15. Accessibility and Child Usability

The prototype must:

- Use large, forgiving touch targets.
- Maintain readable text size and line spacing on the target iPad.
- Meet appropriate contrast requirements for story and interface text.
- Avoid using color as the only indicator of action or state.
- Provide visible focus behavior for non-touch navigation where supported.
- Honor reduced-motion preferences with simpler transitions and no pulsing animation.
- Avoid time-limited interactions.
- Avoid failure feedback that feels punitive.
- Prevent accidental exits and destructive resets.
- Ensure child-facing instructions do not depend on advanced reading ability.

## 16. Privacy and Safety

For the private prototype:

- No child account will exist.
- No sensitive child data will be requested or stored.
- No advertising, tracking SDK, social integration, or third-party analytics will be included.
- Progress will remain on the device.
- No AI-generated content will be shown to the child without adult review.
- Story, translation, art, and pronunciation must be reviewed before use.
- External assets must have appropriate rights for prototype use.

Public release, cloud storage, and commercial distribution would require a separate privacy, safety, licensing, and legal review.

## 17. Performance and Compatibility

### Primary acceptance environment

- Current supported iPadOS release available on the family test device
- Safari and installed PWA behavior, if installation is used
- Landscape orientation
- Touch input

### Requirements

- Page navigation and interactions must feel immediate after the book is loaded.
- The application must avoid visible layout shifts during reading.
- Images must be appropriately sized and compressed for the target display.
- Story assets must not exhaust browser storage under normal prototype use.
- Losing connectivity during a prepared book must not interrupt reading.
- Orientation changes must not lose progress, even when landscape remains the preferred presentation.
- The responsive reader should remain functional on phones and desktop browsers, while iPad receives primary polish and testing.

Specific performance budgets will be set in the Technical Design Document after the Blender spike establishes representative asset sizes.

## 18. Validation Plan

### 18.1 Usability observation

Observe at least three complete sessions where practical:

1. First use with normal parent availability
2. Repeat use with minimal assistance
3. Replay after completion to discover the alternate route

Record observations about:

- First taps on the bookshelf
- Ability to choose language and astronaut
- Discovery of page navigation
- Use of word pronunciation
- Mis-taps or repeated taps
- Recognition of interactive hints
- Understanding of the route choice
- Completion and attention span
- Recognition of the shelf keepsake
- Requests to replay or stop
- Moments requiring adult explanation

### 18.2 Technical validation

Validate on the target iPad:

- English speech quality
- Indonesian speech quality
- Offline speech availability
- Touch and swipe behavior
- Local progress restoration
- Offline book loading
- Language switching without progress loss
- Reduced-motion behavior
- Parent gate and reset confirmation
- Layered artwork quality and performance

## 19. Prototype Acceptance Criteria

The prototype is ready for family evaluation when:

1. All Must requirements are implemented or an explicitly approved exception is documented.
2. One complete English and Indonesian story is available.
3. Both routes are complete and converge correctly.
4. Every story word can be pronounced acceptably in both languages on the target iPad.
5. The story can be completed after the network is disconnected.
6. Progress, route, astronaut, settings, and keepsake survive application restart.
7. Optional interactions never prevent story completion.
8. The parent can control sound and safely reset progress.
9. The Blender spike has produced an approved layered scene and a feasible production direction.
10. No sensitive child data or external analytics are present.

## 20. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Indonesian browser voice is absent or poor on iPad | Word assistance fails product expectations | Test early; use pre-generated reviewed clips if needed. |
| Browser speech is unavailable offline | Offline experience is incomplete | Treat offline speech as an acceptance gate and provide cached audio fallback. |
| Blender production is too slow or inconsistent | Additional stories become impractical | Constrain the spike, reuse models and lighting, and compare production effort alongside quality. |
| Artwork crops poorly across devices | Story content or text becomes obscured | Use text-safe and crop-safe regions from the first composition. |
| Interactions distract from reading | Product becomes game-like | Limit frequency, keep discoveries optional, and observe child behavior. |
| Child cannot discover navigation | Reading requires continual adult help | Support both swipe and edge taps with subtle visual affordances. |
| Local browser data is cleared | Progress and keepsake are lost | Accept for private prototype; communicate this limitation to the parent. |
| Two languages create layout or meaning inconsistencies | Reading quality differs by language | Review both versions and test every spread at target size. |
| Scope expands into story generation or account infrastructure | Core reading UX remains unvalidated | Enforce non-goals until the one-book prototype has been observed successfully. |

## 21. Dependencies

- Approved story outline and branching map
- Reviewed English and Indonesian scripts
- Preset astronaut designs
- Blender technical-art spike
- Reviewed pronunciation solution for both languages
- Story interaction inventory
- Target iPad for usability and offline testing

## 22. Intentionally Deferred Decisions

The following decisions will be handled outside this PRD:

- Final art style, pending the Blender spike
- Final astronaut and alien visual designs
- Exact route environments and scene compositions
- Product and story branding
- Production-scale audio provider
- Public account and synchronization architecture
- AI-assisted editor design
- Commercial licensing and public child-safety compliance
- Exact technical framework, schemas, caching approach, and performance budgets

## 23. Follow-Up Documents

1. **Story Specification** — final script, branching map, spread inventory, vocabulary, and interactions
2. **UX Specification** — wireframes, states, gestures, responsive layouts, and parent gate behavior
3. **Blender Spike Brief** — representative scene, asset outputs, constraints, and evaluation rubric
4. **Art Bible** — selected style, palette, characters, cameras, lighting, composition, and export standards
5. **Technical Design Document** — application architecture, story schema, local persistence, offline model, localization, speech, and asset delivery
6. **Test and Usability Plan** — automated checks, iPad test matrix, and observation protocol
7. **Implementation Plan** — phases, tasks, dependencies, and verification checkpoints
