// Semantic output of one layered scene: a labeled section carrying the
// localized scene description plus one decorative <img> per validated layer
// in authored order. Meaning lives in the description, not in the pixels.

import type { AssetLayer } from '../story/contracts';
import { resolveAssetSrc } from './layout';

export type SceneViewProps = {
  layers: readonly AssetLayer[];
  title: string;
  description: string;
  basePath: string;
};

export function SceneView({
  layers,
  title,
  description,
  basePath,
}: SceneViewProps): React.JSX.Element {
  return (
    <section className="scene" aria-label={title} aria-describedby="scene-description">
      <p id="scene-description" className="visually-hidden">
        {description}
      </p>
      <div className="scene__layers">
        {layers.map((layer) => (
          <img
            key={layer.id}
            className={`scene__layer scene__layer--${layer.role}`}
            src={resolveAssetSrc(layer.src, basePath)}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        ))}
      </div>
    </section>
  );
}
