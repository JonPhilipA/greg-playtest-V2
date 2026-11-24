"""Optional launcher for computers with Python 3 already installed."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import sys
import webbrowser
PORT = 48731
url = 'http://127.0.0.1:%d/?curriculum=1' % PORT
if '--dev' in sys.argv:
    url += '&dev=1'
handler = partial(SimpleHTTPRequestHandler, directory=str(Path(__file__).resolve().parent / 'game'))
with ThreadingHTTPServer(('127.0.0.1', PORT), handler) as server:
    print('G.R.E.G. professor preview\n' + url + '\nPress Ctrl+C to stop.')
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
