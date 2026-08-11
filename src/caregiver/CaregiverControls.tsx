import type { CaregiverStrings } from './caregiverStrings';

export type Locale = 'en' | 'id';
export type TextScale = 'standard' | 'large';

export interface CaregiverSettings {
  locale: Locale;
  soundEnabled: boolean;
  textScale: TextScale;
  reducedMotion: boolean;
}

export interface CaregiverControlsProps {
  strings: CaregiverStrings;
  settings: CaregiverSettings;
  preparing: boolean;
  onLocaleChange: (locale: Locale) => void;
  onSoundChange: (enabled: boolean) => void;
  onTextScaleChange: (scale: TextScale) => void;
  onReducedMotionChange: (reduced: boolean) => void;
  onPrepare: () => void;
  onReset: () => void;
  onClose: () => void;
}

// Grown-up settings: explicit groups with visible current values, one
// destructive action that hands off to a plain confirmation. The child's
// surfaces are never part of this dialog.
export function CaregiverControls({
  strings,
  settings,
  preparing,
  onLocaleChange,
  onSoundChange,
  onTextScaleChange,
  onReducedMotionChange,
  onPrepare,
  onReset,
  onClose,
}: CaregiverControlsProps): React.JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={strings.settingsTitle}
      className="caregiver-controls"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          onClose();
        }
      }}
    >
      <h2 className="caregiver-controls__title">{strings.settingsTitle}</h2>

      <fieldset className="caregiver-controls__group">
        <legend>{strings.languageLabel}</legend>
        <button
          type="button"
          aria-pressed={settings.locale === 'en'}
          onClick={() => onLocaleChange('en')}
        >
          {strings.english}
        </button>
        <button
          type="button"
          aria-pressed={settings.locale === 'id'}
          onClick={() => onLocaleChange('id')}
        >
          {strings.indonesian}
        </button>
      </fieldset>

      <fieldset className="caregiver-controls__group">
        <legend>{strings.soundLabel}</legend>
        <button
          type="button"
          aria-pressed={settings.soundEnabled}
          onClick={() => onSoundChange(!settings.soundEnabled)}
        >
          {settings.soundEnabled ? strings.soundOn : strings.soundOff}
        </button>
      </fieldset>

      <fieldset className="caregiver-controls__group">
        <legend>{strings.textLabel}</legend>
        <button
          type="button"
          aria-pressed={settings.textScale === 'standard'}
          onClick={() => onTextScaleChange('standard')}
        >
          {strings.textStandard}
        </button>
        <button
          type="button"
          aria-pressed={settings.textScale === 'large'}
          onClick={() => onTextScaleChange('large')}
        >
          {strings.textLarge}
        </button>
      </fieldset>

      <fieldset className="caregiver-controls__group">
        <legend>{strings.motionLabel}</legend>
        <button
          type="button"
          aria-pressed={!settings.reducedMotion}
          onClick={() => onReducedMotionChange(!settings.reducedMotion)}
        >
          {settings.reducedMotion ? strings.motionOff : strings.motionOn}
        </button>
      </fieldset>

      <div className="caregiver-controls__preparation">
        <button type="button" onClick={onPrepare} disabled={preparing}>
          {preparing ? strings.preparing : strings.prepareLabel}
        </button>
      </div>

      <div className="caregiver-controls__reset">
        <button type="button" className="caregiver-controls__reset-button" onClick={onReset}>
          {strings.resetLabel}
        </button>
      </div>

      <button type="button" className="caregiver-controls__close" onClick={onClose}>
        {strings.close}
      </button>
    </div>
  );
}
