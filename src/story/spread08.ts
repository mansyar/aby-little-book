import type { PackageManifest, SafeRegion } from './contracts';

/**
 * Approved Spread 08 (Share the Light) vertical slice manifest.
 *
 * Sources the production WebP layers exported by the Blender 5.2.0 LTS Eevee
 * soft-clay spike (art/spikes/share-the-light, technical-export-complete).
 * Each layer is a full-frame render of its authored camera; the runtime
 * composites them in layerOrder over a normalized stage. The lamp is the
 * interaction target; fx-lamp-beam and fx-shared-glow are response-state
 * layers shown only when the interaction is activated. Review composites
 * (reference-rest/response) and PNG masters stay out of the runtime image.
 *
 * sha256 values are computed from the committed WebP files and re-verified by
 * the build-time hash validators.
 */
export const SPREAD08_PACKAGE_ID = 'the-starlight-rescue-0.1.0';
export const SPREAD08_STORY_VERSION = '0.1.0';
export const SPREAD08_BASE_PATH = '/stories/the-starlight-rescue-0.1.0';

type SliceRole =
  | 'background'
  | 'distant'
  | 'midground'
  | 'character'
  | 'target'
  | 'foreground'
  | 'effect';

const layer = (
  id: string,
  role: SliceRole,
  order: number,
  layout: 'ipad-landscape' | 'phone-portrait',
  width: number,
  height: number,
  sha256: string,
  state?: 'response',
) => ({
  id,
  role,
  order,
  src: `assets/layers/${layout}/${id}.webp`,
  width,
  height,
  sha256,
  layout,
  ...(state !== undefined ? { state } : {}),
});

const IPAD = 'ipad-landscape';
const PHONE = 'phone-portrait';

export const SPREAD08_MANIFEST: PackageManifest = {
  packageId: SPREAD08_PACKAGE_ID,
  storyId: 'the-starlight-rescue',
  storyVersion: SPREAD08_STORY_VERSION,
  layouts: [
    {
      id: IPAD,
      layerIds: [
        'bg-space',
        'env-moon',
        'shadow-integration',
        'fx-shared-glow',
        'char-aby',
        'char-lumi',
        'fx-lamp-beam',
        'prop-lamp',
        'fg-moon',
      ],
      camera: { x: 0, y: 0, width: 1, height: 0.75 },
      panel: { position: 'side', region: { x: 0.047, y: 0.137, width: 0.371, height: 0.495 } },
    },
    {
      id: PHONE,
      layerIds: [
        'bg-space',
        'env-moon',
        'shadow-integration',
        'fx-shared-glow',
        'char-aby',
        'char-lumi',
        'fx-lamp-beam',
        'prop-lamp',
        'fg-moon',
      ],
      camera: { x: 0, y: 0, width: 1, height: 1.7778 },
      panel: { position: 'bottom', region: { x: 0.067, y: 0.786, width: 0.867, height: 0.172 } },
    },
  ],
  assets: [
    layer(
      'bg-space',
      'background',
      0,
      IPAD,
      2048,
      1536,
      '191f0b5846dc77f15d8b36a32343090169dd8cab819713a2141164d5c8b1ef72',
    ),
    layer(
      'env-moon',
      'distant',
      10,
      IPAD,
      2048,
      1536,
      'fbc478dd0c24814d96aeaa6c054831332d30675efe7c3dc4b0c45c17ed40c083',
    ),
    layer(
      'shadow-integration',
      'midground',
      20,
      IPAD,
      2048,
      1536,
      '8cb13463c747ebe43ccca15557c4dc69fbff0a660f9eff12c8d5ccaeea9d3024',
    ),
    layer(
      'fx-shared-glow',
      'effect',
      25,
      IPAD,
      2048,
      1536,
      'ab74e5dc6411c31cdb2652ef042dca6d16b79f9e93298eaaa19df238f9ff10a4',
      'response',
    ),
    layer(
      'char-aby',
      'character',
      30,
      IPAD,
      2048,
      1536,
      '068d0e8a5a2ae66411dea498b3ccb932bd424b1a657729573ef9c37da2dae41b',
    ),
    layer(
      'char-lumi',
      'character',
      40,
      IPAD,
      2048,
      1536,
      '0c3a0f05138efb6a753c1061fe39e441e713698297c2c866a5470a574134447b',
    ),
    layer(
      'fx-lamp-beam',
      'effect',
      45,
      IPAD,
      2048,
      1536,
      '2c7913705a104131cd72f3053a36e1e1751611e2df53547d26b1f1dbefabc525',
      'response',
    ),
    layer(
      'prop-lamp',
      'target',
      50,
      IPAD,
      2048,
      1536,
      '5b7c07ad9fa28952d25d1809c43cefb48c9e5953a4a26e1994a2f485382bd50a',
    ),
    layer(
      'fg-moon',
      'foreground',
      60,
      IPAD,
      2048,
      1536,
      '94d64ec04e05defd0e93a4635c50a5195b8344d7818b818edd7f26d44e963d08',
    ),
    layer(
      'bg-space',
      'background',
      0,
      PHONE,
      1080,
      1920,
      '30eddc5a139f81a7586b185fa94fa1ebb4727f3b4ea85e288e0f1205e93f72d8',
    ),
    layer(
      'env-moon',
      'distant',
      10,
      PHONE,
      1080,
      1920,
      '71a1205ebddac87715138e76afd25cfb692b0637654f647ec672e98aab9891a5',
    ),
    layer(
      'shadow-integration',
      'midground',
      20,
      PHONE,
      1080,
      1920,
      '47c279b11bdc6b0567fef0ad899dc6208af053cfbd5d973c5af54f16eea30a28',
    ),
    layer(
      'fx-shared-glow',
      'effect',
      25,
      PHONE,
      1080,
      1920,
      '2a9de5bc95f4becc49a91e4da8eb4e70b15b9e93a75d49280cd25d9897c133c6',
      'response',
    ),
    layer(
      'char-aby',
      'character',
      30,
      PHONE,
      1080,
      1920,
      '6f41a85dcfb677a30b2a928c2a89a78920a8a595211d79f160f9b1ecb04e85cc',
    ),
    layer(
      'char-lumi',
      'character',
      40,
      PHONE,
      1080,
      1920,
      '0e4e01f5253c62d20922ab6ff0005f532fb059ae8fd2ee669a873ecda807cad7',
    ),
    layer(
      'fx-lamp-beam',
      'effect',
      45,
      PHONE,
      1080,
      1920,
      '48b680c554c2b75d43bb579df84c1dff29d1e03042a682c0be2cf0e3e05becf3',
      'response',
    ),
    layer(
      'prop-lamp',
      'target',
      50,
      PHONE,
      1080,
      1920,
      '490b7636f291e5e50eb71af6d3cb7ea9cb9d18da2a9cfac305cea677ecf9ad89',
    ),
    layer(
      'fg-moon',
      'foreground',
      60,
      PHONE,
      1080,
      1920,
      'e3fcf8628ff8d6a298ebbfb99b963604783189e57637644646a1b0a9ccfd6152',
    ),
  ],
  totalBytes: 654428,
};

/** Normalized lamp target regions authored from the spike targetBounds. */
export const SPREAD08_LAMP_REGION: Record<'ipad-landscape' | 'phone-portrait', SafeRegion> = {
  'ipad-landscape': { x: 0.958, y: 0.445, width: 0.098, height: 0.13 },
  'phone-portrait': { x: 0.486, y: 0.471, width: 0.156, height: 0.088 },
};
