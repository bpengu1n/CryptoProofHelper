#!/usr/bin/env python3
"""Regenerate the README QR code that points at the deployed app.

    pip install segno && python3 tools/make_qr.py [url]

The default URL is this repo's GitHub Pages address; pass another if you
forked or renamed the repository.

The actual generator lives in vendor/puzzlepieces/python/pages-qr — change
that there, not here.
"""
import os, subprocess, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.path.insert(0, os.path.join(ROOT, 'vendor', 'puzzlepieces', 'python', 'pages-qr'))
from make_qr import pages_url_from_remote, main as _make_qr_main

DEFAULT = 'https://bpengu1n.github.io/CryptoProofHelper/'

def pages_url():
    try:
        return pages_url_from_remote()
    except Exception:
        return DEFAULT

if __name__ == '__main__':
    out = os.path.join(ROOT, 'docs', 'install-qr.png')
    url = sys.argv[1] if len(sys.argv) > 1 else pages_url()
    sys.argv = [sys.argv[0], out, url]
    _make_qr_main()
