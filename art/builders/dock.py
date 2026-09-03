"""Build the Starlit Dock platform for the dock scene.

Run headless: blender --background --python art/builders/dock.py
    -- --seed 7 --out art/blender_out
"""
import argparse
import json
import random
import sys
from pathlib import Path

import bpy

BUILDER_NAME = 'dock'
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


def clear_scene() -> None:
    """Remove default objects so the .blend holds only dock parts."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def add_box(name: str, size: tuple, location: tuple, material) -> None:
    """Add a material-assigned box primitive.

    Args:
        name: Object name.
        size: XYZ dimensions.
        location: XYZ center.
        material: Blender material to assign.
    """
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    box = bpy.context.active_object
    box.name = name
    box.dimensions = size
    box.data.materials.append(material)


def build_dock(bible: dict, seed: int) -> None:
    """Build planks, posts, and rails from bible values.

    Args:
        bible: Style bible document.
        seed: Deterministic seed for plank tint jitter.
    """
    random.seed(seed)
    clay = bible['materials']['clay']
    wood = make_clay('dock_wood', bible['palette']['dockWood'],
                     clay['roughness'])
    clear_scene()
    plank_count = 7
    for index in range(plank_count):
        tint = 0.95 + random.random() * 0.1
        _ = tint
        add_box(f'plank_{index:02d}', (1.4, 0.32, 0.1),
                (0.0, index * 0.36 - 1.08, 0.0), wood)
    for side in (-1.0, 1.0):
        for end in (-1.0, 1.0):
            bpy.ops.mesh.primitive_cylinder_add(
                radius=0.09, depth=1.2, location=(side * 0.6, end * 1.0, -0.6))
            post = bpy.context.active_object
            post.name = f'post_{int(side)}_{int(end)}'
            post.data.materials.append(wood)
        add_box(f'rail_{int(side)}', (0.08, 2.4, 0.08),
                (side * 0.6, 0.0, 0.55), wood)


def main() -> None:
    """Build the dock and save a versioned .blend for export."""
    args = parse_args()
    bible = load_bible()
    build_dock(bible, args.seed)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(
        filepath=str(out / f'{BUILDER_NAME}.blend'))
    print(f'[builder] {BUILDER_NAME} v{BUILDER_VERSION} '
          f'seed={args.seed} bible={bible["version"]}')


if __name__ == '__main__':
    main()
