# Implementation Plan: Interactive 3D Storybook MVP

## Phase 1: Hybrid Toolchain, Shell, and Container Baseline

- [x] Task: Pin Three.js hybrid toolchain and test scaffolding (b8b91a5)
  - [ ] Record pinned Three.js + React + Vite + TS7 + Node24 + pnpm versions
  - [ ] Configure Biome (general/html-css/typescript/python) + Vitest/TL/Playwright
  - [ ] Add `validate:assets` and `build:assets` script roles + CI gates
- [x] Task: Create poster-fallback app shell with health and version (422bac5)
  - [ ] Failing landmark/localized shell test, then Vite entry/shell/error boundary
  - [ ] Local fonts/tokens/layout/reduced-motion + /healthz + /version.json
- [ ] Task: Establish static container baseline
  - [ ] Pinned multi-stage Node builder + unprivileged Nginx 8080, SPA/MIME/cache/security/no-index
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 2: Story, Scene, and Package Contracts

- [ ] Task: Define failing contract tests for story + 3D packages
  - [ ] Story spreads/routes/convergence, EN/ID parity, manifest/budget/pivot/hash rules
- [ ] Task: Implement Zod contracts with inferred types
  - [ ] Story/spread/token/interaction/route/ending, scene/asset/package/readiness schemas
- [ ] Task: Implement build-time validators
  - [ ] Parity/schema/refs/graphs/budgets/pivots/hashes with actionable diagnostics
- [ ] Task: Encode 3-spread slice prose (agent draft + fluent fix, EN + ID)
  - [ ] Versioned slice data, no placeholders, no baked text
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 3: State, Reader Engine, Persistence, and Offline

- [ ] Task: Define failing app-state tests, then implement pure app reducer
  - [ ] Dock/prep/reader/completion/caregiver states, reject invalid, no router
- [ ] Task: Define failing guided-reader tests, then implement reader engine
  - [ ] Spread flow, tap ownership, camera-beat rules, route preserved on back, reduced-motion freeze
- [ ] Task: Define failing persistence tests, then implement IndexedDB repos
  - [ ] idb schema/migrations/settings/progress/route/history/completion/readiness, calm recovery
- [ ] Task: Implement explicit 3D preparation + service worker + safe update
  - [ ] Bounded download, hash verify before atomic ready, progress/retry UI, shell precache, prepared-immutable serve, deferred activation
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 4: Fully-Agent 3D Builder Pipeline

- [ ] Task: Author style bible + versioned builders via Blender MCP
  - [ ] style-bible.json (colors/roughness/bevel/light rig/cameras), builders for dock/boat/turtle/child, seed logging
- [ ] Task: Implement headless export + optimize jobs
  - [ ] background Blender build/export, glTF-transform Draco, KTX2, manifest with budgets/hashes/shas/seed
- [ ] Task: Implement auto-review gates
  - [ ] Eevee iPad/phone rest/response previews, vision checks, budget/pivot/no-baked-text gates
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 5: Slice Integration and Approval Gate

- [ ] Task: Build hybrid dock + 3-spread slice renderer
  - [ ] Failing layout/semantic/hotspot tests first; Three.js scene + DOM overlay; active-content bounds; pre-decode where supported
- [ ] Task: Implement guided taps, glow-plus-word, camera beats, fallback
  - [ ] Ownership tests; provider speech cancel/replace; reduced-motion freeze; poster fallback
- [ ] Task: Prove slice offline + responsive + captures
  - [ ] Playwright prepare/disconnect/complete/reload, rest/response captures, safe-region/overlay fit
- [ ] Task: Slice approval gate (explicit human approval before mass production)
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 6: Expand to 10 Spreads + Family Flows

- [ ] Task: Produce remaining builders output + integrate full EN/ID prose
  - [ ] Remaining spreads/boats via pipeline only; fluent review fixes; validate routes/endings
- [ ] Task: Implement dock states, caregiver controls, completion keepsake
  - [ ] States (new/preparing/ready/in-progress/complete), adult gate/settings/reset, calm ending + history
- [ ] Task: Complete end-to-end journeys + reviews
  - [ ] Both routes/locales/replay/reset, keyboard/pointer/reduced-motion, a11y + bilingual review fixes
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)

## Phase 7: Validation, Tagged Release, and Rollback

- [ ] Task: Run release-candidate matrix
  - [ ] TS/Biome/validators/unit/component/browser/assets/visual gates; fix blockers
- [ ] Task: Complete physical-iPad acceptance + family observation
  - [ ] Install/prepare/both routes offline/terminate-resume/update/speech/touch/perf/memory; comprehension notes; privacy checklist
- [ ] Task: Publish tagged release with changelog
  - [ ] Owner-approved v0.x.y tag, CHANGELOG + release notes (3D package version, builder sha, migrations, known issues), GHCR immutable tags, record digest
- [ ] Task: Deploy via Coolify + verify + rollback drill
  - [ ] Exact tag/digest HTTPS 8080, /healthz/version.json/cache/security/no-index/digest match, prod family journey, prior known-good restore proof
- [ ] Task: Phase Verification & Checkpoint (Refer to workflow.md)
