import { useLayoutEffect, useRef } from 'react';
import type { CaregiverStrings } from './caregiverStrings';

export interface CaregiverGateProps {
  strings: CaregiverStrings;
  onEnter: () => void;
  onClose: () => void;
}

// The adult gate: a calm dialog that must be entered deliberately. Focus
// lands on the enter control; Escape leaves without opening the controls.
export function CaregiverGate({
  strings,
  onEnter,
  onClose,
}: CaregiverGateProps): React.JSX.Element {
  const enterRef = useRef<HTMLButtonElement | null>(null);
  useLayoutEffect(() => {
    enterRef.current?.focus();
  }, []);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={strings.gateTitle}
      className="caregiver-gate"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <h2 className="caregiver-gate__title">{strings.gateTitle}</h2>
      <p className="caregiver-gate__prompt">{strings.gatePrompt}</p>
      <button type="button" className="caregiver-gate__enter" ref={enterRef} onClick={onEnter}>
        {strings.enter}
      </button>
    </div>
  );
}
