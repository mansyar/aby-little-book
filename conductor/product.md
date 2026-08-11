# Product Definition: Aby Little Book

## Product Summary

Aby Little Book is a private, bilingual English–Indonesian interactive
picture-book PWA for children aged 4–6 and their accompanying adults. It
presents a calm celestial bookshelf and gently animated illustrated stories
that support shared and early independent reading without turning reading
into a game.

The first prototype delivers one polished 5–7 minute story,
*The Starlight Rescue*, with safe child agency, isolated word pronunciation,
local progress, offline iPad use, responsive phone support, and a privacy-first
architecture without accounts, analytics, or backend services.

## Product Vision

Create a calm, magical bookshelf where young children can enter illustrated
worlds, participate without making wrong choices, and gain confidence as early
readers.

> A book brought gently to life—not a game with text added to it.

## Problem

Most digital reading experiences for young children are either static ebooks
that offer little reading support or game-like apps where rewards and activity
overshadow the story. Families need a quieter experience that preserves shared
reading, clear storytelling, imagination, and child agency.

## Target Users

### Primary

Children aged 4–6 who are emerging readers and benefit from short text,
clear visual hierarchy, optional pronunciation help, forgiving interaction,
and calm pacing.

### Secondary

Parents and caregivers who read alongside the child, manage language and
accessibility settings, prepare the book for offline use, and control
destructive actions.

## Prototype Outcome

Validate that a child can understand, enjoy, and complete a calm bilingual
interactive story on the target family iPad while establishing foundations
that can support additional authored books later.

## Goals

1. Deliver one complete, polished 5–7 minute story in English and Indonesian.
2. Preserve reading as the primary activity while adding gentle, meaningful
   interaction.
3. Support shared reading and early independent reading without full narration.
4. Offer one safe branching decision with no wrong choice or failure state.
5. Work reliably offline after explicit preparation on the target iPad.
6. Preserve local progress, settings, route history, and earned keepsakes.
7. Validate accessible iPad, phone, pointer, and keyboard experiences.
8. Validate a repeatable Blender-to-layered-web illustration pipeline.
9. Protect family privacy by avoiding accounts, analytics, tracking, and
   child-supplied personal information.
10. Establish reusable story-engine and content foundations without expanding
    the first prototype beyond one production book.

## Non-Goals

The first prototype does not include:

- Public or commercial release
- Multiple production books
- Accounts, profiles, authentication, or cloud synchronization
- Backend APIs, database servers, or content-management systems
- Analytics, advertising, tracking, or remote error collection
- AI generation or editing in the running application
- Full-story narration, voice recording, music, or ambient audio
- Points, streaks, competitive rewards, or complex mini-games
- Social, sharing, community, or publishing features
- Live 3D rendering as the primary story presentation

## Core Product Principles

1. Story comprehension takes priority over decoration or interaction.
2. English and Indonesian are equal product requirements.
3. Interactions are optional or safely bounded; children cannot fail.
4. Motion and sound are gentle, purposeful, and accessible.
5. The experience is local-first, private, and resilient offline.
6. The prototype remains narrow while its authored-content foundations are
   reusable.

## Success Criteria

The prototype succeeds when:

- A child aged 4–6 can navigate from bookshelf to story completion with
  appropriate adult support.
- The child understands the core story and enjoys the experience without
  treating it primarily as a game.
- Both complete routes work in English and Indonesian.
- The installed PWA completes reliably offline on the physical family iPad.
- Progress survives termination and reopening.
- Touch, keyboard, reduced-motion, pronunciation, responsive layout, and
  accessibility requirements pass their defined checks.
- English, Indonesian, story, UX, and visual content receive human review.
- Automated tests, production build, container, deployment, health, and
  rollback gates pass.
- The Blender-to-web workflow is practical enough to repeat for later stories.

## Product Horizon

The prototype is a private, single-story validation project. Its architecture
and content model should support future authored books, but implementation must
not introduce speculative platform features before the first story proves the
reading experience.
