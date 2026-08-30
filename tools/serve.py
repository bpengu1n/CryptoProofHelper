#!/usr/bin/env python3
"""Serve the app locally. Service workers need http://, not file://.

    python3 tools/serve.py        # then open http://localhost:8000

The actual server lives in vendor/puzzlepieces/python/static-dev-server —
change it there, not here.
"""
import os, runpy, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
sys.argv = [sys.argv[0], sys.argv[1] if len(sys.argv) > 1 else '8000', ROOT]
runpy.run_path(os.path.join(ROOT, 'vendor', 'puzzlepieces', 'python',
                             'static-dev-server', 'serve.py'), run_name='__main__')
