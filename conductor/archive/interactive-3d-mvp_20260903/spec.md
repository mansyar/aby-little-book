# Specification: Interactive 3D Storybook MVP

## Overview

Rebuild Aby Little Book as a private bilingual (EN/ID) interactive 3D
storybook PWA for ages 4–6 + adults. Home is the Starlit Dock: wooden dock,
night lake, bobbing story boats, tap-to-board. First story is a night-lake
adventure with a child and a shy baby turtle about sharing: 10 spreads, one
safe branch, two routes converging. Hybrid rendering: Three.js scenes for
guided tactile exploration + DOM overlay for all prose. Fully agent-executed
art via Blender MCP + headless builders to GLB (Draco) + KTX2. Refactor the
existing app in place; keep Node24/pnpm/TS7/Biome/CI/Docker/GHCR/Coolify.
Slice-first: prove dock + builders + 3-spread slice, then expand to 10 in the
same track. Tagged release with changelog and rollback is in scope.

No celestial bookshelf, no Lumi, no Starlight Rescue.

## Functional Requirements

1. **Starlit Dock home:** calm night dock, water shader, 1+ bobbing story
   boats, fireflies; tap boat to board; dock shows unprepared / preparing /
   ready / in-progress / complete states; Continue restores stable position.
2. **Story content:** 10 spreads max 2 short sentences each, EN + ID as DOM
   data (Zod-validated, not code, never baked in textures); 3 characters max
   (child, turtle, minimal narrator presence); one safe route choice, two
   complete routes, converged ending locked to current reading; replay
   discovers alternate route; agent-drafted prose + fluent-adult review.
3. **Guided tactile reader:** tap hotspots only (water, turtle, words, boat
   parts); glow-plus-word feedback; gentle camera beats on story moments; no
   free orbit; words/targets/choices never navigate away; anti-repeat commit
   lock; back preserves route; speech/hints cancel on commit.
4. **Pronunciation:** every eligible word has an accessible control; provider
   interface over SpeechSynthesis; cancel/replace, no overlap; brief local
   effects only; equivalent meaning when silent; no narration/music/ambience.
5. **Responsive + a11y:** authored iPad-landscape + phone-portrait; desktop
   pointer/keyboard; every hotspot has DOM equivalent (name/focus/keyboard);
   text-safe regions; lantern-calm motion; reduced-motion freezes water,
   fireflies, bobbing, camera without hiding story; poster + full story when
   WebGL missing.
6. **Persistence + offline:** IndexedDB (settings/progress/route/history/
   completion/readiness) with migrations; explicit Download/Prepare with hash
   verification before atomic ready; Cache Storage for GLB/KTX2/manifests;
   injectManifest SW (shell precache, prepared-immutable serve); safe update
   never interrupts open reader; missing/evicted detected with one calm
   recovery; reset behind adult gate + confirm.
7. **Agent 3D pipeline:** style-bible.json + versioned builders (dock, boat,
   turtle, child) via Blender MCP live iteration + headless export (Blender
   5.2 LTS); glTF-transform Draco + KTX2; manifest (dims/bounds/pivots/
   budgets/hashes/builder+style sha/seed); Eevee iPad/phone rest/response
   previews; vision checks; budget gates; no hand edits; cute-minimal faces
   (bead eyes, blush, no mouth).
8. **Caregiver + completion:** adult-gated settings (language, sound, text,
   reduced-motion), prepare/reset with plain confirm + focus restore; calm
   completion keepsake; preserve history across reset of current reading.
9. **Validation + delivery:** TDD for logic-bearing code, 80% scoped lines +
   branches; Vitest/TL/Playwright (Chromium/WebKit) + asset/manifest/vision
   gates + deterministic captures; physical-iPad gate; bilingual + a11y review;
   private GHCR immutable images; Coolify exact tag/digest HTTPS; /healthz +
   /version.json; CHANGELOG + release notes; recorded rollback + drill.

## Non-Functional Requirements

- Reading comprehension first; calm, safe, forgiving, local-first, private.
- EN = ID in completeness and quality; natural phrasing, structure may differ.
- iPad installed-PWA performance: bounded scene bytes/tris/draw calls, active
  content only, stable progress across interrupt/restart/offline.
- No accounts/auth/backend/analytics/ads/tracking/remote errors/third-party
  runtime/remote fonts/remote media/remote 3D marketplaces.
- Strict TS7, Biome with general/html-css/typescript/python guides, pinned
  toolchain, reproducible agent builds.

## Acceptance Criteria

- Child 4–6 boards from Starlit Dock and completes either route with adult
  support, understands the sharing story, touches without treating it as a game.
- Both routes + converged ending work in EN and ID; every eligible word speaks
  acceptably in isolation.
- Slice approved (dock + 3 spreads) before mass production; full 10 spreads
  validated versioned, no placeholders, within budgets.
- Prepared installed PWA completes offline on physical iPad; progress survives
  terminate/reopen; reduced-motion + fallback pass.
- Second boat rebuilds agent-only from builders + style bible (repeatability).
- All gates green; tag/CHANGELOG/release-notes/version.json/Coolify/digest
  agree; rollback proven.

## Out of Scope

- Public/commercial release; more than one production story.
- Celestial bookshelf, Lumi, Starlight Rescue.
- Accounts/profiles/auth/sync/backend/CMS/analytics/ads/tracking.
- Runtime AI, full narration/recording/music/ambience.
- Points/streaks/rewards/mini-games/fail states/social/sharing.
- Free-orbit sandbox, in-canvas story text, realistic faces.
- Routing library, global-state framework, remote 3D dependencies.
