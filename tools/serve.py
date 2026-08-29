#!/usr/bin/env python3
"""Serve the app locally. Service workers need http://, not file://.

    python3 tools/serve.py        # then open http://localhost:8000
"""
import http.server, os, socketserver, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map,
                          **{'.webmanifest': 'application/manifest+json'})
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')   # always see your edits
        super().end_headers()

with socketserver.TCPServer(('', PORT), Handler) as httpd:
    print('serving on http://localhost:%d  (ctrl-c to stop)' % PORT)
    httpd.serve_forever()
