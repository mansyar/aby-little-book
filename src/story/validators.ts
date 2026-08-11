// Build-time validators: they turn schema-level acceptance into actionable
// diagnostics for authors and tooling. They run at build time only; their
// output must never appear in child-facing UI.

import type {
  AssetLayer,
  PackageManifest,
  PackageReadiness,
  SafeRegion,
  SceneLayout,
  Story,
} from './contracts';

export interface Diagnostic {
  severity: 'error' | 'warning';
  code: string;
  message: string;
}

function error(code: string, message: string): Diagnostic {
  return { severity: 'error', code, message };
}

// Verifies the authored route graph: exactly ten spreads per route, no cycles,
// every route passes through the convergence spread and ends at the shared
// ending, and the supporting invariants (roster, route-choice interaction,
// Indonesian prose free of gendered pronoun tokens).
export function validateRouteGraph(story: Story): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (story.astronauts.length !== 3) {
    diagnostics.push(
      error('astronaut-roster', `Expected exactly 3 astronauts, found ${story.astronauts.length}.`),
    );
  }

  const choiceSpread = story.spreads[story.choiceSpreadId];
  if (choiceSpread?.interaction?.kind !== 'route-choice') {
    diagnostics.push(
      error(
        'choice-interaction-missing',
        `Spread ${story.choiceSpreadId} must define a route-choice interaction.`,
      ),
    );
  }

  for (const route of story.routes) {
    const { id: routeId, spreadIds } = route;
    if (spreadIds.length !== 10) {
      diagnostics.push(
        error(
          'route-spread-count',
          `Route ${routeId} has ${spreadIds.length} spreads; expected 10.`,
        ),
      );
    }
    const seen = new Set<string>();
    for (const spreadId of spreadIds) {
      if (seen.has(spreadId)) {
        diagnostics.push(error('route-cycle', `Route ${routeId} revisits spread ${spreadId}.`));
      }
      seen.add(spreadId);
      if (story.spreads[spreadId] === undefined) {
        diagnostics.push(
          error('route-unknown-spread', `Route ${routeId} references unknown spread ${spreadId}.`),
        );
      }
    }
    if (!seen.has(story.convergenceSpreadId)) {
      diagnostics.push(
        error(
          'route-missing-convergence',
          `Route ${routeId} never reaches convergence spread ${story.convergenceSpreadId}.`,
        ),
      );
    }
    if (spreadIds[spreadIds.length - 1] !== story.endingSpreadId) {
      diagnostics.push(
        error('route-missing-ending', `Route ${routeId} must end at ${story.endingSpreadId}.`),
      );
    }
  }

  if (
    story.routes.some(
      (route) => route.spreadIds[route.spreadIds.length - 1] !== story.endingSpreadId,
    )
  ) {
    diagnostics.push(
      error(
        'route-end-mismatch',
        `All routes must converge on the same ending spread ${story.endingSpreadId}.`,
      ),
    );
  }

  for (const spread of Object.values(story.spreads)) {
    const pronoun = spread.prose.id.match(/\{(subject|subject_cap|object|possessive)\}/);
    if (pronoun !== null) {
      diagnostics.push(
        error(
          'id-pronoun-token',
          `Spread ${spread.id} Indonesian prose must not use the gendered token ${pronoun[0]}.`,
        ),
      );
    }
  }

  return diagnostics;
}

export function assertLayerOrderUnique(layers: readonly { order: number }[]): Diagnostic[] {
  const seen = new Set<number>();
  const diagnostics: Diagnostic[] = [];
  for (const layer of layers) {
    if (seen.has(layer.order)) {
      diagnostics.push(
        error('layer-order-duplicate', `Layer order ${layer.order} is used more than once.`),
      );
    }
    seen.add(layer.order);
  }
  return diagnostics;
}

export function assertLayoutLayersExist(
  layout: { id: string; layerIds: readonly string[] },
  layers: readonly AssetLayer[],
): Diagnostic[] {
  const known = new Set(layers.map((layer) => layer.id));
  const diagnostics: Diagnostic[] = [];
  for (const layerId of layout.layerIds) {
    if (!known.has(layerId)) {
      diagnostics.push(
        error('layout-unknown-layer', `Layout ${layout.id} references unknown layer ${layerId}.`),
      );
    }
  }
  return diagnostics;
}

export function assertSafeRegion(region: SafeRegion): Diagnostic[] {
  const inBounds =
    region.x >= 0 &&
    region.y >= 0 &&
    region.width >= 0 &&
    region.height >= 0 &&
    region.x + region.width <= 1 &&
    region.y + region.height <= 1;
  return inBounds
    ? []
    : [error('safe-region-out-of-bounds', 'Safe region must lie within normalized unit bounds.')];
}

export function assertLayoutCameraInBounds(layout: SceneLayout): Diagnostic[] {
  return inBounds(layout.camera)
    ? []
    : [
        error(
          'layout-camera-out-of-bounds',
          `Layout ${layout.id} camera must lie within normalized unit bounds.`,
        ),
      ];
}

export function assertLayoutPanelInBounds(layout: SceneLayout): Diagnostic[] {
  return inBounds(layout.panel.region)
    ? []
    : [
        error(
          'layout-panel-out-of-bounds',
          `Layout ${layout.id} text-safe panel region must lie within normalized unit bounds.`,
        ),
      ];
}

function inBounds(region: SafeRegion): boolean {
  return (
    region.x >= 0 &&
    region.y >= 0 &&
    region.width >= 0 &&
    region.height >= 0 &&
    region.x + region.width <= 1 &&
    region.y + region.height <= 1
  );
}

export function assertReadinessConsistent(readiness: PackageReadiness): Diagnostic[] {
  if (
    readiness.ready &&
    (readiness.missingAssets.length > 0 || readiness.failedHashes.length > 0)
  ) {
    return [
      error(
        'readiness-inconsistent',
        'A ready package cannot have missing assets or failed hashes.',
      ),
    ];
  }
  return [];
}

// Whole-manifest validation: non-empty assets, positive byte budget, unique
// layer ordering, layouts that only reference declared layers, and authored
// cameras/panels within normalized bounds.
export function validateManifest(manifest: PackageManifest): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  if (manifest.assets.length === 0) {
    diagnostics.push(error('package-no-assets', 'Package manifest declares no assets.'));
  }
  if (manifest.totalBytes <= 0) {
    diagnostics.push(
      error(
        'package-zero-budget',
        `Package byte budget must be positive; found ${manifest.totalBytes}.`,
      ),
    );
  }
  diagnostics.push(...assertLayerOrderUnique(manifest.assets));
  for (const layout of manifest.layouts) {
    diagnostics.push(...assertLayoutLayersExist(layout, manifest.assets));
    diagnostics.push(...assertLayoutCameraInBounds(layout));
    diagnostics.push(...assertLayoutPanelInBounds(layout));
  }
  return diagnostics;
}
