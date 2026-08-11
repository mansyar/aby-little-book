import type { PrepareStrings } from './prepareStrings';

export interface PrepareViewProps {
  strings: PrepareStrings;
  phase: 'idle' | 'downloading' | 'verifying' | 'ready' | 'failed';
  progressFraction: number;
  error: string | null;
  onRetry: () => void;
}

export function PrepareView({
  strings,
  phase,
  progressFraction,
  error,
  onRetry,
}: PrepareViewProps) {
  const clamped = Math.min(1, Math.max(0, progressFraction));
  const percent = Math.round(clamped * 100);
  const failed = phase === 'failed';

  return (
    <section className="prepare" aria-label={strings.title}>
      <h2 className="prepare__title">{strings.title}</h2>
      {phase === 'ready' ? (
        <p className="prepare__status">{strings.ready}</p>
      ) : (
        <>
          <div
            className="prepare__bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <div className="prepare__fill" style={{ width: `${percent}%` }} />
          </div>
          <p className="prepare__status">
            {failed && error !== null ? strings.errorMessage : strings.preparing}
          </p>
          {failed && error !== null ? (
            <button type="button" className="prepare__retry" onClick={onRetry}>
              {strings.retry}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
