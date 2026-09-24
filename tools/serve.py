"""Dev server for ClaudeTok.

    python tools/serve.py [port]      (default 8737)

Serves the claudetok folder with caching disabled (so edited videos show up on
reload), and saves POST /upload?video=<id>&name=<file> bodies to
exports/<id>/<file> for tools/export.html.
"""
import os
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAFE = re.compile(r'^[\w.-]+$')


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def log_message(self, *a):
        pass

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        url = urlparse(self.path)
        q = parse_qs(url.query)
        video, name = q.get('video', [''])[0], q.get('name', [''])[0]
        if url.path != '/upload' or not SAFE.match(video) or not SAFE.match(name):
            self.send_error(400)
            return
        out = os.path.join(ROOT, 'exports', video)
        os.makedirs(out, exist_ok=True)
        body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        with open(os.path.join(out, name), 'wb') as f:
            f.write(body)
        self.send_response(204)
        self.end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8737
    print(f'ClaudeTok running at http://localhost:{port}  (Ctrl+C to stop)', flush=True)
    ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
