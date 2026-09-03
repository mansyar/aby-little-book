# Tech Stack: Aby Little Book — Interactive 3D Storybook

## Architecture

A static, client-side Progressive Web App. All story and 3D behavior executes
in the browser. Nginx serves immutable build output; there is no application
server, backend API, database server, authentication layer, or cloud
synchronization.

This document records the approved architecture change from DOM WebP layers
to Hybrid Three.js 3D + DOM text. Do not revert without an explicit technical
decision.

## Runtime Targets

- Primary acceptance target: current iPadOS Safari on the family iPad with WebGL2
- Required mode: installed standalone PWA
- Automated browser targets: current Chromium and WebKit
- Supported adaptations: phone portrait and desktop pointer/keyboard
- JavaScript and WebGL required for 3D; static poster + full DOM story as fallback, never a block
- No server-rendered fallback

## Language and Toolchain

- Strict TypeScript 7
- Node.js 24 LTS, pinned for local development and CI
- pnpm, pinned through `packageManager` and Corepack
- Committed `pnpm-lock.yaml`
- Blender 5.2.0 LTS, pinned for agent builders (MCP + headless)
- Exact library versions recorded in the lockfile rather than duplicated here

## Application

- React for component UI and DOM story overlay
- Vite for development and static production builds
- Pinned stable Three.js for dock, lake, boats, characters, and guided interactions
- Feature-first source organization; `src/three/` owns scene, loaders, camera beats, and hotspot wiring
- Pure top-level application and reader reducers for finite state
- No routing library; browser deep links are outside prototype scope
- No speculative global-state framework
- Zod schemas with inferred TypeScript types for story, scene manifest, asset manifest, package, and persistence contracts
- Story content stored as validated, localized data rather than React code or baked textures

## Rendering: Hybrid 3D + DOM

- Three.js WebGL2 for Starlit Dock, water, boats, turtle, child, props, fireflies
- Guided camera only: gentle drifts on story beats, tap-driven focus pulls; no free orbit
- Instanced meshes for repeated props; bounded draw calls and tris per scene
- Procedural shaders for water ripple, sky gradient, lantern glow; seeded and frozen under reduced-motion
- Story prose as semantic HTML overlay with ARIA; every 3D hotspot has a DOM-accessible equivalent with name, focus, and keyboard activation
- Project-owned CSS with design tokens and dedicated motion styles
- CSS transitions/animations or Web Animations API for UI; Three.js clock for ambient 3D
- React Aria Components may be used for complex accessible primitives such as parent dialogs
- Poster fallback image + full story when WebGL is unavailable

## Localization and Media

- Exactly two locales for the prototype: English (`en`) and Indonesian (`id`)
- UI resources separated from versioned story prose
- Local fonts and media only; no third-party runtime resources
- No story text in textures; text lives in DOM for scaling, pronunciation, and screen readers
- Browser `SpeechSynthesis` behind a provider interface, with non-overlapping isolated word speech
- Reviewed cached word clips as a fallback only if target-iPad evidence requires them
- Local, brief sound effects; no narration, music, or ambience

## Local Persistence and Offline Support

- IndexedDB through the lightweight `idb` library for settings, progress, migrations, route history, and package readiness
- Cache Storage for versioned offline packages: GLB (Draco), KTX2 textures, JSON manifests, shell
- `vite-plugin-pwa` in `injectManifest` mode
- Project-owned `src/sw.ts` service worker
- Minimal app-shell precaching
- Explicit, verified complete-book preparation with hash verification before atomic readiness
- Atomic readiness represented in IndexedDB; incomplete or corrupt 3D never shows false-ready
- Safe update activation that does not interrupt an open reader

## Testing and Validation

- Vitest for unit tests: reducers, route graphs, manifest logic, readiness rules
- Testing Library for component and accessibility behavior, including 3D hotspot equivalents
- Playwright for Chromium and WebKit journeys, offline 3D completion, responsive layouts, guided camera, tap ownership, and deterministic rest/response captures
- Physical iPad Safari testing remains a release gate, including 3D performance and memory
- Biome for linting and formatting, configured to enforce TypeScript, HTML/CSS, and general guides
- Strict TypeScript 7 checks, including Three.js types and builder scripts
- Build-time validation: locale parity, Zod story/scene/asset schemas, route graphs, GLB/KTX2 references, dimensions, bounds, tap pivots, budgets, hashes
- Asset budget gates: scene bytes, texture size, tris, draw calls, missing pivots fail fast
- Auto-render + vision checks for seams, floaters, and safe-region intrusion
- Automated accessibility checks supplemented by keyboard, touch, reduced-motion, screen-reader semantics, and exception-only human review

## Build and Delivery

- Vite emits a static `dist/` directory; 3D assets excluded from JS bundle, served as versioned files
- Multi-stage Docker build:
  - pinned Node 24 Alpine builder (includes headless Blender stage where supported, otherwise prebuilt GLBs)
  - pinned `nginxinc/nginx-unprivileged` Alpine runtime
- Non-root runtime on port `8080`
- Static `/healthz` and generated `/version.json` (includes 3D package version + builder sha)
- GitHub Actions for pull-request validation and release workflows
- Private GitHub Container Registry for immutable images
- Coolify for HTTPS deployment of the exact semantic tag or digest
- Owner-approved semantic releases in the `v0.x.y` range
- Container scanning, provenance/SBOM where supported, health verification, and recorded rollback image (app + 3D package)

## Agent-Built 3D Production

Fully done by AI agents via Blender MCP or headless Blender. No manual sculpting.

- Sources: `art/style-bible.json` + versioned `art/builders/*.py`; `.blend` files are generated build artifacts, never hand-edited
- Builders expose only safe params; cute-minimal characters (bead eyes, blush, no mouths)
- Live iteration: Blender MCP `execute_blender_code`, `get_scene_info`, `get_object_info` with seed + version logging
- Headless export: `blender --background --python tools/build_all.py`, then `export_glb.py`
- Optimize: `gltf-transform optimize --compress draco`, KTX2 texture compression
- Manifest: dimensions, bounds, pivots, budgets, hashes, builder sha, style sha, seed
- Previews: headless Eevee iPad/phone rest/response renders for vision + browser proofing
- Blender sources and PNG masters stay outside the production runtime image; only versioned GLB/KTX2/manifest ship

## Explicit Exclusions

Do not introduce:

- Backend services, APIs, server databases, accounts, or synchronization
- Analytics, advertising, tracking, or remote error collection
- Runtime AI services or a content management system
- Hosted fonts, third-party scripts, externally hosted media, or remote 3D marketplaces for production
- In-canvas story text or text baked into textures
- Free-orbit sandbox cameras that can strand the story
- Realistic human faces or high-detail characters
- Dormant API clients or abstractions for hypothetical future platform features
- A routing library or global-state framework without an approved change

## Dependency Policy

Prefer platform APIs and small, focused dependencies. Add a dependency only when
it solves a demonstrated requirement more safely or accessibly than project-owned
code, including 3D. Changes to the architectural choices in this document require
an explicit technical decision rather than an incidental implementation choice.

At initial installation and intentional upgrade points, select the newest stable
Three.js and toolchain versions that are mutually compatible with Node.js 24,
TypeScript 7, Blender 5.2, and each package's declared engine and peer ranges.
Pin through `package.json` and `pnpm-lock.yaml`; do not use prereleases or
blindly upgrade past compatible ranges.
