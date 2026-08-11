// Semantic output of one layered scene: a section named by the visible story
// panel (level-2 heading + localized prose) carrying the localized scene
// description, one decorative <img> per validated layer in authored order,
// and the authored camera framing. Meaning lives in the panel and the
// description, not in the pixels, so every layer image is aria-hidden with
// empty alt.

import type { ReactNode } from 'react';
import type { AssetLayer, SafeRegion } from '../story/contracts';
import { resolveAssetSrc } from './layout';

export type ScenePanel = {
  position: 'side' | 'bottom';
  region: SafeRegion;
};

export type SceneViewProps = {
  layers: readonly AssetLayer[];
  title: string;
  description: string;
  /** Plain prose, or composed word controls (isolated pronunciation). */
  prose: ReactNode;
  panel: ScenePanel;
  camera: SafeRegion;
  basePath: string;
};

export function SceneView({
  layers,
  title,
  description,
  prose,
  panel,
  camera,
  basePath,
}: SceneViewProps): React.JSX.Element {
  // Percentages are rounded to one decimal place to absorb float drift in
  // normalized authored values (e.g. 0.55 * 100 === 55.00000000000001).
  const cameraCenterX = Math.round((camera.x + camera.width / 2) * 1000) / 10;
  const cameraCenterY = Math.round((camera.y + camera.height / 2) * 1000) / 10;
  const panelRegion = {
    left: `${Math.round(panel.region.x * 1000) / 10}%`,
    top: `${Math.round(panel.region.y * 1000) / 10}%`,
    width: `${Math.round(panel.region.width * 1000) / 10}%`,
    height: `${Math.round(panel.region.height * 1000) / 10}%`,
  };
  return (
    <section
      className="scene"
      aria-labelledby="scene-panel-heading"
      aria-describedby="scene-description"
    >
      <p id="scene-description" className="visually-hidden">
        {description}
      </p>
      <div
        className="scene__stage"
        style={{
          aspectRatio: `${camera.width} / ${camera.height}`,
          objectPosition: `${cameraCenterX}% ${cameraCenterY}%`,
        }}
      >
        {layers.map((layer) => (
          <img
            key={layer.id}
            className={`scene__layer scene__layer--${layer.role}${
              layer.state === 'response' ? ' scene__layer--response' : ''
            }`}
            src={resolveAssetSrc(layer.src, basePath)}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        ))}
      </div>
      <article className={`scene__panel scene__panel--${panel.position}`} style={panelRegion}>
        <h2 id="scene-panel-heading">{title}</h2>
        {/* Prose may be composed word controls (a paragraph); a block wrapper
            keeps the structure valid when prose is an element, not text. */}
        <div className="scene__panel-prose">{prose}</div>
      </article>
    </section>
  );
}
