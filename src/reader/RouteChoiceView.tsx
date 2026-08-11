// The one required interaction: choosing a route at S03. Both doors stay
// inviting and equal; the choice locks for the playthrough.

import type { Locale, RouteId } from '../story/contracts';
import type { ReaderStrings } from './readerStrings';

export type RouteChoiceViewProps = {
  strings: ReaderStrings;
  locale: Locale;
  onChoose: (route: RouteId) => void;
};

export function RouteChoiceView({
  strings,
  onChoose,
}: RouteChoiceViewProps): React.JSX.Element {
  const routes = Object.keys(strings.routeLabels) as RouteId[];
  return (
    <section className="route-choice" aria-labelledby="route-choice-title">
      <h2 id="route-choice-title" className="route-choice__title">
        {strings.choiceTitle}
      </h2>
      <p className="route-choice__prompt">{strings.choicePrompt}</p>
      <div className="route-choice__doors">
        {routes.map((route) => (
          <button
            key={route}
            type="button"
            className="route-choice__door"
            data-interactive="true"
            onClick={() => onChoose(route)}
          >
            {strings.routeLabels[route]}
          </button>
        ))}
      </div>
      <p className="visually-hidden">{strings.readingStatus}</p>
    </section>
  );
}
