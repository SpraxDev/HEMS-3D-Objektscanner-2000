from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import scanner_state

class WebServer(BaseHTTPRequestHandler):
    def do_HEAD(self):
        self.send_response(501)
        self.end_headers()

    def do_GET(self):
        if self.path == "/scan/status":
            self._routeStatus_GET()
            self.end_headers()
        elif self.path == "/scan/start":
            self.send_response(405)
            self.send_header("Allow", "GET, POST")
            self.end_headers()
        elif self.path == "/scan/stop":
            self.send_response(405)
            self.send_header("Allow", "GET, POST")
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/scan/start":
            self._routeStart_POST()
            self.end_headers()
        elif self.path == "/scan/stop":
            self._routeStop_POST()
            self.end_headers()
        elif self.path == "/scan/status":
            self.send_response(405)
            self.send_header("Allow", "GET")
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()

    def _routeStart_POST(self):
        if scanner_state.state == scanner_state.STATE_READY:
            scanner_state.state = scanner_state.STATE_SHOULD_START
            self.send_response(200)
        else:
            self.send_response(409)

    def _routeStop_POST(self):
        if scanner_state.state == scanner_state.STATE_RUNNING:
            scanner_state.state = scanner_state.STATE_SHOULD_STOP
            self.send_response(200)
        else:
            self.send_response(409)

    def _routeStatus_GET(self):
        runningValue = "true" if scanner_state.state == scanner_state.STATE_RUNNING else "false"
        self._sendJsonResponse(200, "{\"running\":" + runningValue + ",\"state\":\"" + scanner_state.state + "\"}")

    def _sendJsonResponse(self, code: int, json: str):
        bodyData = (json + "\n").encode('utf-8')

        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", len(bodyData))
        self.end_headers()
        self.wfile.write(bodyData)
        self.wfile.close()


def _run():
    httpd = HTTPServer(("0.0.0.0", 5000), WebServer)

    print("Starting httpd server on 0.0.0.0:5000 (http://localhost:5000/)")
    httpd.serve_forever()


def startWebServerInOwnThread():
    webServerThread = threading.Thread(target=_run, args=())
    webServerThread.daemon = True
    webServerThread.name = "WebServerThread"
    webServerThread.start()
