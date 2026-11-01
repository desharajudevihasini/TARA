#!/usr/bin/env python3
"""Run this specific TĀRA release on its own port; never use older 5173 tabs."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os, threading, webbrowser
os.chdir(Path(__file__).resolve().parent)
class FreshHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        super().end_headers()
server=None
for port in range(55930, 55980):
    try:
        server=ThreadingHTTPServer(("localhost",port),FreshHandler)
        break
    except OSError:
        continue
if server is None: raise SystemExit("Ports busy: close earlier TĀRA servers and try again.")
url=f"http://localhost:{server.server_port}/?build=deploy-ready-final"
print("\n\n✓ TĀRA — DEPLOY-READY FINAL",flush=True)
print("OPEN THIS URL (not an old localhost:5173 tab):",url,flush=True)
print("Leave Terminal open; Control-C stops the site.\n",flush=True)
threading.Timer(.7,lambda:webbrowser.open_new_tab(url)).start()
try:server.serve_forever()
except KeyboardInterrupt:pass
finally:server.server_close()
