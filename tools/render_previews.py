"""Headless Eevee auto-review preview renderer.

Renders rest/response stills for one built .blend under each style-bible
camera (ipad-landscape, phone-portrait) so the vision auto-review gate and
human approvers see exactly what the slice renderer will frame.

- rest: the bible camera, untouched.
- response: the same camera pushed 10 percent closer to its target, the
  largest motion any tap response may echo in-app.

Run: blender --background --python tools/render_previews.py -- --blend
  art/blender_out/dock.blend --out art/blender_out/previews
Requires: blender 5.2.0.
"""

import argparse
import json
import sys
from pathlib import Path

LAYOUTS = ['ipad-landscape', 'phone-portrait']
POSES = ['rest', 'response']

# Deterministic proofing resolution per layout.
RESOLUTIONS = {
    'ipad-landscape': (2048, 1536),
    'phone-portrait': (1668, 2388),
}


def parse_args() -> argparse.Namespace:
    """Parse preview renderer CLI args.

    Returns:
        Parsed args with blend, out, and root attributes.
    """
    parser = argparse.ArgumentParser(prog='render_previews')
    parser.add_argument('--blend', type=str, required=True)
    parser.add_argument('--out', type=str, required=True)
    parser.add_argument('--root', type=str, default='.')
    return parser.parse_args()


def aim_camera(camera, position: list, target: list) -> None:
    """Point a Blender camera at a target.

    Args:
        camera: Camera object to aim.
        position: [x, y, z] camera location.
        target: [x, y, z] look-at point.
    """
    import mathutils

    camera.location = position
    direction = mathutils.Vector(target) - mathutils.Vector(position)
    camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()


def response_position(position: list, target: list) -> list:
    """Push a camera 10 percent closer to its target.

    Args:
        position: [x, y, z] rest camera location.
        target: [x, y, z] look-at point.

    Returns:
        Moved [x, y, z] location for the response pose.
    """
    return [position[i] + (target[i] - position[i]) * 0.1
            for i in range(3)]


def render_pose(blend: Path, scene_name: str, layout: str, pose: str,
                bible: dict, out: Path) -> Path:
    """Render one layout/pose still with the Eevee engine.

    Args:
        blend: Input .blend file.
        scene_name: Builder name, used in the output stem.
        layout: One of ipad-landscape, phone-portrait.
        pose: One of rest, response.
        bible: Parsed style-bible.json dict.
        out: Destination directory for PNG stills.

    Returns:
        Path to the rendered PNG.
    """
    import bpy

    bpy.ops.wm.open_mainfile(filepath=str(blend))
    camera_def = bible['cameras'][layout]
    position = list(camera_def['position'])
    target = list(camera_def['target'])
    if pose == 'response':
        position = response_position(position, target)

    camera_data = bpy.data.cameras.new(f'proof_{layout}_{pose}')
    camera_data.lens = 24.0 / (2.0 * __import__('math').tan(
        __import__('math').radians(camera_def['fov']) / 2.0))
    camera = bpy.data.objects.new(f'Proof_{layout}_{pose}', camera_data)
    bpy.context.scene.collection.objects.link(camera)
    aim_camera(camera, position, target)
    bpy.context.scene.camera = camera

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    width, height = RESOLUTIONS[layout]
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False

    destination = out / f'{scene_name}_{layout}_{pose}.png'
    scene.render.filepath = str(destination)
    bpy.ops.render.render(write_still=True)
    print(f'[previews] {destination} ({layout}, {pose})')
    return destination


def main() -> None:
    """Render every layout/pose still for one .blend."""
    args = parse_args()
    root = Path(args.root).resolve()
    blend = Path(args.blend)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    bible = json.loads(
        (root / 'art' / 'style-bible.json').read_text(encoding='utf-8'))
    scene_name = blend.stem
    for layout in LAYOUTS:
        for pose in POSES:
            render_pose(blend, scene_name, layout, pose, bible, out)


if __name__ == '__main__':
    sys.exit(main())
