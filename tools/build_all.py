"""Headless Starlit Dock asset pipeline orchestrator.

Runs every versioned builder in Blender background mode, exports each
.blend to GLB, optimizes with glTF-transform Draco, compresses source
textures to KTX2, and assembles art/manifest/<package>.json carrying
budgets, hashes, builder/style SHAs, and the seed.

Run: python tools/build_all.py --seed 7 --package the-sharing-tide-0.1.0
Requires: blender 5.2.0, gltf-transform, ktx on PATH.
"""
import argparse
import hashlib
import json
import shutil
import struct
import subprocess
import sys
from pathlib import Path

PIPELINE_VERSION = '0.1.0'
BUILDERS = ['dock', 'boat', 'turtle', 'child', 'lake_props']


def parse_args() -> argparse.Namespace:
    """Parse orchestrator CLI args.

    Returns:
        Parsed args with seed, package, and root attributes.
    """
    parser = argparse.ArgumentParser(prog='build_all')
    parser.add_argument('--seed', type=int, default=7)
    parser.add_argument('--package', type=str,
                        default='the-sharing-tide-0.1.0')
    parser.add_argument('--root', type=str, default='.')
    return parser.parse_args()


def resolve(cmd: list) -> list:
    """Resolve a tool through PATH, handling Windows script shims.

    Node-based CLIs (gltf-transform) install as .CMD shims which
    CreateProcess cannot launch directly, so they run via cmd /c.

    Args:
        cmd: Command and arguments, no shell.

    Returns:
        Command with the executable resolved to an absolute path.

    Raises:
        RuntimeError: When the tool is not on PATH.
    """
    found = shutil.which(cmd[0])
    if found is None:
        raise RuntimeError(f'tool not on PATH: {cmd[0]}')
    if found.lower().endswith(('.cmd', '.bat')):
        return ['cmd', '/c', found, *cmd[1:]]
    return [found, *cmd[1:]]


def run(cmd: list, cwd: Path) -> str:
    """Run a command, raising with output on failure.

    Args:
        cmd: Command and arguments, no shell.
        cwd: Working directory for the command.

    Returns:
        Captured standard output.

    Raises:
        RuntimeError: When the command exits nonzero.
    """
    proc = subprocess.run(resolve(cmd), cwd=cwd, capture_output=True,
                          encoding='utf-8', errors='replace')
    if proc.returncode != 0:
        raise RuntimeError(f'command failed: {" ".join(cmd)}\n{proc.stderr}')
    return proc.stdout


KTX2_MAGIC = b'\xabKTX 20\xbb\r\n\x1a\n'


def ktx2_dimensions(path: Path) -> tuple:
    """Read pixel dimensions from a KTX2 header.

    Args:
        path: KTX2 file produced by `ktx create`.

    Returns:
        Tuple of (width, height) in pixels.

    Raises:
        ValueError: When the file is not a KTX2 container.
    """
    with path.open('rb') as handle:
        header = handle.read(28)
    if len(header) < 28 or header[:12] != KTX2_MAGIC:
        raise ValueError(f'not a KTX2 file: {path}')
    width, height = struct.unpack_from('<II', header, 20)
    return width, height


def vec3(triple: list) -> dict:
    """Convert an [x, y, z] stats triple to the manifest vec3 shape.

    Args:
        triple: Three-number list from export stats.

    Returns:
        Dict with x, y, z keys matching the Zod vec3 schema.
    """
    return {'x': triple[0], 'y': triple[1], 'z': triple[2]}


def center3(low: list, high: list) -> dict:
    """Compute the bounds-center interaction pivot for a scene.

    The pivot anchors tap targets and camera framing, so it must lie
    inside the exported bounds by construction.

    Args:
        low: Bounds-minimum [x, y, z] triple from export stats.
        high: Bounds-maximum [x, y, z] triple from export stats.

    Returns:
        Dict with x, y, z keys matching the Zod vec3 schema.
    """
    return {'x': (low[0] + high[0]) / 2.0,
            'y': (low[1] + high[1]) / 2.0,
            'z': (low[2] + high[2]) / 2.0}


def sha256_file(path: Path) -> str:
    """Hash a file with SHA-256.

    Args:
        path: File to hash.

    Returns:
        Lowercase hex digest.
    """
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(65536), b''):
            digest.update(chunk)
    return digest.hexdigest()


def blender_version(cwd: Path) -> str:
    """Report the headless Blender version string.

    Args:
        cwd: Working directory for the command.

    Returns:
        First line of `blender --version`.
    """
    return run(['blender', '--version'], cwd).splitlines()[0]


def build_subject(builder: str, seed: int, root: Path, tools: Path,
                  out: Path) -> Path:
    """Run one builder headless and return its .blend path.

    Args:
        builder: Builder name matching art/builders/<builder>.py.
        seed: Deterministic seed forwarded to the builder.
        root: Repository root.
        tools: Tools directory holding export_glb.py.
        out: Directory for intermediate .blend files.

    Returns:
        Path to the built .blend file.
    """
    del tools
    blend = out / f'{builder}.blend'
    print(run(['blender', '--background', '--python-exit-code', '1',
               '--python', str(root / 'art' / 'builders' / f'{builder}.py'),
               '--', '--seed', str(seed),
               '--out', str(out)], root))
    if not blend.exists():
        raise RuntimeError(f'builder {builder} exited 0 but wrote no .blend')
    return blend


