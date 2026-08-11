import { useLayoutEffect, useRef } from 'react';
import type { CaregiverStrings } from './caregiverStrings';

export interface ResetConfirmProps {
  strings: CaregiverStrings;
  onReset: () => void;
  onCancel: () => void;
}

// The destructive confirmation: consequences stated plainly, an explicit
// erase, and a keep-everything escape hatch. No double-negative wording.
export function ResetConfirm({ strings, onReset, onCancel }: ResetConfirmProps): React.JSX.Element {
  const keepRef = useRef<HTMLButtonElement | null>(null);
  useLayoutEffect(() => {
    keepRef.current?.focus();
  }, []);
  return (
    <div role="dialog" aria-modal="true" aria-label={strings.resetLabel} className="reset-confirm">
      <h2 className="reset-confirm__title">{strings.resetLabel}</h2>
      <p className="reset-confirm__consequence">{strings.resetConsequence}</p>
      <button type="button" className="reset-confirm__keep" ref={keepRef} onClick={onCancel}>
        {strings.cancel}
      </button>
      <button type="button" className="reset-confirm__erase" onClick={onReset}>
        {strings.erase}
      </button>
    </div>
  );
}
