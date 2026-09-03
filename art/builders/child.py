"""Build the toy-like child companion for the Starlit Dock scene.

Abstract and cute: capsule limbs, bead eyes plus blush, no mouth or
nose, rain-coat color from the bible so the silhouette reads at night.

Run headless: blender --background --python art/builders/child.py
    -- --seed 7 --out art/blender_out
"""
import argparse
import json
import random
import sys
from pathlib import Path

import bpy

BUILDER_NAME = 'child'
BUILDER_VERSION = '0.1.0'


def parse_args() -> argparse.Namespace:
    """Parse script args passed after the Blender '--' separator.

    Returns:
        Parsed args with seed and out attributes.
    """
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    parser = argparse.ArgumentParser(prog=BUILDER_NAME)
    parser.add_argument('--seed', type=int, default=7)
    parser.add_argument('--out', type=str, default='art/blender_out')
    return parser.parse_args(argv)


def load_bible() -> dict:
    """Load the style bible living next to the builders directory.

    Returns:
        The parsed style bible document.
    """
    path = Path(__file__).resolve().parents[1] / 'style-bible.json'
    return json.loads(path.read_text(encoding='utf-8'))


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
    """Convert a #rrggbb string to a Blender linear RGB triple.

    The style bible palette is authored as display sRGB, while Blender
    color inputs and glTF factors are linear, so decode each channel.

    Args:
        value: Hex color string from the style bible.

    Returns:
        Tuple of three linear floats in the 0..1 range.
    """
    value = value.lstrip('#')
    return tuple(srgb_to_linear(int(value[i:i + 2], 16) / 255.0)
                 for i in (0, 2, 4))


def make_clay(name: str, color: str, roughness: float):
    """Create a soft-clay Principled material.

    Args:
        name: Material name.
        color: Hex base color.
        roughness: Principled roughness from the bible.

    Returns:
        The created Blender material.
    """
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    principled = material.node_tree.nodes['Principled BSDF']
    principled.inputs['Base Color'].default_value = (*hex_to_rgb(color), 1.0)
    principled.inputs['Roughness'].default_value = roughness
    return material


def add_ball(name: str, radius: float, location: tuple, scale: tuple,
             material) -> None:
    """Add a material-assigned UV-sphere part.

    Args:
        name: Object name.
        radius: Sphere radius.
        location: XYZ center.
        scale: XYZ squash for the soft-clay feel.
        material: Blender material to assign.
    """
    bpy.ops.mesh.primitive_uv_sphere_add(radius=radius, location=location)
    part = bpy.context.active_object
    part.name = name
    part.scale = scale
    part.data.materials.append(material)


def add_capsule(name: str, radius: float, depth: float, location: tuple,
                material) -> None:
    """Add a material-assigned capsule limb.

    Built from a core cylinder plus two UV spheres: the extra-objects
    capsule primitive is unavailable in background Blender, and every
    builder must run headless.

    Args:
        name: Object name prefix; parts become <name>_mid/<name>_top.
        radius: Capsule radius.
        depth: Capsule mid-section depth.
        location: XYZ center.
        material: Blender material to assign.
    """
    cx, cy, cz = location
    bpy.ops.mesh.primitive_cylinder_add(radius=radius, depth=depth,
                                        location=location)
    mid = bpy.context.active_object
    mid.name = f'{name}_mid'
    mid.data.materials.append(material)
    for end, z in (('top', cz + depth / 2.0), ('bottom', cz - depth / 2.0)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=radius,
                                             location=(cx, cy, z))
        cap = bpy.context.active_object
        cap.name = f'{name}_{end}'
        cap.data.materials.append(material)


def build_child(bible: dict, seed: int) -> None:
    """Build coat body, limbs, head, bead eyes, and blush.

    Args:
        bible: Style bible document.
        seed: Deterministic seed (reserved for pose variation).
    """
    random.seed(seed)
    clay = bible['materials']['clay']
    coat_mat = make_clay('child_coat', bible['palette']['childCoat'],
                         clay['roughness'])
    skin_mat = make_clay('child_skin', bible['palette']['childSkin'],
                         clay['roughness'])
    eye_mat = make_clay('bead_eye', '#1a1a22', 0.3)
    blush_mat = make_clay('blush', bible['palette']['blush'],
                          clay['roughness'])
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    add_capsule('body', 0.22, 0.3, (0.0, 0.0, 0.55), coat_mat)
    for side in (-1.0, 1.0):
        add_capsule(f'leg_{int(side)}', 0.07, 0.2,
                    (side * 0.1, 0.0, 0.15), coat_mat)
        add_capsule(f'arm_{int(side)}', 0.06, 0.22,
                    (side * 0.3, 0.0, 0.6), coat_mat)
    add_ball('head', 0.2, (0.0, 0.0, 1.05), (1.0, 0.95, 1.0), skin_mat)
    for side in (-1.0, 1.0):
        add_ball(f'eye_{int(side)}', 0.03,
                 (side * 0.075, 0.17, 1.1), (1.0, 1.0, 1.0), eye_mat)
        add_ball(f'blush_{int(side)}', 0.035,
                 (side * 0.13, 0.13, 1.02), (1.0, 0.6, 0.4), blush_mat)


def main() -> None:
    """Build the child and save a versioned .blend for export."""
    args = parse_args()
    bible = load_bible()
    build_child(bible, args.seed)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(
        filepath=str(out / f'{BUILDER_NAME}.blend'))
    print(f'[builder] {BUILDER_NAME} v{BUILDER_VERSION} '
          f'seed={args.seed} bible={bible["version"]}')


if __name__ == '__main__':
    main()
