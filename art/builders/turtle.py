"""Build the shy baby turtle companion for the Starlit Dock scene.

Minimal face only: bead eyes plus blush, no mouth or nose. Kept small
and round so taps feel gentle and the silhouette reads at phone size.

Run headless: blender --background --python art/builders/turtle.py
    -- --seed 7 --out art/blender_out
"""
import argparse
import json
import random
import sys
from pathlib import Path

import bpy

BUILDER_NAME = 'turtle'
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


def build_turtle(bible: dict, seed: int) -> None:
    """Build shell, head, flippers, bead eyes, and blush.

    Args:
        bible: Style bible document.
        seed: Deterministic seed for flipper pose jitter.
    """
    random.seed(seed)
    clay = bible['materials']['clay']
    shell_mat = make_clay('turtle_shell', bible['palette']['turtleShell'],
                          clay['roughness'])
    skin_mat = make_clay('turtle_skin', bible['palette']['turtleSkin'],
                         clay['roughness'])
    eye_mat = make_clay('bead_eye', '#1a1a22', 0.3)
    blush_mat = make_clay('blush', bible['palette']['blush'],
                          clay['roughness'])
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    add_ball('shell', 0.3, (0.0, 0.0, 0.28), (1.0, 0.85, 0.6), shell_mat)
    add_ball('head', 0.13, (0.0, 0.32, 0.3), (1.0, 1.0, 0.9), skin_mat)
    jitter = (random.random() - 0.5) * 0.04
    for side in (-1.0, 1.0):
        add_ball(f'eye_{int(side)}', 0.028,
                 (side * 0.06, 0.42, 0.36), (1.0, 1.0, 1.0), eye_mat)
        add_ball(f'blush_{int(side)}', 0.03,
                 (side * 0.11, 0.38, 0.3), (1.0, 0.6, 0.4), blush_mat)
        for end in (1.0, -1.0):
            add_ball(f'flipper_{int(side)}_{int(end)}', 0.09,
                     (side * 0.28, end * 0.2 + jitter, 0.12),
                     (1.0, 1.3, 0.5), skin_mat)


def main() -> None:
    """Build the turtle and save a versioned .blend for export."""
    args = parse_args()
    bible = load_bible()
    build_turtle(bible, args.seed)
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(
        filepath=str(out / f'{BUILDER_NAME}.blend'))
    print(f'[builder] {BUILDER_NAME} v{BUILDER_VERSION} '
          f'seed={args.seed} bible={bible["version"]}')


if __name__ == '__main__':
    main()
