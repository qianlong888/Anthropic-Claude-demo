#!/usr/bin/env python3
"""五子棋 Web 应用（无第三方依赖）。"""

from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

HOST = "0.0.0.0"
PORT = 5000

HTML_TEMPLATE = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>五子棋</title>
  <style>
    :root {
      font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
      color: #1f2937;
      background: #f6f7fb;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
    }
    .container {
      width: min(92vw, 680px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.08);
      padding: 20px;
    }
    h1 {
      margin-top: 0;
      margin-bottom: 10px;
      text-align: center;
    }
    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 14px;
    }
    #status {
      font-size: 16px;
      font-weight: 600;
    }
    button {
      border: none;
      background: #2563eb;
      color: white;
      padding: 10px 14px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover { background: #1e4fbb; }
    .board-wrap {
      overflow: auto;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      background: #fdf8ea;
    }
    canvas {
      display: block;
      margin: 0 auto;
      background: #f7d794;
    }
    .help {
      margin-top: 12px;
      color: #6b7280;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <main class="container">
    <h1>五子棋</h1>
    <div class="toolbar">
      <div id="status">当前回合：黑棋</div>
      <button id="restart-btn" type="button">重新开始</button>
    </div>
    <div class="board-wrap">
      <canvas id="board" width="600" height="600" aria-label="五子棋棋盘"></canvas>
    </div>
    <p class="help">规则：黑棋先手，任意一方先形成连续五子即获胜。点击棋盘交叉点落子。</p>
  </main>
  <script src="/script.js"></script>
</body>
</html>
"""


class GomokuHandler(BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        if self.path in ("/", "/index.html"):
            self._send_response(200, "text/html; charset=utf-8", HTML_TEMPLATE.encode("utf-8"))
            return

        if self.path == "/script.js":
            script_path = Path(__file__).with_name("script.js")
            if not script_path.exists():
                self._send_response(404, "text/plain; charset=utf-8", b"script.js not found")
                return
            self._send_response(200, "application/javascript; charset=utf-8", script_path.read_bytes())
            return

        self._send_response(404, "text/plain; charset=utf-8", b"Not Found")

    def _send_response(self, status_code, content_type, body):
        self.send_response(status_code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def run_server(host=HOST, port=PORT):
    httpd = HTTPServer((host, port), GomokuHandler)
    print(f"Gomoku running at http://127.0.0.1:{port}")
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
