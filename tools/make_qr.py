#!/usr/bin/env python3
"""Regenerate the README QR code that points at the deployed app.

    pip install segno && python3 tools/make_qr.py [url]

The default URL is this repo's GitHub Pages address; pass another if you
forked or renamed the repository.
"""
import os, subprocess, sys

DEFAULT = 'https://bpengu1n.github.io/CryptoProofHelper/'

def pages_url():
    """Derive owner/repo from the git remote, falling back to the default."""
    try:
        remote = subprocess.check_output(
            ['git', 'remote', 'get-url', 'origin'], text=True).strip()
    except Exception:
        return DEFAULT
    slug = remote.split('github.com')[-1].lstrip(':/').removesuffix('.git')
    if slug.count('/') != 1:
        return DEFAULT
    owner, repo = slug.split('/')
    return 'https://%s.github.io/%s/' % (owner.lower(), repo)

def main():
    try:
        import segno
    except ImportError:
        sys.exit('segno is needed to regenerate the QR code: pip install segno')
    url = sys.argv[1] if len(sys.argv) > 1 else pages_url()
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..',
                       'docs', 'install-qr.png')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    # Opaque white quiet zone so it scans on both GitHub themes.
    segno.make(url, error='m').save(out, scale=6, border=3,
                                    dark='#000000', light='#ffffff')
    print('wrote', os.path.relpath(out), '->', url)

if __name__ == '__main__':
    main()
