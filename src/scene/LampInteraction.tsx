import type { SafeRegion } from '../story/contracts';
import type { LampStrings } from './lampStrings';
import { useDelayedHint } from './useDelayedHint';

export interface LampInteractionProps {
  /** Normalized authored target region of the lamp. */
  region: SafeRegion;
  strings: LampStrings;
  /** Inactivity delay before the gentle hint appears. */
  hintDelayMs: number;
  /** Static emphasis instead of the pulse under reduced motion. */
  reducedMotion: boolean;
  /** True once the warm response is showing. */
  activated: boolean;
  onActivate: () => void;
}

const percent = (value: number) => `${Math.round(value * 1000) / 10}%`;

/**
 * The star lamp interaction for Share the Light: an optional, fully skippable
 * target with one gentle delayed hint, a restrained warm response, and an
 * accessible announcement. Marked data-interactive so the navigation layer
 * never page-turns from it.
 */
export function LampInteraction({
  region,
  strings,
  hintDelayMs,
  reducedMotion,
  activated,
  onActivate,
}: LampInteractionProps) {
  const { hintVisible, dismiss } = useDelayedHint({ delayMs: hintDelayMs, active: activated });

  const style = {
    left: percent(region.x),
    top: percent(region.y),
    width: percent(region.width),
    height: percent(region.height),
  };

  const hintClass =
    hintVisible && !activated
      ? reducedMotion
        ? 'lamp-target--hint-static'
        : 'lamp-target--hint'
      : '';

  return (
    <div className="lamp-interaction" style={style}>
      <button
        type="button"
        className={`lamp-target${hintClass ? ` ${hintClass}` : ''}`}
        data-interactive
        aria-label={strings.label}
        aria-pressed={activated}
        onClick={() => {
          dismiss();
          onActivate();
        }}
      >
        {hintVisible && !activated ? (
          <span className="lamp-target__hint">{strings.hint}</span>
        ) : null}
      </button>
      <span className="visually-hidden" aria-live="polite">
        {activated ? strings.response : ''}
      </span>
    </div>
  );
}
