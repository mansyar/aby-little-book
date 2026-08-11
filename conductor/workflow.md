# Project Workflow

## Guiding Principles

1. **The plan is the source of truth.** All implementation work must be tracked
   in the active track's `plan.md`.
2. **The tech stack is deliberate.** Update `tech-stack.md` and record the
   reason before implementing an architectural deviation.
3. **Test behavior, not file existence.** Use test-driven development for
   logic-bearing code and observable user behavior. Do not require one test file
   per source file.
4. **Coverage is scoped.** Maintain at least 80% line and branch coverage for
   logic-bearing application code. Exclude generated files, static assets,
   styles, type-only declarations, declarative content, and trivial composition
   from the threshold.
5. **Acceptance evidence matters.** Automated checks do not replace bilingual
   human review, accessibility review, or physical-iPad validation.
6. **User experience comes first.** Prefer comprehension, calm, emotional
   safety, accessibility, and reliable offline reading over novelty.
7. **Commands are non-interactive and CI-aware.** Prefer project scripts and
   set `CI=true` for tools that otherwise enter watch mode.

## What Requires Tests

### Test-first by default

Write a failing test before implementation when changing observable behavior or
logic, including:

- reducers, state transitions, route traversal, convergence, and replay rules
- Zod schemas, localization tokenization, and content/package validation
- persistence repositories, migrations, save/resume behavior, and readiness
  rules
- service-worker and offline-preparation behavior
- speech and sound coordination, cancellation, and priority
- interaction ownership, gestures, layout classification, and reduced motion
- accessible component behavior, focus, parent controls, and recovery states
- complete browser journeys and regressions in acceptance-critical flows

For a bug fix, first add the smallest test that reproduces the defect.

### Tests are not required solely for structure

Do not create tests merely to mirror:

- static images, fonts, audio, Blender files, or generated delivery assets
- CSS-only styling or animation with no behavioral contract
- type-only declarations
- static configuration or declarative content already covered by schema,
  parity, graph, reference, or hash validators
- trivial presentational wrappers with no branching or interaction
- documentation

These changes still require the appropriate build-time validator, browser
evidence, visual review, or manual verification. If a nominally presentational
change affects semantics, focus, interaction, responsiveness, reduced motion,
or a regression-prone contract, test that behavior at the most useful level.

## Test Levels

Use the lowest level that proves the requirement without duplicating coverage.

- **Vitest:** pure reducers, route graphs, schemas and invalid fixtures,
  localization/token resolution, repositories and migrations, offline rules,
  speech/effects priority, and layout classification.
- **Testing Library:** semantic controls, selected and locked states, dialogs,
  focus, reduced-motion equivalents, and localized loading or recovery states.
- **Playwright:** critical Chromium/WebKit journeys, persistence, locales,
  offline completion, keyboard and pointer behavior, responsive layouts,
  reduced motion, and scene-layer loading/alignment.
- **Build-time validators:** locale parity, story schemas, route graphs, asset
  references and hashes, manifests, and package budgets.
- **Human/device checks:** English and Indonesian quality, accessibility,
  physical iPad Safari, child comprehension, and family reading experience.

Keep visual baselines meaningful and deterministic. Do not snapshot every
decorative DOM node.

## Standard Task Workflow

Complete tasks sequentially unless the plan explicitly permits parallel work.

1. **Select the task.** Choose the next pending task from `plan.md`.
2. **Mark it in progress.** Change its marker from `[ ]` to `[~]` before coding.
3. **Establish the verification approach.** Identify the logic, behavior,
   validator, visual evidence, or manual acceptance check that proves the task.
4. **Red phase when tests apply.** Add the smallest failing test that expresses
   the requirement, run it, and confirm it fails for the expected reason.
5. **Green phase.** Implement the minimum necessary change and run the relevant
   focused checks until they pass.
6. **Refactor if useful.** Improve clarity or remove duplication while tests are
   green; do not add speculative abstractions.
7. **Run task-level verification.** Run the smallest set of type, lint, format,
   validation, unit, component, browser, build, or manual checks needed for the
   completed scope.
8. **Verify scoped coverage.** When logic-bearing code changed, confirm the
   affected coverage scope maintains at least 80% lines and branches. A narrowly
   justified exception must be recorded in the plan.
9. **Review the diff.** Confirm every change belongs to the task and no secrets,
   temporary evidence, or unrelated cleanup are included.
10. **Commit the task.** Make one coherent implementation commit per completed
    task using the project's commit-message format.
11. **Attach a Git note.** Add the task name, summary, changed files,
    verification performed, and core rationale to the implementation commit.
12. **Record completion.** Change `[~]` to `[x]`, append the first seven
    characters of the implementation commit SHA, and commit the plan update
    separately.

