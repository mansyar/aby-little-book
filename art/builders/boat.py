"""Build the toy story-boat for the Starlit Dock scene.

Run headless: blender --background --python art/builders/boat.py
    -- --seed 7 --out art/blender_out
"""
import argparse
import json
import random
import sys
from pathlib import Path

import bpy

BUILDER_NAME = 'boat'
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
    """Create a warm emissive paper-lantern material.

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
    emission.inputs['Strength'].default_value = 2.0
    output = nodes['Material Output']
    material.node_tree.links.new(emission.outputs['Emission'],
                                 output.inputs['Surface'])
    return material


def build_boat(bible: dict, seed: int) -> None:
    """Build hull, bench, pole, and paper lantern.

    Args:
        bible: Style bible document.
        seed: Deterministic seed (reserved for trim variation).
    """
    random.seed(seed)
    clay = bible['materials']['clay']
    hull_mat = make_clay('boat_hull', bible['palette']['boatHull'],
                         clay['roughness'])
    wood_mat = make_clay('boat_trim', bible['palette']['dockWood'],
                         clay['roughness'])
    glow_mat = make_glow('lantern_paper', bible['palette']['lanternPaper'])
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, 0.25))
    hull = bpy.context.active_object
    hull.name = 'hull'
    hull.dimensions = (1.6, 0.7, 0.5)
    hull.data.materials.append(hull_mat)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, 0.52))
    bench = bpy.context.active_object
    bench.name = 'bench'
    bench.dimensions = (0.5, 0.6, 0.08)
    bench.data.materials.append(wood_mat)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=1.0,
                                        location=(0.55, 0.0, 0.9))
    pole = bpy.context.active_object
    pole.name = 'lantern_pole'
    pole.data.materials.append(wood_mat)

    bpy.ops.mesh.primitive_ico_sphere_add(radius=0.16,
                                          location=(0.55, 0.0, 1.45))
    lantern = bpy.context.active_object
    lantern.name = 'lantern'
    lantern.data.materials.append(glow_mat)


def main() -> None:
    """Build the boat and save a versioned .blend for export."""
    args = parse_args()
    bible = load_bible()
    build_boat(bible, args.seed)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(
        filepath=str(out / f'{BUILDER_NAME}.blend'))
    print(f'[builder] {BUILDER_NAME} v{BUILDER_VERSION} '
          f'seed={args.seed} bible={bible["version"]}')


if __name__ == '__main__':
    main()
