import type { Story } from './dock-contracts';
import type { Diagnostic } from './validators';

// Cross-field story rules the Zod schemas cannot express: route graph
// convergence, spread references, and the required choice interaction.
// Build-time only; diagnostics never reach child-facing UI.

function error(code: string, message: string): Diagnostic {
  return { severity: 'error', code, message };
}

export function validateDockRouteGraph(story: Story): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

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
    const seen = new Set<string>();
    for (const spreadId of route.spreadIds) {
      if (seen.has(spreadId)) {
        diagnostics.push(error('route-cycle', `Route ${route.id} revisits spread ${spreadId}.`));
      }
      seen.add(spreadId);
      if (story.spreads[spreadId] === undefined) {
        diagnostics.push(
          error('route-unknown-spread', `Route ${route.id} references unknown spread ${spreadId}.`),
        );
      }
    }
    if (!seen.has(story.convergenceSpreadId)) {
      diagnostics.push(
        error(
          'route-missing-convergence',
          `Route ${route.id} never reaches convergence spread ${story.convergenceSpreadId}.`,
        ),
      );
    }
    if (route.spreadIds[route.spreadIds.length - 1] !== story.endingSpreadId) {
      diagnostics.push(
        error('route-missing-ending', `Route ${route.id} must end at ${story.endingSpreadId}.`),
      );
    }
  }

  return diagnostics;
}
