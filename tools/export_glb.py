"""Export the active .blend scene to GLB and report mesh stats.

Run headless: blender --background --python tools/export_glb.py
    -- --blend art/blender_out/dock.blend --glb art/glb/dock.glb

Prints one STATS:<json> line with triangle and bounds info for the
orchestrator (tools/build_all.py) to embed in the scene manifest.
"""
import argparse
import json
import sys
from pathlib import Path

import bpy
from mathutils import Vector

EXPORT_VERSION = '0.1.0'


def parse_args() -> argparse.Namespace:
    """Parse script args passed after the Blender '--' separator.

    Returns:
        Parsed args with blend and glb paths.
    """
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    parser = argparse.ArgumentParser(prog='export_glb')
    parser.add_argument('--blend', type=str, required=True)
    parser.add_argument('--glb', type=str, required=True)
    return parser.parse_args(argv)


def mesh_stats() -> dict:
    """Count exported triangles and world-space bounds.

    Returns:
        Dict with triangles, boundsMin, and boundsMax.
    """
    triangles = 0
    low = [float('inf')] * 3
    high = [float('-inf')] * 3
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
            continue
        mesh = obj.data
        for polygon in mesh.polygons:
            triangles += len(polygon.vertices) - 2
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            for axis in range(3):
                low[axis] = min(low[axis], world[axis])
                high[axis] = max(high[axis], world[axis])
    return {'triangles': triangles, 'boundsMin': low, 'boundsMax': high}


def main() -> None:
    """Open the .blend, export GLB, and print STATS json."""
    args = parse_args()
    bpy.ops.wm.open_mainfile(filepath=args.blend)
    out = Path(args.glb)
    out.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(out), export_format='GLB',
                              export_materials='EXPORT',
                              export_cameras=False, export_lights=False)
    print('STATS:' + json.dumps(mesh_stats()))


if __name__ == '__main__':
    main()