def export_subject(builder: str, blend: Path, root: Path, tools: Path,
                   glb_dir: Path) -> tuple:
    """Export a .blend to optimized GLB and return path plus stats.

    Args:
        builder: Builder name, also the GLB stem.
        blend: Input .blend path.
        root: Repository root.
        tools: Tools directory holding export_glb.py.
        glb_dir: Destination directory for GLB files.

    Returns:
        Tuple of the GLB path and its stats dict.
    """
    glb = glb_dir / f'{builder}.glb'
    output = run(['blender', '--background', '--python-exit-code', '1',
                  '--python', str(tools / 'export_glb.py'), '--',
                  '--blend', str(blend), '--glb', str(glb)], root)
    stats = json.loads([line for line in output.splitlines()
                        if line.startswith('STATS:')][0][len('STATS:'):])
    run(['gltf-transform', 'optimize', str(glb), str(glb),
         '--compress', 'draco'], root)
    return glb, stats


def compress_textures(root: Path, ktx_dir: Path) -> list:
    """Compress source PNG textures to KTX2.

    Args:
        root: Repository root.
        ktx_dir: Destination directory for KTX2 files.

    Returns:
        List of texture manifest entries with id, src, dims, and sha256,
        matching the Zod texture schema.
    """
    src_dir = root / 'art' / 'textures_src'
    entries = []
    if not src_dir.is_dir():
        return entries
    for png in sorted(src_dir.glob('*.png')):
        target = ktx_dir / f'{png.stem}.ktx2'
        run(['ktx', 'create', '--format', 'UASTC', str(png), str(target)],
            root)
        width, height = ktx2_dimensions(target)
        entries.append({'id': png.stem,
                        'src': f'ktx/{target.name}',
                        'width': width,
                        'height': height,
                        'sha256': sha256_file(target)})
    return entries


def main() -> None:
    """Run builders, exports, compression, and write the manifest."""
    args = parse_args()
    root = Path(args.root).resolve()
    tools = root / 'tools'
    out = root / 'art' / 'blender_out'
    glb_dir = root / 'art' / 'glb'
    ktx_dir = root / 'art' / 'ktx'
    for directory in (out, glb_dir, ktx_dir,
                      root / 'art' / 'manifest'):
        directory.mkdir(parents=True, exist_ok=True)

    bible_path = root / 'art' / 'style-bible.json'
    bible = json.loads(bible_path.read_text(encoding='utf-8'))
    budgets = bible['budgets']
    version = blender_version(root)
    print(f'[pipeline] {version} seed={args.seed} '
          f'bible={bible["version"]}')

    textures = compress_textures(root, ktx_dir)
    scenes = []
    total = sum((ktx_dir / entry['src'].split('/')[1]).stat().st_size
                for entry in textures)
    pipeline_sha = sha256_file(tools / 'build_all.py')
    style_sha = sha256_file(bible_path)
    for builder in BUILDERS:
        builder_path = root / 'art' / 'builders' / f'{builder}.py'
        builder_sha = sha256_file(builder_path)
        print(f'[pipeline] builder={builder} sha={builder_sha}')
        blend = build_subject(builder, args.seed, root, tools, out)
        glb, stats = export_subject(builder, blend, root, tools, glb_dir)
        size = glb.stat().st_size
        total += size
        scenes.append({
            'id': builder,
            'glb': f'glb/{glb.name}',
            'sha256': sha256_file(glb),
            'triangles': stats['triangles'],
            'pivot': center3(stats['boundsMin'], stats['boundsMax']),
            'bounds': {'min': vec3(stats['boundsMin']),
                       'max': vec3(stats['boundsMax'])},
            'textures': textures,
            'tapTargets': [],
            'bakedText': False,
            'budgets': {
                'maxTriangles': budgets['maxTrianglesPerScene'],
                'maxTextureBytes': budgets['maxTextureBytes'],
                'maxTotalBytes': budgets['maxSceneBytes'],
            },
        })
    manifest = {
        'packageId': args.package,
        'storyId': 'the-sharing-tide',
        'storyVersion': '0.1.0',
        'builder': {
            'blender': version,
            'builderSha': pipeline_sha,
            'styleSha': style_sha,
            'seed': args.seed,
        },
        'totalBytes': total,
        'scenes': scenes,
    }
    manifest_path = root / 'art' / 'manifest' / f'{args.package}.json'
    manifest_path.write_text(json.dumps(manifest, indent=2),
                             encoding='utf-8')
    print(f'[pipeline] wrote {manifest_path} '
          f'({len(scenes)} scenes, {total} bytes)')


if __name__ == '__main__':
    sys.exit(main())
