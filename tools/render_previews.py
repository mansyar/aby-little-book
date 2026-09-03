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
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    return parser.parse_args(argv)


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


def srgb_to_linear(channel: float) -> float:
    """Decode one display sRGB channel to linear light.

    Args:
        channel: Display-referred channel in 0..1.

    Returns:
        Linear-light channel in 0..1.
    """
    if channel <= 0.04045:
        return channel / 12.92
    return ((channel + 0.055) / 1.055) ** 2.4


def hex_to_rgb(value: str) -> tuple:
    """Convert a #rrggbb hex color to a 0..1 RGB triple.

    Args:
        value: Hex color string with a leading hash.

    Returns:
        Red, green, blue floats in 0..1.
    """
    value = value.lstrip('#')
    return tuple(srgb_to_linear(int(value[i:i + 2], 16) / 255.0)
                 for i in (0, 2, 4))


def add_sun(name: str, spec: dict, direction: tuple, center: tuple,
            distance: float) -> None:
    """Add a bible-driven SUN light aimed at the subject center.

    SUN lights have no falloff, so framing stays deterministic whatever
    the subject scale is; only the direction carries intent.

    Args:
        name: Light object name.
        spec: Bible light entry with color and energy.
        direction: Unit-ish vector from subject toward the light.
        center: Subject center the light aims at.
        distance: Placement distance from the center.
    """
    import bpy
    import mathutils

    data = bpy.data.lights.new(name, type='SUN')
    data.energy = spec['energy']
    data.color = hex_to_rgb(spec['color'])
    light = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(light)
    light.location = (center[0] + direction[0] * distance,
                      center[1] + direction[1] * distance,
                      center[2] + direction[2] * distance)
    aim = mathutils.Vector(center) - light.location
    light.rotation_euler = aim.to_track_quat('-Z', 'Y').to_euler()


def light_subject(bible: dict) -> None:
    """Light every mesh in the open file with the bible light rig.

    Builders ship geometry and materials but no lights, so unlit Eevee
    proof renders come out black. This applies the key/fill/rim rig and
    the night-sky world background from the style bible.

    Args:
        bible: Parsed style-bible.json dict.
    """
    import bpy
    import mathutils

    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    corners = [o.matrix_world @ mathutils.Vector(c)
               for o in meshes for c in o.bound_box]
    if corners:
        center = tuple(sum(c[i] for c in corners) / len(corners)
                       for i in range(3))
        radius = max(max(c[i] for c in corners) - min(c[i] for c in corners)
                     for i in range(3)) / 2.0 or 1.0
    else:
        center, radius = (0.0, 0.0, 0.0), 1.0

    world = bpy.context.scene.world
    world.use_nodes = True
    background = world.node_tree.nodes['Background']
    background.inputs['Color'].default_value = (
        *hex_to_rgb(bible['palette']['nightSky']), 1.0)

    rig = bible['lightRig']
    distance = radius * 3.0 + 2.0
    add_sun('Proof_Key', rig['key'], (-0.45, -0.75, 0.6), center, distance)
    add_sun('Proof_Fill', rig['fill'], (0.65, -0.35, 0.35), center, distance)
    add_sun('Proof_Rim', rig['rim'], (0.0, 1.0, 0.45), center, distance)


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
    light_subject(bible)
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
    scene.view_settings.view_transform = 'Standard'
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
