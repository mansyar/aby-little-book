# Implementation Plan: Interactive 3D Storybook MVP

## Phase 1: Hybrid Toolchain, Shell, and Container Baseline

- [x] Task: Pin Three.js hybrid toolchain and test scaffolding (b8b91a5)
  - [x] Record pinned Three.js + React + Vite + TS7 + Node24 + pnpm versions
  - [x] Configure Biome (general/html-css/typescript/python) + Vitest/TL/Playwright
  - [x] Add `validate:assets` and `build:assets` script roles + CI gates
- [x] Task: Create poster-fallback app shell with health and version (422bac5)
  - [x] Failing landmark/localized shell test, then Vite entry/shell/error boundary
  - [x] Local fonts/tokens/layout/reduced-motion + /healthz + /version.json
- [x] Task: Establish static container baseline (b2f0c83)
  - [x] Pinned multi-stage Node builder + unprivileged Nginx 8080, SPA/MIME/cache/security/no-index
- [x] Task: Phase Verification & Checkpoint (62bbea4)

## Phase 2: Story, Scene, and Package Contracts

- [x] Task: Define failing contract tests for story + 3D packages (9b379e1)
  - [x] Story spreads/routes/convergence, EN/ID parity, manifest/budget/pivot/hash rules
- [x] Task: Implement Zod contracts with inferred types (185320f)
  - [x] Story/spread/token/interaction/route/ending, scene/asset/package/readiness schemas
- [x] Task: Implement build-time validators (c730087)
  - [x] Parity/schema/refs/graphs/budgets/pivots/hashes with actionable diagnostics
- [x] Task: Encode 3-spread slice prose (agent draft + fluent fix, EN + ID) (7ba21dc)
  - [x] Versioned slice data, no placeholders, no baked text
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: State, Reader Engine, Persistence, and Offline

- [x] Task: Define failing app-state tests, then implement pure app reducer (11f31d4)
  - [x] Dock/prep/reader/completion/caregiver states, reject invalid, no router
- [x] Task: Define failing guided-reader tests, then implement reader engine (826ef9b)
  - [x] Spread flow, tap ownership, camera-beat rules, route preserved on back, reduced-motion freeze
- [x] Task: Define failing persistence tests, then implement IndexedDB repos (4b7e8d1)
  - [x] idb schema/migrations/settings/progress/route/history/completion/readiness, calm recovery
- [x] Task: Implement explicit 3D preparation + service worker + safe update (f4045d2)
  - [x] Bounded download, hash verify before atomic ready, progress/retry UI, shell precache, prepared-immutable serve, deferred activation
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Fully-Agent 3D Builder Pipeline

- [x] Task: Author style bible + versioned builders via Blender MCP (8510c3f)
  - [x] style-bible.json (colors/roughness/bevel/light rig/cameras), builders for dock/boat/turtle/child, seed logging
- [x] Task: Implement headless export + optimize jobs (efa2809)
  - [x] background Blender build/export, glTF-transform Draco, KTX2, manifest with budgets/hashes/shas/seed
- [x] Task: Implement auto-review gates (0d0b82d)
  - [x] Eevee iPad/phone rest/response previews, vision checks, budget/pivot/no-baked-text gates
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 5: Slice Integration and Approval Gate

- [x] Task: Build hybrid dock + 3-spread slice renderer (assets daaee8c; renderer 9712f1f)
  - [x] Failing layout/semantic/hotspot tests first; Three.js scene + DOM overlay; active-content bounds; pre-decode where supported
- [x] Task: Implement guided taps, glow-plus-word, camera beats, fallback (d1a9654)
  - [x] Ownership tests; provider speech cancel/replace; reduced-motion freeze; poster fallback
- [x] Task: Prove slice offline + responsive + captures (6e1dd6c)
  - [x] Playwright prepare/disconnect/complete/reload, rest/response captures, safe-region/overlay fit
- [x] Task: Slice approval gate — approved by owner after live ?scene review + viewport fix (4983d4f)
- [x] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 6: Expand to 10 Spreads + Family Flows

- [x] Task: Produce remaining builders output + integrate full EN/ID prose (story 47807e5; prose 2167c6b)
  - [x] Remaining spreads/boats via pipeline only; fluent review fixes; validate routes/endings
- [x] Task: Implement dock states, caregiver controls, completion keepsake (views d870656/1aae604/2f12fc1; rewire 0542651; journeys+publisher 08b5125)
  - [x] States (new/preparing/ready/in-progress/complete), adult gate/settings/reset, calm ending + history
- [x] Task: Complete end-to-end journeys + reviews (08b5125)
  - [x] Both routes/locales/replay/reset, keyboard/pointer/reduced-motion, a11y + bilingual review fixes
- [x] Task: Phase Verification & Checkpoint (gates: 450 unit + 54 e2e green, biome 182 clean, build + postbuild ok)

## Phase 7: Validation, Tagged Release, and Rollback

- [x] Task: Run release-candidate matrix (c17cd5a)
  - [x] TS/Biome/validators/unit/component/browser/assets/visual gates; fix blockers
- [x] Task: Complete physical-iPad acceptance + family observation (owner-confirmed 2026-09-03, dev-LAN; install/SW-offline/update deferred to prod journey)
  - [x] Install/prepare/both routes offline/terminate-resume/update/speech/touch/perf/memory; comprehension notes; privacy checklist
- [x] Task: Publish tagged release with changelog (tag v0.1.0 = 683a599 pushed to origin; GHCR image deferred)
  - [ ] Owner-approved v0.x.y tag, CHANGELOG + release notes (3D package version, builder sha, migrations, known issues), GHCR immutable tags, record digest
- [x] Task: Deploy via Coolify + verify + rollback drill (deferred by owner 2026-09-03 — local-release close; Coolify/GHCR/prod journey/rollback pending)
  - [ ] Exact tag/digest HTTPS 8080, /healthz/version.json/cache/security/no-index/digest match, prod family journey, prior known-good restore proof (deferred to prod journey)
- [x] Task: Phase Verification & Checkpoint (683a599) — local-release close, prod deferred

## Phase Review Fixes

- [x] Task: Apply review suggestions (b062b97)
