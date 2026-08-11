# Tech Stack: Aby Little Book

## Architecture

A static, client-side Progressive Web App. All story behavior executes in the
browser. Nginx serves immutable build output; there is no application server,
backend API, database server, authentication layer, or cloud synchronization.

## Runtime Targets

- Primary acceptance target: current iPadOS Safari on the family iPad
- Required mode: installed standalone PWA
- Automated browser targets: current Chromium and WebKit
- Supported adaptations: phone portrait and desktop pointer/keyboard
- JavaScript required; no server-rendered fallback

## Language and Toolchain

- Strict TypeScript
- Node.js 24 LTS, pinned for local development and CI
- pnpm, pinned through `packageManager` and Corepack
- Committed `pnpm-lock.yaml`
- Exact library versions recorded in the lockfile rather than duplicated here

## Application

- React for the component UI
- Vite for development and static production builds
- Feature-first source organization
- Pure top-level application and reader reducers for finite state
- No routing library; browser deep links are outside prototype scope
- No speculative global-state framework
- Zod schemas with inferred TypeScript types for story, package, and persistence
  contracts
- Story content stored as validated, localized data rather than React code

## Styling, Rendering, and Motion

- Semantic HTML controls and ARIA where native semantics are insufficient
- Project-owned CSS with design tokens and dedicated motion styles
- DOM-composited, transparent WebP scene layers
- CSS positioning, transforms, opacity, and approved blend effects
- CSS transitions/animations or Web Animations API for restrained interaction
  motion
- React Aria Components may be used for complex accessible primitives such as
  parent dialogs
- No Canvas-first, WebGL, runtime Blender, or live-3D renderer

## Localization and Media

- Exactly two locales for the prototype: English (`en`) and Indonesian (`id`)
- UI resources separated from versioned story prose
- Local fonts and media only; no third-party runtime resources
- Browser `SpeechSynthesis` behind a provider interface
- Reviewed cached word clips as a fallback only if target-iPad evidence requires
  them
- Local, brief sound effects; no narration, music, or ambience

## Local Persistence and Offline Support

- IndexedDB through the lightweight `idb` library for settings, progress,
  migrations, route history, and package readiness
- Cache Storage for versioned offline book assets
- `vite-plugin-pwa` in `injectManifest` mode
- Project-owned `src/sw.ts` service worker
- Minimal app-shell precaching
- Explicit, verified complete-book preparation
- Atomic readiness represented in IndexedDB
- Safe update activation that does not interrupt an open reader

## Testing and Validation

- Vitest for unit tests
- Testing Library for component and accessibility behavior
- Playwright for Chromium and WebKit journeys, offline behavior, responsive
  layouts, and deterministic visual evidence
- Physical iPad Safari testing remains a release gate
- ESLint, formatting checks, and strict TypeScript checks
- Build-time validation for localization parity, Zod content schemas, route
  graphs, asset references, and hashes
- Automated accessibility checks supplemented by keyboard, touch, reduced-motion,
  screen-reader-oriented semantics, and human review

## Build and Delivery

- Vite emits a static `dist/` directory
- Multi-stage Docker build:
  - pinned Node 24 Alpine builder
  - pinned `nginxinc/nginx-unprivileged` Alpine runtime
- Non-root runtime on port `8080`
- Static `/healthz` and generated `/version.json`
- GitHub Actions for pull-request validation and release workflows
- Private GitHub Container Registry for immutable images
- Coolify for HTTPS deployment of the exact semantic tag or digest
- Owner-approved semantic releases in the `v0.x.y` range
- Container scanning, provenance/SBOM where supported, health verification, and
  recorded rollback image

## Art Production

- Blender 5.2.0 LTS
- Eevee-first rendering using the detected `BLENDER_EEVEE` engine
- Transparent PNG master layers
- Optimized transparent WebP delivery layers
- Browser recomposition and responsive proofing before scene approval
- Blender source and review artifacts stay outside the production runtime image

## Explicit Exclusions

Do not introduce:

- Backend services, APIs, server databases, accounts, or synchronization
- Analytics, advertising, tracking, or remote error collection
- Runtime AI services or a content management system
- Hosted fonts, third-party scripts, or externally hosted media
- Dormant API clients or abstractions for hypothetical future platform features
- A routing library, global-state framework, Canvas/WebGL engine, or live 3D
  without an approved architecture change

## Dependency Policy

Prefer platform APIs and small, focused dependencies. Add a dependency only when
it solves a demonstrated requirement more safely or accessibly than project-owned
code. Changes to the architectural choices in this document require an explicit
technical decision rather than an incidental implementation choice.
