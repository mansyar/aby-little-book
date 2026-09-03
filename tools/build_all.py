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
    proc = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if proc.returncode != 0:
        raise RuntimeError(f'command failed: {" ".join(cmd)}\n{proc.stderr}')
    return proc.stdout


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
    print(run(['blender', '--background', '--python',
               str(root / 'art' / 'builders' / f'{builder}.py'),
               '--', '--seed', str(seed),
               '--out', str(out)], root))
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
    output = run(['blender', '--background', '--python',
                  str(tools / 'export_glb.py'), '--',
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
        List of texture manifest entries with src and sha256.
    """
    src_dir = root / 'art' / 'textures_src'
    entries = []
    if not src_dir.is_dir():
        return entries
    for png in sorted(src_dir.glob('*.png')):
        target = ktx_dir / f'{png.stem}.ktx2'
        run(['ktx', 'create', '--format', 'UASTC', str(png), str(target)],
            root)
        entries.append({'src': f'ktx/{target.name}',
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
    for builder in BUILDERS:
        builder_path = root / 'art' / 'builders' / f'{builder}.py'
        blend = build_subject(builder, args.seed, root, tools, out)
        glb, stats = export_subject(builder, blend, root, tools, glb_dir)
        size = glb.stat().st_size
        total += size
        scenes.append({
            'sceneId': builder,
            'source': f'glb/{glb.name}',
            'sha256': sha256_file(glb),
            'triangles': stats['triangles'],
            'maxTriangles': budgets['maxTrianglesPerScene'],
            'pivot': [0, 0, 0],
            'bounds': {'min': stats['boundsMin'],
                       'max': stats['boundsMax']},
            'bakedText': False,
            'textures': textures,
            'tapTargets': [],
            'budgets': budgets,
            'builder': {
                'blender': version,
                'builderName': builder,
                'builderSha': sha256_file(builder_path),
                'styleSha': sha256_file(bible_path),
                'seed': args.seed,
            },
        })
    manifest = {
        'packageId': args.package,
        'storyId': 'the-sharing-tide',
        'storyVersion': '0.1.0',
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
