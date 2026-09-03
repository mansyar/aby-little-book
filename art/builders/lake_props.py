"""Build night-lake props: lily pads, reeds, floating lanterns.

Small set dressing around the dock and boat. Water itself stays a
procedural shader in the app; these are the touchable clay props.

Run headless: blender --background --python art/builders/lake_props.py
    -- --seed 7 --out art/blender_out
"""
import argparse
import json
import random
import sys
from pathlib import Path

import bpy

BUILDER_NAME = 'lake_props'
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


def hex_to_rgb(value: str) -> tuple:
    """Convert a #rrggbb string to a Blender linear RGB triple.

    Args:
        value: Hex color string from the style bible.

    Returns:
        Tuple of three floats in the 0..1 range.
    """
    value = value.lstrip('#')
    return tuple(int(value[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


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


def make_glow(name: str, color: str):
    """Create a warm emissive floating-lantern material.

    Args:
        name: Material name.
        color: Hex emission color.

    Returns:
        The created Blender material.
    """
    material = bpy.data.materials.new(name=name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    emission = nodes.new(type='ShaderNodeEmission')
    emission.inputs['Color'].default_value = (*hex_to_rgb(color), 1.0)
    emission.inputs['Strength'].default_value = 1.5
    output = nodes['Material Output']
    material.node_tree.links.new(emission.outputs['Emission'],
                                 output.inputs['Surface'])
    return material


def build_props(bible: dict, seed: int) -> None:
    """Scatter pads, reeds, and floating lanterns on a ring.

    Args:
        bible: Style bible document.
        seed: Deterministic seed for scatter placement.
    """
    random.seed(seed)
    clay = bible['materials']['clay']
    pad_mat = make_clay('lily_pad', bible['palette']['turtleShell'],
                        clay['roughness'])
    reed_mat = make_clay('reed', '#3f6b4f', clay['roughness'])
    glow_mat = make_glow('float_lantern', bible['palette']['lanternGlow'])
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    for index in range(5):
        angle = seed + index * 1.256
        x = 2.5 + random.random()
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.25 + random.random() * 0.15, depth=0.04,
            location=(x, angle, 0.02))
        pad = bpy.context.active_object
        pad.name = f'lily_pad_{index:02d}'
        pad.data.materials.append(pad_mat)
    for index in range(6):
        x = -2.5 - random.random()
        height = 0.8 + random.random() * 0.5
        bpy.ops.mesh.primitive_cylinder_add(
            radius=0.03, depth=height, location=(x, index * 0.4, height / 2))
        reed = bpy.context.active_object
        reed.name = f'reed_{index:02d}'
        reed.data.materials.append(reed_mat)
    for index in range(3):
        bpy.ops.mesh.primitive_ico_sphere_add(
            radius=0.12, location=(index * 1.2 - 1.2, -2.0, 0.15))
        lantern = bpy.context.active_object
        lantern.name = f'float_lantern_{index:02d}'
        lantern.data.materials.append(glow_mat)


def main() -> None:
    """Build the props and save a versioned .blend for export."""
    args = parse_args()
    bible = load_bible()
    build_props(bible, args.seed)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(
        filepath=str(out / f'{BUILDER_NAME}.blend'))
    print(f'[builder] {BUILDER_NAME} v{BUILDER_VERSION} '
          f'seed={args.seed} bible={bible["version"]}')


if __name__ == '__main__':
    main()
