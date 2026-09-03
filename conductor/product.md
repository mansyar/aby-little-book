# Product Definition: Aby Little Book — Interactive 3D Storybook

## Product Summary

Aby Little Book is a private, bilingual English–Indonesian interactive 3D
picture-book PWA for children aged 4–6 and their accompanying adults. It
presents a calm night-lake home — the Starlit Dock — where story boats bob
gently and children tap a boat to board its story.

The first prototype delivers one polished 5–7 minute story, a night-lake
adventure with a child and a shy baby turtle about sharing, with safe child
agency, isolated word pronunciation, local progress, offline iPad use,
responsive phone support, and a privacy-first architecture without accounts,
analytics, or backend services.

Story worlds are rendered in Three.js for guided tactile exploration. Story
prose stays as accessible DOM overlay, never baked into 3D textures, so reading
remains the primary activity.

## Product Vision

Create a calm, touchable lake world where young children can board a story
boat, touch gently without making wrong choices, and gain confidence as early
readers.

> A book you can touch gently — not a game with text added to it.

## Problem

Most digital reading experiences for young children are either static ebooks
that offer little reading support or game-like apps where rewards and activity
overshadow the story. Families need a quieter experience that preserves shared
reading, clear storytelling, imagination, and child agency — now with enough
tactility that touching feels meaningful.

## Target Users

### Primary

Children aged 4–6 who are emerging readers and benefit from short text,
clear visual hierarchy, optional pronunciation help, forgiving touch
interaction, and calm pacing.

### Secondary

Parents and caregivers who read alongside the child, manage language and
accessibility settings, prepare the book for offline use, and control
destructive actions.

## Prototype Outcome

Validate that a child can understand, enjoy, and complete a calm bilingual
tactile story on the target family iPad while establishing agent-repeatable
3D foundations that can support additional story boats later.

## Goals

1. Deliver one complete, polished 5–7 minute night-lake story in English and Indonesian.
2. Replace the celestial bookshelf with the Starlit Dock: wooden dock, calm water, bobbing story boats, tap-to-board.
3. Tell a new story: child + shy baby turtle, heart theme sharing, 10 spreads with one safe branch and two routes converging. No Lumi.
4. Preserve reading as the primary activity while adding guided tactile meaning.
5. Support shared reading and early independent reading without full narration.
6. Offer safe agency with no wrong choice or failure state; free orbit never strands the story.
7. Work reliably offline after explicit preparation on the target iPad.
8. Preserve local progress, settings, route history, and completion.
9. Validate accessible iPad, phone, pointer, keyboard, and reduced-motion experiences with 3D.
10. Validate a fully agent-executable Blender-to-Three.js pipeline: versioned Python builders via Blender MCP + headless export to compressed GLB + KTX2, plus procedural water/sky/glow.
11. Protect family privacy by avoiding accounts, analytics, tracking, and child-supplied personal information.
12. Establish reusable 3D scene, story-engine, and content foundations without expanding the first prototype beyond one production story.

## Non-Goals

The first prototype does not include:

- Public or commercial release
- Multiple production stories
- The old celestial bookshelf, Lumi, or *The Starlight Rescue*
- Accounts, profiles, authentication, or cloud synchronization
- Backend APIs, database servers, or content-management systems
- Analytics, advertising, tracking, or remote error collection
- AI generation or editing in the running application
- Full-story narration, voice recording, music, or ambience
- Points, streaks, competitive rewards, complex mini-games, or failure states
- Social, sharing, community, or publishing features
- Free-orbit sandbox exploration or in-canvas story text
- Hosted fonts, third-party scripts, or remotely hosted runtime media
- Live 3D characters with realistic faces; cute-minimal only

## Core Product Principles

1. Story comprehension takes priority over decoration or interaction.
2. English and Indonesian are equal product requirements.
3. Touch is guided and bounded; children cannot fail or get lost.
4. Text is DOM: semantic, resizable, pronounceable, never baked into 3D.
5. Motion and sound are gentle, purposeful, and accessible; reduced-motion freezes ambient 3D without hiding story.
6. The experience is local-first, private, and resilient offline.
7. Art is agent-built: style as code, models as versioned builds, every asset validated and reproducible.
8. The prototype remains narrow while its 3D + story foundations are reusable.

## Success Criteria

The prototype succeeds when:

- A child aged 4–6 can navigate from Starlit Dock to story completion with appropriate adult support.
- The child understands the sharing story and enjoys touching without treating it primarily as a game.
- Both complete routes work in English and Indonesian.
- The installed PWA completes reliably offline on the physical family iPad.
- Progress survives termination and reopening.
- Touch, keyboard, guided camera, reduced-motion, pronunciation, responsive layout, and accessibility requirements pass their defined checks.
- English and Indonesian receive review; 3D auto-review (renders, budgets, browser captures) passes with human exception-gating only.
- Automated tests, asset validators, production build, container, deployment, health, and rollback gates pass.
- The agent Blender MCP + headless GLB/KTX2 workflow repeats for a second boat without manual sculpting.

## Product Horizon

The prototype is a private, single-story 3D validation project. Its architecture
and content model should support future story boats on the same dock, but
implementation must not introduce speculative platform features before the first
tactile story proves the reading experience.