Do not weaken tests to make an implementation pass. If the specification or
architecture must change, stop, update the source-of-truth document with an
explicit reason, obtain approval where required, and then resume.

## Phase Completion Protocol

After the final task in a phase:

1. Determine the phase diff from the previous checkpoint, or from the first
   project commit if no checkpoint exists.
2. Map changed behavior and logic to tests by responsibility—not by filename.
   Add missing acceptance-focused tests only where the phase introduced an
   uncovered contract or regression risk.
3. Run the relevant automated gate set once after implementation is complete.
   Announce the exact command before running it.
4. If a check fails, diagnose the root cause and attempt at most two focused
   fixes before stopping for user guidance.
5. Produce a concrete manual verification plan derived from `product.md`,
   `product-guidelines.md`, the track specification, and the phase tasks.
6. For visual or interaction work, include deterministic browser evidence at
   required layouts. For release-relevant behavior, include the physical-iPad
   gate where applicable.
7. Ask the user to confirm the manual result and pause for explicit feedback.
8. Attach the automated command, manual steps, observed result, and user
   confirmation as a Git note to the final functional commit of the phase.
9. Append the first seven characters of that commit as the phase checkpoint in
   `plan.md` and commit the plan update.

## Quality Gates

Apply only gates relevant to the changed scope, except that configured CI gates
must remain green:

- [ ] Specification and acceptance criteria are satisfied
- [ ] Relevant tests pass at the appropriate level
- [ ] Logic-bearing code meets 80% line and branch coverage
- [ ] Strict TypeScript passes
- [ ] ESLint and formatting checks pass
- [ ] Relevant content, locale, route, asset, and hash validators pass
- [ ] Chromium and WebKit journeys pass when browser behavior changed
- [ ] Accessibility semantics, focus, touch targets, keyboard use, contrast,
      and reduced motion are verified where affected
- [ ] English and Indonesian remain equally complete and reviewed where content
      changed
- [ ] Offline and restart behavior are verified where caching or persistence
      changed
- [ ] Responsive scene and text-safe regions are verified where UI or art
      changed
- [ ] Physical iPad validation is complete when required by the phase or release
- [ ] No third-party runtime resources, child tracking, secrets, or sensitive
      data were introduced
- [ ] Documentation and source-of-truth artifacts are updated where needed

## Development Commands

Use the pinned Node.js 24 LTS and pnpm/Corepack toolchain. Once application
scaffolding defines the scripts, keep this section synchronized with
`package.json` rather than inventing alternate commands.

Expected command roles:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
CI=true pnpm test
pnpm test:coverage
CI=true pnpm test:e2e
pnpm lint
pnpm format:check
pnpm typecheck
pnpm validate
pnpm build
```

Use only scripts that exist in the repository. The exact CI gate command should
compose the same checks used locally.

## Commit Guidelines

### Frequency

- Commit once per completed plan task.
- Keep implementation and its tests in the same functional commit.
- Commit the plan status update separately after recording the functional SHA.
- Do not combine unrelated tasks or create empty checkpoint commits.

### Message format

```text
<type>(<scope>): <description>
```

Use `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, or `conductor`
as appropriate. Keep the subject concise and imperative.

### Git notes

Every functional task commit receives a Git note containing:

- task name
- concise summary
- created and modified files
- verification commands and manual evidence
- why the change was made

Phase verification reports are added to the applicable final functional commit.

## Corrections and Reversions

- Make minor gaps discovered during an active `[~]` task within that task and
  rerun relevant checks before committing.
- Track post-review corrections in a `Review Fixes` phase rather than allowing
  unplanned code drift.
- Use Conductor's revert workflow for a fundamentally flawed completed task so
  commits and plan state remain consistent.

## Definition of Done

A task is complete when:

1. Its planned acceptance criteria are met.
2. Required tests or alternative evidence exist and pass.
3. Changed logic meets the scoped coverage rule.
4. Relevant automated and manual quality gates pass.
5. The implementation is simple, type-safe, accessible, and consistent with the
   product and technical standards.
6. Documentation is updated where needed.
7. The functional change is committed once, with a task summary attached as a
   Git note.
8. The plan records the functional commit SHA in a separate plan commit.

## Release Verification

Before a private release:

1. Confirm all configured validation, test, build, browser, Docker, and container
   scan gates pass.
2. Complete bilingual, accessibility, offline, restart, install, and physical
   iPad checks.
3. Confirm `/healthz`, `/version.json`, HTTPS, cache headers, security headers,
   and no-index behavior.
4. Publish and deploy only an owner-approved immutable semantic tag or digest;
   never deploy an ambiguous `latest` tag.
5. Record the prior known-good image and verify rollback instructions.
6. Confirm the deployed version and image digest match the approved release.
