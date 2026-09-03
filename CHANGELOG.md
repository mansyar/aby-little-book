# Changelog

All notable changes to Aby Little Book are documented here. Tags are
owner-approved immutable release markers (`v0.x.y`, never `latest`).

## v0.1.0 — 2026-09-03 — Interactive 3D Storybook MVP

First private family release: the Starlit Dock home and the complete
10-spread bilingual story *The Sharing Tide*, proven on the family iPad.

### Story and experience

- Starlit Dock home with a living 3D night-lake scene behind the boat
  card; labelled poster fallback when WebGL is unavailable.
- *The Sharing Tide*: child + shy baby turtle sharing story, 10 spreads,
  one safe branch, two complete routes (Reed Channel, Lily Cove) with a
  converged ending. Full EN + ID copy, owner-refined, validated as data.
- Guided taps only (board, word pronunciation, optional discoveries);
  glow-plus-word feedback; camera beats freeze under reduced motion.
- Honest scene loading progress (real bytes) under the poster.
- Dock states (new/preparing/ready/in-progress/complete), grown-ups door
  with gate/settings/protected reset, lantern keepsake, replay discovers
  the alternate route.

### 3D package

- Package `the-sharing-tide-0.1.0`: 5 scenes (dock, boat, turtle, child,
  lake props), 99,164 bytes, Draco GLB + KTX2.
- Built fully by agent: Blender 5.2.0 LTS headless, versioned parametric
  builders v0.1.0, style-bible 0.1.0, seed 7. No hand-edited assets.

### Offline and persistence

- Explicit "Prepare the boat": bounded download, SHA-256 verified before
  atomic readiness; prepared packages served immutable.
- Service worker precaches the shell only; updates defer while the reader
  is open and preserve progress.
- IndexedDB `aby-little-book` v1: settings, progress, completion,
  packageState. Progress survives reload, restart, and language switch.

### Evidence

- `tsc --noEmit` clean; Biome 184 files clean.
- 459/459 unit tests; 88.52% statements / 80.52% branch (80% gate).
- 55 passed / 3 skipped e2e on Chromium + WebKit.
- `validate:assets`: 5 scenes verified, hashes match.
- Physical iPad acceptance: owner-confirmed 15/15 over dev LAN.

### Known issues

- Add-to-Home-Screen install, airplane-mode offline, and the service
  worker update flow are proven only after the HTTPS production deploy
  (prod family journey), not over dev-LAN HTTP.
- WebKit offline e2e specs skip by design (engine bypasses workers);
  physical iPad is the WebKit offline authority.
- `pnpm dev` serves the 3D package from `public/` (dev-only mirror);
  production serves from the built `dist/`.
