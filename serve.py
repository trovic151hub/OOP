import http.server
import socketserver

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    PORT = 5000
    with socketserver.TCPServer(('0.0.0.0', PORT), NoCacheHandler) as httpd:
        print(f'Serving on port {PORT}')
        httpd.serve_forever()
