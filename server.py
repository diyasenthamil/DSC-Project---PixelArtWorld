import http.server
import socketserver
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class ThreadingHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
})

if __name__ == "__main__":
    with ThreadingHTTPServer(("127.0.0.1", 3000), Handler) as httpd:
        print("Server running at http://127.0.0.1:3000", flush=True)
        httpd.serve_forever()
