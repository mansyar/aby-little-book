import type { CompletionStrings } from './completionStrings';

export interface KeepsakeBadgeProps {
  strings: CompletionStrings;
  hasKeepsake: boolean;
}

// Lumi's shelf presence: a quiet indicator that appears only after the
// story is completed. Nothing celebratory — just company.
export function KeepsakeBadge({
  strings,
  hasKeepsake,
}: KeepsakeBadgeProps): React.JSX.Element | null {
  if (!hasKeepsake) {
    return null;
  }
  return <p className="keepsake-badge">{strings.keepsake}</p>;
}
